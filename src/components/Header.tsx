import React from 'react';
import { Camera, Eye, SlidersHorizontal, Image as ImageIcon, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { CameraStatus } from '../types/detection';

interface HeaderProps {
  cameraStatus: CameraStatus;
  isDemoMode: boolean;
  activeDemoName?: string;
  fps: number;
  objectCount: number;
  speechEnabled: boolean;
  onToggleSpeech: () => void;
  onOpenSettings: () => void;
  onOpenGallery: () => void;
  snapshotCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  cameraStatus,
  isDemoMode,
  activeDemoName,
  fps,
  objectCount,
  speechEnabled,
  onToggleSpeech,
  onOpenSettings,
  onOpenGallery,
  snapshotCount,
}) => {
  return (
    <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
          <Eye className="w-5 h-5 text-slate-950 stroke-[2.5]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              VisionScan AI
            </h1>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-1.5 py-0.5 rounded">
              COCO-SSD
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            On-Device Neural Object Detection
          </p>
        </div>
      </div>

      {/* Zone 2: Status & Telemetry Indicators */}
      <div className="flex items-center gap-3 sm:gap-6 text-xs">
        {/* Status indicator */}
        <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-lg">
          <div
            className={`w-2 h-2 rounded-full ${
              cameraStatus === 'active'
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : cameraStatus === 'paused'
                ? 'bg-amber-400'
                : cameraStatus === 'initializing'
                ? 'bg-cyan-400 animate-pulse'
                : 'bg-rose-500'
            }`}
          />
          <span className="font-medium text-slate-300 capitalize hidden xs:inline">
            {isDemoMode
              ? `Sample: ${activeDemoName || 'Demo'}`
              : cameraStatus === 'active'
              ? 'Camera Active'
              : cameraStatus === 'paused'
              ? 'Paused'
              : cameraStatus === 'initializing'
              ? 'Initializing...'
              : 'Camera Off'}
          </span>
          <span className="text-slate-500 font-mono hidden md:inline">·</span>
          <span className="text-slate-400 font-mono tabular-nums hidden md:inline">
            {fps > 0 ? `${fps} FPS` : '-- FPS'}
          </span>
          <span className="text-slate-500 font-mono hidden md:inline">·</span>
          <span className="text-cyan-400 font-mono tabular-nums hidden md:inline">
            {objectCount} {objectCount === 1 ? 'object' : 'objects'}
          </span>
        </div>
      </div>

      {/* Zone 3: Functional Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Text-to-Speech Toggle */}
        <button
          onClick={onToggleSpeech}
          aria-label={speechEnabled ? 'Disable Voice Alerts' : 'Enable Voice Alerts'}
          title={speechEnabled ? 'Voice Alerts Active' : 'Voice Alerts Muted'}
          className={`p-2 rounded-lg border transition-all text-xs font-medium flex items-center gap-1.5 ${
            speechEnabled
              ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300 shadow-sm shadow-cyan-900/40'
              : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          <span className="hidden lg:inline">{speechEnabled ? 'Voice On' : 'Voice Off'}</span>
        </button>

        {/* Snapshots Gallery */}
        <button
          onClick={onOpenGallery}
          aria-label="View Captured Snapshots"
          className="relative p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all flex items-center gap-1.5"
          title="Captured Snapshots History"
        >
          <ImageIcon className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-medium">Gallery</span>
          {snapshotCount > 0 && (
            <span className="px-1.5 py-0.2 bg-cyan-500 text-slate-950 text-[10px] font-bold rounded-full">
              {snapshotCount}
            </span>
          )}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          aria-label="Open Detection Settings"
          className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80 transition-all"
          title="Detection Settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
