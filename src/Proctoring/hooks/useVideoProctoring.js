import { useRef, useState, useEffect, useCallback } from 'react';
import { usePersonDetection } from './usePersonDetection';

export const useVideoProctoring = () => {
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const intervalRef = useRef(null);

    const { detectPersons, isLoading, error, modelReady } = usePersonDetection();

    const [isStreamActive, setIsStreamActive] = useState(false);
    const [isProctoringActive, setIsProctoringActive] = useState(false);
    const [detections, setDetections] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [status, setStatus] = useState({
        personCount: 0,
        violations: { multiplePerson: 0, noPerson: 0, total: 0 },
        sessionStartTime: new Date(),
        isActive: false
    });

    const addAlert = useCallback((type, message) => {
        const newAlert = {
            type,
            message,
            timestamp: new Date()
        };
        setAlerts(prev => [...prev, newAlert].slice(-50)); // Keep only last 50 alerts
    }, []);

    const startCamera = useCallback(async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported in this browser');
            }

            const permissionStatus = await navigator.permissions.query({ name: 'camera' });

            if (permissionStatus.state === 'denied') {
                addAlert('error', 'Camera permission denied. Please enable it in browser settings.');
                return false;
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsStreamActive(true);
                addAlert('success', 'Camera started successfully');
                return true;
            }
            return false;
        } catch (err) {
            console.error('Camera access error:', err);

            let errorMessage = 'Failed to access camera';
            if (err.name === 'NotAllowedError') {
                errorMessage = 'Camera access was denied. Please allow camera access to continue.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMessage = 'No camera found on this device.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMessage = 'Camera is already in use by another application.';
            } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
                errorMessage = 'The requested camera resolution is not supported.';
            } else if (err.message === 'Camera API not supported in this browser') {
                errorMessage = 'Your browser does not support camera access.';
            }

            addAlert('error', errorMessage);
            return false;
        }
    }, [addAlert]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsStreamActive(false);
        addAlert('info', 'Camera stopped');
    }, [addAlert]);

    const startProctoring = useCallback(() => {
        if (!isStreamActive || !modelReady) return false;

        setIsProctoringActive(true);
        setStatus(prev => ({
            ...prev,
            isActive: true,
            sessionStartTime: new Date()
        }));
        addAlert('success', 'Proctoring session started');
        return true;
    }, [isStreamActive, modelReady, addAlert]);

    const stopProctoring = useCallback(() => {
        setIsProctoringActive(false);
        setStatus(prev => ({ ...prev, isActive: false }));
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        addAlert('warning', 'Proctoring session stopped');
    }, [addAlert]);

    const resetSession = useCallback(() => {
        setAlerts([]);
        setDetections([]);
        setStatus({
            personCount: 0,
            violations: { multiplePerson: 0, noPerson: 0, total: 0 },
            sessionStartTime: new Date(),
            isActive: isProctoringActive
        });
        addAlert('success', 'Session data reset');
    }, [isProctoringActive, addAlert]);

    const runDetection = useCallback(async () => {
        if (!videoRef.current || !isProctoringActive) return;

        try {
            const results = await detectPersons(videoRef.current);
            setDetections(results);

            const personCount = results.length;

            setStatus(prev => {
                const newViolations = { ...prev.violations };
                let alertAdded = false;

                if (personCount === 0 && prev.personCount !== 0) {
                    newViolations.noPerson++;
                    newViolations.total++;
                    addAlert('error', 'No person detected in frame');
                    alertAdded = true;
                } else if (personCount > 1 && prev.personCount <= 1) {
                    newViolations.multiplePerson++;
                    newViolations.total++;
                    addAlert('warning', `Multiple persons detected (${personCount})`);
                    alertAdded = true;
                } else if (personCount === 1 && prev.personCount !== 1 && !alertAdded) {
                    addAlert('success', 'Single person detected - compliant');
                }

                return {
                    ...prev,
                    personCount,
                    violations: newViolations
                };
            });
        } catch (err) {
            console.error('Detection error:', err);
            addAlert('error', 'Error during person detection');
        }
    }, [detectPersons, isProctoringActive, addAlert]);

    // Effect to handle proctoring interval
    useEffect(() => {
        if (isProctoringActive) {
            intervalRef.current = setInterval(runDetection, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isProctoringActive, runDetection]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            stopCamera();
        };
    }, [stopCamera]);

    // Clean up camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return {
        // State
        status,
        alerts,
        detections,
        isLoading,
        error,
        modelReady,
        isStreamActive,
        isProctoringActive,

        // Methods
        startCamera,
        stopCamera,
        startProctoring,
        stopProctoring,
        resetSession,

        // Refs
        videoRef
    };
};
