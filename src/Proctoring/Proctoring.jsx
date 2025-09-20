import React, { useState } from 'react';
import { useVideoProctoring } from './hooks/useVideoProctoring';
import { Play, Pause } from 'lucide-react';

function Monitor() {
  const {
    status,
    alerts,
    isLoading,
    error,
    isProctoringActive,
    videoRef,
    startCamera,
    stopCamera,
    startProctoring,
    stopProctoring
  } = useVideoProctoring();

  const [isProctoringStarted, setIsProctoringStarted] = useState(false);

  const handleStartProctoring = async () => {
    const cameraStarted = await startCamera();
    if (cameraStarted) {
      const proctoringStarted = startProctoring();
      setIsProctoringStarted(proctoringStarted);
    }
  };

  const handleStopProctoring = () => {
    stopProctoring();
    stopCamera();
    setIsProctoringStarted(false);
  };

  // Get the most recent alert
  const latestAlert = alerts.length > 0 ? alerts[alerts.length - 1] : null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Control Button */}
      <div className="max-w-md mx-auto mb-8">
        {isProctoringActive ? (
          <button
            onClick={handleStopProctoring}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Pause className="w-5 h-5" />
            Stop Proctoring
          </button>
        ) : (
          <button
            onClick={handleStartProctoring}
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Starting...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Proctoring
              </>
            )}
          </button>
        )}
      </div>

      {/* Status JSON Display */}
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Proctoring Status</h2>
        <pre className="bg-gray-50 p-4 rounded-md overflow-auto text-sm">
          {JSON.stringify(status, null, 2)}
        </pre>
      </div>

      {/* Hidden video element for background processing */}
      <div style={{ position: 'fixed', width: '1px', height: '1px', opacity: 0, zIndex: -1 }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    </div>
  );
}

export default Monitor;
