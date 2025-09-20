import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAFakkEC63EK8DA6iemnRQxT_zVIcgdPUs",
  authDomain: "online-exam-and-quiz-platform.firebaseapp.com",
  databaseURL: "https://online-exam-and-quiz-platform-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "online-exam-and-quiz-platform",
  storageBucket: "online-exam-and-quiz-platform.firebasestorage.app",
  messagingSenderId: "961836520899",
  appId: "1:961836520899:web:81fd6ab171f1252bdd5976",
  measurementId: "G-JJXW15DL1H"
};

// Initialize Firebase app (only if it hasn't been initialized yet)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);  // Use the initialized app for auth
const googleProvider = new GoogleAuthProvider();

const database = getDatabase(app);  // Use the initialized app for database

export {
  auth,
  googleProvider,
  signInWithPopup,
  signOut,
  database,
};
