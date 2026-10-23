import React from 'react';
import { X, Sliders, Shield, Volume2, Eye, Gauge, Check } from 'lucide-react';
import { DetectionSettings } from '../types/detection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DetectionSettings;
  onUpdateSettings: (newSettings: Partial<DetectionSettings>) => void;
  currentFps: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentFps,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl p-6 flex flex-col gap-5 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Detection Settings</h3>
              <p className="text-xs text-slate-400">Tune AI model sensitivity and visual HUD</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="flex flex-col gap-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* 1. Minimum Confidence Threshold */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="conf-slider" className="font-semibold text-slate-200">
                Minimum Confidence Score
              </label>
              <span className="font-mono text-cyan-400 font-bold tabular-nums">
                {Math.round(settings.minConfidence * 100)}%
              </span>
            </div>
            <input
              id="conf-slider"
              type="range"
              min="0.15"
              max="0.90"
              step="0.05"
              value={settings.minConfidence}
              onChange={(e) =>
                onUpdateSettings({ minConfidence: parseFloat(e.target.value) })
              }
              className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>15% (More objects)</span>
              <span>50% (Recommended)</span>
              <span>90% (Strict)</span>
            </div>
          </div>

          {/* 2. Visual Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Show Boxes */}
            <button
              onClick={() => onUpdateSettings({ showBoxes: !settings.showBoxes })}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                settings.showBoxes
                  ? 'bg-slate-800/90 border-cyan-500/50'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-slate-200">Bounding Boxes</div>
                <div className="text-[11px] text-slate-400">Render boxes on camera</div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  settings.showBoxes
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                {settings.showBoxes && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>

            {/* Show Labels */}
            <button
              onClick={() => onUpdateSettings({ showLabels: !settings.showLabels })}
              className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                settings.showLabels
                  ? 'bg-slate-800/90 border-cyan-500/50'
                  : 'bg-slate-950/50 border-slate-800 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-semibold text-slate-200">Confidence Labels</div>
                <div className="text-[11px] text-slate-400">Class & score tags</div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  settings.showLabels
                    ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                    : 'border-slate-700 bg-slate-900'
                }`}
              >
                {settings.showLabels && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          </div>

          {/* 3. Box Style Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-200">Bounding Box Style</span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'tech-brackets', label: 'Tech Brackets' },
                  { id: 'classic', label: 'Classic Box' },
                  { id: 'minimal', label: 'Minimalist' },
                ] as const
              ).map((style) => (
                <button
                  key={style.id}
                  onClick={() => onUpdateSettings({ boxStyle: style.id })}
                  className={`py-2 px-2.5 rounded-xl border text-center text-xs font-medium transition-all ${
                    settings.boxStyle === style.id
                      ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-300'
                      : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {style.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Text to Speech Voice Alerts */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 shrink-0">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">Voice Audio Announcements</div>
                <div className="text-[11px] text-slate-400">
                  Read detected object names out loud via browser speech synthesis
                </div>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ speechAlerts: !settings.speechAlerts })}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                settings.speechAlerts ? 'bg-cyan-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.speechAlerts ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* 5. Privacy Statement */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40 flex items-start gap-3">
            <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-300">Privacy Guarantee: </span>
              All image and camera frame processing occurs 100% locally in your browser memory using WebGL neural execution. No camera feed is recorded, uploaded, or transmitted anywhere.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
