import React, { useState } from 'react';
import { X, Download, Trash2, Calendar, Tag, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { CapturedSnapshot } from '../types/detection';
import { getObjectClassColor } from '../utils/colors';

interface SnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  snapshots: CapturedSnapshot[];
  onClearHistory: () => void;
  onDeleteSnapshot: (id: string) => void;
}

export const SnapshotModal: React.FC<SnapshotModalProps> = ({
  isOpen,
  onClose,
  snapshots,
  onClearHistory,
  onDeleteSnapshot,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<CapturedSnapshot | null>(null);

  if (!isOpen) return null;

  const activeSnapshot = selectedSnapshot || (snapshots.length > 0 ? snapshots[0] : null);

  const handleDownload = (snapshot: CapturedSnapshot) => {
    const a = document.createElement('a');
    a.href = snapshot.dataUrl;
    a.download = `visionscan-ai-${new Date(snapshot.timestamp).toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Detection Snapshots</h3>
              <p className="text-xs text-slate-400">
                {snapshots.length} {snapshots.length === 1 ? 'capture' : 'captures'} stored in local session
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {snapshots.length > 0 && (
              <button
                onClick={onClearHistory}
                className="px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Clear all captured snapshots"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear History</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {snapshots.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-500 mb-4">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-semibold text-slate-300 mb-1">No Snapshots Captured Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Click the shutter button on the bottom control panel while pointing at objects to take a snapshot with labeled bounding boxes.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
            >
              Back to Live Camera
            </button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Main Preview Area */}
            {activeSnapshot && (
              <div className="flex-1 p-4 sm:p-6 flex flex-col gap-3 min-h-0 overflow-y-auto">
                <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group">
                  <img
                    src={activeSnapshot.dataUrl}
                    alt="Captured Detection"
                    className="max-h-[46vh] w-auto object-contain rounded-xl"
                  />
                </div>

                {/* Metadata & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(activeSnapshot.timestamp).toLocaleDateString()}</span>
                      <span>{new Date(activeSnapshot.timestamp).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span className="text-cyan-400 font-semibold">
                        {activeSnapshot.objectCount} {activeSnapshot.objectCount === 1 ? 'object' : 'objects'}
                      </span>
                    </div>

                    {/* Detected Tags */}
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {activeSnapshot.detections.map((det, i) => {
                        const col = getObjectClassColor(det.class);
                        return (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{det.class}</span>
                            <span className="text-slate-500 text-[10px]">
                              {Math.round(det.score * 100)}%
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(activeSnapshot)}
                      className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PNG</span>
                    </button>
                    <button
                      onClick={() => onDeleteSnapshot(activeSnapshot.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 text-slate-400 border border-slate-700/80 transition-colors"
                      title="Delete this capture"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Thumbnail Strip */}
            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-800 p-4 bg-slate-950/50 flex flex-col min-h-0">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
                Snapshot History ({snapshots.length})
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                {snapshots.map((snap) => {
                  const isCur = activeSnapshot?.id === snap.id;
                  return (
                    <button
                      key={snap.id}
                      onClick={() => setSelectedSnapshot(snap)}
                      className={`w-full p-2 rounded-xl border text-left transition-all flex items-center gap-2.5 ${
                        isCur
                          ? 'bg-slate-800 border-cyan-500/80 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <img
                        src={snap.dataUrl}
                        alt="Thumbnail"
                        className="w-14 h-10 object-cover rounded-lg bg-black shrink-0 border border-slate-800"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {snap.objectCount} {snap.objectCount === 1 ? 'object' : 'objects'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {new Date(snap.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
