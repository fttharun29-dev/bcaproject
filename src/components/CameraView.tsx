import React, { useRef, useEffect } from 'react';
import { Camera, AlertCircle, RefreshCw, Sun, ShieldCheck, Sparkles, Image as ImageIcon } from 'lucide-react';
import { CameraStatus, DetectedObject, DetectionSettings } from '../types/detection';
import { drawDetections } from '../utils/canvasDrawer';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraStatus: CameraStatus;
  errorMessage: string | null;
  modelLoading: boolean;
  modelStage: string;
  detections: DetectedObject[];
  fps: number;
  inferenceTime: number;
  luminance: number;
  isDemoMode: boolean;
  demoImageUrl?: string;
  activeDemoName?: string;
  highlightCategory: string | null;
  searchFilter: string;
  settings: DetectionSettings;
  shutterFlash: boolean;
  onRetryCamera: () => void;
  onSwitchToDemo: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  cameraStatus,
  errorMessage,
  modelLoading,
  modelStage,
  detections,
  fps,
  inferenceTime,
  luminance,
  isDemoMode,
  demoImageUrl,
  activeDemoName,
  highlightCategory,
  searchFilter,
  settings,
  shutterFlash,
  onRetryCamera,
  onSwitchToDemo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const demoImgRef = useRef<HTMLImageElement>(null);

  // Re-draw canvas overlay whenever detections, dimensions, or filters change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawDetections(ctx, detections, {
      width: canvas.width,
      height: canvas.height,
      highlightCategory,
      settings,
      searchFilter,
    });
  }, [detections, highlightCategory, settings, searchFilter, canvasRef]);

  const isLowLight = luminance > 0 && luminance < 38;

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[4/3] sm:aspect-[16/9] max-h-[72vh] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center select-none group"
    >
      {/* 1. Underlying Media (Live Video or Demo Image) */}
      {!isDemoMode ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            cameraStatus === 'active' || cameraStatus === 'paused' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ) : (
        <img
          ref={demoImgRef}
          src={demoImageUrl}
          alt={activeDemoName || 'Demo Scene'}
          className="w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* 2. Real-Time Object Detection Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
      />

      {/* 3. Tech HUD Crosshair Frame */}
      <div className="absolute inset-4 sm:inset-6 pointer-events-none border border-cyan-500/10 rounded-xl z-10 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-500/50" />
          <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-500/50" />
        </div>
        <div className="flex justify-between items-end">
          <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-500/50" />
          <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-500/50" />
        </div>
      </div>

      {/* 4. Scanning Scanline Line (Visual feedback when scanning) */}
      {(cameraStatus === 'active' || isDemoMode) && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-30">
          <div className="w-full h-24 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-scanline" />
        </div>
      )}

      {/* 5. Shutter Flash Animation */}
      {shutterFlash && (
        <div className="absolute inset-0 bg-white z-40 transition-opacity duration-150 animate-out fade-out fill-mode-forwards" />
      )}

      {/* 6. Top Left Info Banner: Real-time Telemetry */}
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/85 backdrop-blur-md border border-slate-700/60 px-2.5 py-1 rounded-md text-[11px] font-mono text-slate-300 flex items-center gap-2 shadow-lg">
          <span className="text-cyan-400 font-semibold">{fps} FPS</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">{inferenceTime}ms inference</span>
          {isDemoMode && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-amber-400 font-medium">Sample Feed</span>
            </>
          )}
        </div>

        {/* Low Lighting Warning */}
        {isLowLight && (
          <div className="bg-amber-950/80 backdrop-blur-md border border-amber-600/50 text-amber-200 px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 shadow-lg animate-pulse">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Low Light Detected</span>
          </div>
        )}
      </div>

      {/* 7. Bottom Privacy Badge */}
      <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-5 z-20 hidden xs:flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-900/80 backdrop-blur-md border border-slate-800 px-2.5 py-1 rounded-md">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span>Local On-Device AI</span>
      </div>

      {/* 8. Model Loading Screen Overlay */}
      {modelLoading && (
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 border border-cyan-800/80 flex items-center justify-center mb-4 text-cyan-400 relative">
            <RefreshCw className="w-7 h-7 animate-spin" />
            <div className="absolute -inset-1 rounded-2xl bg-cyan-500/20 blur-md -z-10" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">Initializing Neural Network</h3>
          <p className="text-xs text-slate-400 max-w-sm mb-4 font-mono">
            {modelStage || 'Loading COCO-SSD weights with WebGL GPU acceleration...'}
          </p>
          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* 9. Camera Permission / Hardware Error State */}
      {!isDemoMode && (cameraStatus === 'error' || cameraStatus === 'permission_denied') && (
        <div className="absolute inset-0 bg-slate-950/95 z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/70 flex items-center justify-center mb-4 text-rose-400">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1.5">
            {cameraStatus === 'permission_denied' ? 'Camera Permission Needed' : 'Camera Unavailable'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            {errorMessage ||
              'Unable to access your device camera. Please grant camera permission in your browser or try switching to our high-resolution demo scenes to test object detection right now.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onRetryCamera}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Camera
            </button>
            <button
              onClick={onSwitchToDemo}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              Use Demo Scenes
            </button>
          </div>
        </div>
      )}

      {/* 10. Camera Stopped / Idle State */}
      {!isDemoMode && cameraStatus === 'stopped' && (
        <div className="absolute inset-0 bg-slate-950/90 z-20 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-3 text-slate-400">
            <Camera className="w-7 h-7" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">Camera Feed Stopped</h3>
          <p className="text-xs text-slate-400 max-w-xs mb-4">
            Press &quot;Start Scan&quot; below to reactivate camera detection.
          </p>
          <button
            onClick={onRetryCamera}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
          >
            Start Camera
          </button>
        </div>
      )}

      {/* 11. Paused Indicator */}
      {cameraStatus === 'paused' && (
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] z-20 flex items-center justify-center">
          <div className="bg-slate-900/90 border border-amber-500/40 px-4 py-2 rounded-xl text-amber-300 font-medium text-xs flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Detection Paused · Tap Resume to continue
          </div>
        </div>
      )}
    </div>
  );
};
