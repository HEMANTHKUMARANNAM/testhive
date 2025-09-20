import React, { useState, useEffect, useRef } from 'react';
import { useVideoProctoring } from './hooks/useVideoProctoring';
import { Play, Pause, User, Users, AlertTriangle, Activity } from 'lucide-react';

function Monitor() {
  const {
    status,
    alerts,
    isLoading,
    error,
    isProctoringActive,
    detections,
    videoRef,
    startCamera,
    stopCamera,
    startProctoring,
    stopProctoring
  } = useVideoProctoring();

  const [isProctoringStarted, setIsProctoringStarted] = useState(false);
  const canvasRef = useRef(null);

  // Draw detection overlays
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');

    const updateCanvasSize = () => {
      const vw = video.videoWidth || video.clientWidth || 640;
      const vh = video.videoHeight || video.clientHeight || 360;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = () => {
      updateCanvasSize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isProctoringActive || !detections || detections.length === 0) return;

      const boxColor = '#10b981';
      const warnColor = '#ef4444';
      const textBg = 'rgba(0,0,0,0.6)';
      ctx.lineWidth = 2;
      ctx.font = '12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial';

      detections.forEach((det) => {
        const [x, y, w, h] = det.bbox || [0, 0, 0, 0];
        const score = typeof det.score === 'number' ? det.score : 0;
        const label = `${det.class || 'person'} ${(score * 100).toFixed(0)}%`;
        const color = score < 0.5 ? warnColor : boxColor;

        ctx.strokeStyle = color;
        ctx.strokeRect(x, y, w, h);

        const metrics = ctx.measureText(label);
        const paddingX = 6;
        const paddingY = 4;
        const labelWidth = metrics.width + paddingX * 2;
        const labelHeight = 16 + paddingY;
        ctx.fillStyle = textBg;
        ctx.fillRect(x - 1, y - labelHeight, labelWidth + 2, labelHeight);

        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, x + paddingX, y - paddingY);
      });
    };

    if (video.readyState >= 1) {
      render();
    } else {
      const onLoaded = () => render();
      video.addEventListener('loadedmetadata', onLoaded, { once: true });
      return () => video.removeEventListener('loadedmetadata', onLoaded);
    }

    render();
  }, [detections, isProctoringActive, videoRef]);

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

  const latestAlert = alerts.length > 0 ? alerts[alerts.length - 1] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Exam Proctoring Dashboard</h1>
        {isProctoringActive && (
          <span className="text-xs bg-green-600 text-white px-3 py-1 rounded-full shadow">Proctoring Active</span>
        )}
      </div>

      <div className="max-w-6xl mx-auto mb-6">
        {isProctoringActive ? (
          <button
            onClick={handleStopProctoring}
            className="w-full sm:w-auto bg-red-600 hover:scale-105 active:scale-95 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Pause className="w-5 h-5" />
            Stop Proctoring
          </button>
        ) : (
          <button
            onClick={handleStartProctoring}
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 hover:scale-105 active:scale-95 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border overflow-hidden relative">
          <div className="flex items-center justify-between bg-gray-50 text-gray-800 px-4 py-2 text-sm border-b">
            <div className="font-medium">Live Camera</div>
            <div className="text-xs text-gray-600">
              Detections: <span className="font-semibold">{detections?.length ?? 0}</span>
            </div>
          </div>
          <div className="relative w-full bg-black" style={{ height: 360 }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover rounded-b-2xl"
            />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <svg className="animate-spin h-8 w-8 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
          {error && (
            <div className="p-4 text-sm text-red-700 bg-red-50">{String(error)}</div>
          )}
          {!isProctoringActive && (
            <div className="p-4 text-sm text-gray-600">Click "Start Proctoring" to enable the camera.</div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg border p-5">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Session Stats</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-md p-3 flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1"><Activity className="w-4 h-4" /> Status</span>
              <span className={`px-2 py-0.5 rounded text-white ${status?.isActive ? 'bg-green-600' : 'bg-gray-500'}`}>
                {status?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="bg-gray-50 rounded-md p-3 flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1"><User className="w-4 h-4" /> Person in frame</span>
              <span className="font-medium">{status?.personCount ?? 0}</span>
            </div>
            <div className="bg-gray-50 rounded-md p-3 flex items-center justify-between col-span-2">
              <span className="text-gray-600 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Violations (total)</span>
              <span className="font-semibold">{status?.violations?.total ?? 0}</span>
            </div>
            <div className="bg-gray-50 rounded-md p-3 flex items-center justify-between">
              <span className="text-gray-600">Multiple persons</span>
              <span>{status?.violations?.multiplePerson ?? 0}</span>
            </div>
            <div className="bg-gray-50 rounded-md p-3 flex items-center justify-between">
              <span className="text-gray-600">No person</span>
              <span>{status?.violations?.noPerson ?? 0}</span>
            </div>
            <div className="bg-gray-50 rounded-md p-3 flex items-center justify-between col-span-2">
              <span className="text-gray-600">Session start</span>
              <span>{status?.sessionStartTime ? new Date(status.sessionStartTime).toLocaleString() : '-'}</span>
            </div>
          </div>

          <div className="mt-5">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Latest Alert</h3>
            {latestAlert ? (
              <div
                className={`text-sm p-3 rounded border 
                  ${latestAlert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200'
                    : latestAlert.type === 'error'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-green-50 border-green-200'}`}
              >
                <div className="font-medium capitalize">{latestAlert.type}</div>
                <div className="text-gray-700">{latestAlert.message}</div>
                <div className="text-gray-500 text-xs mt-1">{new Date(latestAlert.timestamp).toLocaleTimeString()}</div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No alerts yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Monitor;
