import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, CameraOff, Play, Pause, RotateCcw } from 'lucide-react';
import { usePersonDetection } from '../hooks/usePersonDetection';
import { VideoCanvas } from './VideoCanvas';
import { AlertPanel } from './AlertPanel';
import { StatsPanel } from './StatsPanel';

export const VideoProctor = () => {
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

  const [isVideoVisible, setIsVideoVisible] = useState(true);

  const addAlert = useCallback((type, message) => {
    const newAlert = {
      type,
      message,
      timestamp: new Date()
    };
    setAlerts(prev => [...prev, newAlert]);
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreamActive(true);
        setIsProctoringActive(true);
        addAlert('success', 'Camera started successfully');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      addAlert('error', 'Failed to access camera');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreamActive(false);
    setIsProctoringActive(false);
    addAlert('warning', 'Camera stopped');
  };

  const startProctoring = () => {
    if (!isStreamActive || !modelReady) return;

    setIsProctoringActive(true);
    setStatus(prev => ({
      ...prev,
      isActive: true,
      sessionStartTime: new Date()
    }));
    addAlert('success', 'Proctoring session started');
  };

  const stopProctoring = () => {
    setIsProctoringActive(false);
    setStatus(prev => ({ ...prev, isActive: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    addAlert('warning', 'Proctoring session stopped');
  };

  const resetSession = () => {
    setAlerts([]);
    setDetections([]);
    setStatus({
      personCount: 0,
      violations: { multiplePerson: 0, noPerson: 0, total: 0 },
      sessionStartTime: new Date(),
      isActive: isProctoringActive
    });
    addAlert('success', 'Session data reset');
  };

  const runDetection = useCallback(async () => {
    if (!videoRef.current || !isProctoringActive) return;

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
  }, [detectPersons, isProctoringActive, addAlert]);

  useEffect(() => {
    if (isProctoringActive) {
      intervalRef.current = setInterval(runDetection, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isProctoringActive, runDetection]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Video Proctoring System
          </h1>
          <p className="text-slate-600">
            Advanced person detection for secure online examinations
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800">Live Feed</h2>
                <div className="flex gap-2">
                  {!isStreamActive ? (
                    <button
                      onClick={startCamera}
                      disabled={isLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Start Camera
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <CameraOff className="w-4 h-4" />
                      Stop Camera
                    </button>
                  )}

                  {isStreamActive && (
                    <>
                      {!isProctoringActive ? (
                        <button
                          onClick={startProctoring}
                          disabled={!modelReady || isLoading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Play className="w-4 h-4" />
                          Start Proctoring
                        </button>
                      ) : (
                        <button
                          onClick={stopProctoring}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                        >
                          <Pause className="w-4 h-4" />
                          Stop Proctoring
                        </button>
                      )}

                      <button
                        onClick={resetSession}
                        disabled={!isProctoringActive}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Reset Session
                      </button>
                      <button
                        onClick={() => setIsVideoVisible(!isVideoVisible)}
                        className={`flex items-center gap-2 px-4 py-2 ${isVideoVisible ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                          } text-white rounded-lg transition-colors`}
                      >
                        {isVideoVisible ? (
                          <>
                            <CameraOff className="w-4 h-4" />
                            Hide Video
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4" />
                            Show Video
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="relative bg-black rounded-lg overflow-hidden">
                <div className={`relative ${isVideoVisible ? 'block' : 'hidden'}`}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                  {videoRef.current && (
                    <VideoCanvas
                      video={videoRef.current}
                      detections={detections}
                      className="absolute inset-0 w-full h-full"
                    />
                  )}
                </div>
                {!isVideoVisible && (
                  <div className="w-full h-64 bg-gray-900 flex items-center justify-center text-white">
                    <div className="text-center">
                      <CameraOff className="w-12 h-12 mx-auto mb-2" />
                      <p>Video feed is hidden</p>
                    </div>
                  </div>
                )}

                {!isStreamActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-70 text-white">
                    <div className="text-center p-6">
                      <CameraOff className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                      <p className="text-lg font-medium">Camera is off</p>
                      <p className="text-sm text-slate-300 mt-1">
                        Click 'Start Camera' to begin
                      </p>
                    </div>
                  </div>
                )}

                {isStreamActive && !isProctoringActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900 bg-opacity-50 text-white">
                    <div className="text-center p-6">
                      <Play className="w-12 h-12 mx-auto mb-4 text-green-400" />
                      <p className="text-lg font-medium">Ready to start proctoring</p>
                      <p className="text-sm text-slate-300 mt-1">
                        Click 'Start Proctoring' to begin monitoring
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  Error: {error.message}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <StatsPanel status={status} />
            <AlertPanel alerts={alerts} />
          </div>
        </div>

        {/* Model Loading Indicator */}
        {isLoading && !modelReady && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Loading detection model...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoProctor;
