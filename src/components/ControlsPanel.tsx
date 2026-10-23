import React from 'react';
import {
  Play,
  Pause,
  Camera,
  SwitchCamera,
  Square,
  Sparkles,
  Layers,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { CameraStatus, DemoScene } from '../types/detection';
import { DEMO_SCENES } from '../utils/demoScenes';

interface ControlsPanelProps {
  cameraStatus: CameraStatus;
  isDemoMode: boolean;
  selectedDemoScene: string;
  hasMultipleCameras: boolean;
  isDetecting: boolean;
  onToggleScan: () => void;
  onTogglePause: () => void;
  onCaptureSnapshot: () => void;
  onSwitchCamera: () => void;
  onSelectDemoScene: (sceneId: string) => void;
  onToggleDemoMode: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  cameraStatus,
  isDemoMode,
  selectedDemoScene,
  hasMultipleCameras,
  isDetecting,
  onToggleScan,
  onTogglePause,
  onCaptureSnapshot,
  onSwitchCamera,
  onSelectDemoScene,
  onToggleDemoMode,
}) => {
  const isRunning = cameraStatus === 'active';
  const isPaused = cameraStatus === 'paused';

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Demo Scene Quick Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              if (isDemoMode) onToggleDemoMode();
            }}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[36px] ${
              !isDemoMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <span className="text-slate-600 font-mono">/</span>

          <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">
            Test Scenes:
          </span>

          {DEMO_SCENES.map((scene) => {
            const isSelected = isDemoMode && selectedDemoScene === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => {
                  if (!isDemoMode) onToggleDemoMode();
                  onSelectDemoScene(scene.id);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap shrink-0 min-h-[36px] flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                <span>{scene.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Bottom Control Deck */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-3 sm:p-4 shadow-xl flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: Scan / Stop & Pause / Resume */}
        <div className="flex items-center gap-2">
          {/* Start / Stop Scan */}
          <button
            onClick={onToggleScan}
            aria-label={isRunning || isPaused ? 'Stop Scan' : 'Start Scan'}
            className={`min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shrink-0 ${
              isRunning || isPaused
                ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/70'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
            }`}
          >
            {isRunning || isPaused ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span className="hidden xs:inline">Stop Scan</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Start Scan</span>
              </>
            )}
          </button>

          {/* Pause / Resume */}
          {(isRunning || isPaused) && (
            <button
              onClick={onTogglePause}
              aria-label={isPaused ? 'Resume Scan' : 'Pause Scan'}
              className={`min-h-[44px] px-3 sm:px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-1.5 border transition-all active:scale-95 whitespace-nowrap shrink-0 ${
                isPaused
                  ? 'bg-amber-950/70 border-amber-700/60 text-amber-300 hover:bg-amber-900/80'
                  : 'bg-slate-800/90 border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {isPaused ? (
                <>
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Resume</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span className="hidden sm:inline">Pause</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Center: Prominent Capture Shutter Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={onCaptureSnapshot}
            disabled={cameraStatus === 'stopped' || cameraStatus === 'error'}
            aria-label="Capture Snapshot with Detections"
            title="Take snapshot with bounding boxes"
            className="group relative min-w-[54px] min-h-[54px] sm:min-w-[58px] sm:min-h-[58px] rounded-full p-1 bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90 transition-all flex items-center justify-center"
          >
            <div className="w-full h-full rounded-full border-2 border-slate-950 flex items-center justify-center bg-slate-900 group-hover:bg-slate-800 transition-colors">
              <Camera className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            </div>
            <span className="sr-only">Capture Snapshot</span>
          </button>
        </div>

        {/* Right Side: Switch Camera / Controls */}
        <div className="flex items-center gap-2">
          {!isDemoMode && (
            <button
              onClick={onSwitchCamera}
              aria-label="Switch Camera (Front / Back)"
              title="Switch Camera (Front/Rear)"
              className="min-h-[44px] px-3 sm:px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <SwitchCamera className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Switch Camera</span>
            </button>
          )}

          {isDemoMode && (
            <button
              onClick={onToggleDemoMode}
              className="min-h-[44px] px-3 sm:px-3.5 py-2 rounded-xl bg-slate-800/90 border border-slate-700/70 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Switch to Camera</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
