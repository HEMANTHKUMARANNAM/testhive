import React, { createContext, useState, useContext, useEffect } from 'react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';

import { auth } from '../firebase'; // This now points to the second firebase config



import { ref, set, onValue, onDisconnect, remove, update } from 'firebase/database';
import { database } from '../firebase'; // Firebase configuration

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionEnforced, setSessionEnforced] = useState(true);

  // session management refs
  const sessionIdRef = React.useRef(null);
  const sessionUnsubRef = React.useRef(null);
  const heartbeatRef = React.useRef(null);
  const sessionPathRef = React.useRef(null);

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser);
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL
        });
      } else {
        console.log('No user found, setting user to null');
        setUser(null);
        // cleanup session when no user
        cleanupSessionListeners();
      }
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  // Initialize single-session enforcement when user changes
  useEffect(() => {
    if (!user?.uid || !sessionEnforced) return;

    initSingleSession(user.uid);

    return () => {
      // component unmount or user switched
      cleanupSessionListeners();
    };
  }, [user?.uid, sessionEnforced]);

  const initSingleSession = async (uid) => {
    try {
      // Create or reuse a client session id
      const newSessionId = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2);
      sessionIdRef.current = newSessionId;
      sessionPathRef.current = `sessions/${uid}`;
      const sRef = ref(database, sessionPathRef.current);

      // Claim the session (this will override any previous session and cause other clients to logout)
      await set(sRef, {
        sessionId: newSessionId,
        updatedAt: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
      });

      // Remove this session on disconnect
      try {
        await onDisconnect(sRef).remove();
      } catch (e) {
        console.warn('onDisconnect setup failed (non-fatal):', e);
      }

      // Listen for changes to the session; if it no longer matches, logout
      sessionUnsubRef.current = onValue(sRef, (snap) => {
        const val = snap.val();
        if (!val) return; // path removed: ignore, likely disconnect cleanup
        if (val.sessionId && val.sessionId !== sessionIdRef.current) {
          // Another session took over
          console.warn('Another session detected. Logging out this client.');
          logout(true);
        }
      });

      // Heartbeat to keep updatedAt fresh
      heartbeatRef.current = window.setInterval(() => {
        update(sRef, { updatedAt: Date.now() }).catch(() => {});
      }, 20_000); // every 20s
    } catch (e) {
      console.error('Failed to initialize single-session enforcement:', e);
    }
  };

  const cleanupSessionListeners = () => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
    if (sessionUnsubRef.current) {
      try { sessionUnsubRef.current(); } catch (_) {}
      sessionUnsubRef.current = null;
    }
    sessionIdRef.current = null;
    sessionPathRef.current = null;
  };

  const googleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await set(ref(database, `users/${result.user.uid}`), {
        email: result.user.email,
        name: result.user.displayName,
        profilePhoto: result.user.photoURL
      });
      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = async (isAuto = false) => {
    try {
      // Try to remove the session record
      const uid = auth.currentUser?.uid || user?.uid;
      if (uid) {
        try {
          await remove(ref(database, `sessions/${uid}`));
        } catch (_) {}
      }

      cleanupSessionListeners();
      await firebaseSignOut(auth);
      setUser(null);
      if (isAuto) {
        // Optional: show a toast/banner; using alert for simplicity
        // eslint-disable-next-line no-alert
        alert('You have been logged out because your account was signed in from another device or tab.');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const login = async ({ email, password }) => {
    // For email/password login (if implemented)
    // Note: You'll need to implement email/password auth in firebase.js
    throw new Error("Email/password login not implemented yet");
  };

  const value = {
    user,
    loading,
    googleSignIn,
    logout,
    login
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);