import React from 'react';
import { Search, Eye, Filter, Zap, X } from 'lucide-react';
import { DetectedObject, CategorySummary } from '../types/detection';
import { getObjectClassColor } from '../utils/colors';

interface DetectionResultsPanelProps {
  detections: DetectedObject[];
  categories: CategorySummary[];
  searchFilter: string;
  onSearchChange: (val: string) => void;
  highlightCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
}

export const DetectionResultsPanel: React.FC<DetectionResultsPanelProps> = ({
  detections,
  categories,
  searchFilter,
  onSearchChange,
  highlightCategory,
  onSelectCategory,
}) => {
  const totalCount = detections.length;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
            <span>Detection Analytics</span>
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span className="font-mono tabular-nums text-cyan-400 font-semibold">{totalCount}</span>
            <span>detected</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="font-mono tabular-nums text-slate-300">{categories.length}</span>
            <span>categories</span>
          </div>
        </div>

        {highlightCategory && (
          <button
            onClick={() => onSelectCategory(null)}
            className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 border border-cyan-800/50 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
          >
            <span>Showing: {highlightCategory}</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Search Filter Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchFilter}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter classes (e.g., person, laptop, car)..."
          className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-500 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-colors"
        />
        {searchFilter && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Breakdown (Grouped by Category) */}
      <div>
        <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2.5">
          Object Classes Breakdown
        </div>

        {categories.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl">
            No objects currently detected in view
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-2">
            {categories.map((cat) => {
              const isSelected = highlightCategory?.toLowerCase() === cat.category.toLowerCase();
              const colorInfo = getObjectClassColor(cat.category);

              return (
                <button
                  key={cat.category}
                  onClick={() =>
                    onSelectCategory(isSelected ? null : cat.category)
                  }
                  className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-1.5 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-slate-800 border-cyan-400 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-950/50 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0"
                        style={{ backgroundColor: colorInfo.hex }}
                      />
                      <span className="text-xs font-semibold text-slate-200 capitalize truncate">
                        {cat.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-white bg-slate-800 px-1.5 py-0.5 rounded tabular-nums">
                      {cat.count}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Peak conf.</span>
                    <span className="text-cyan-400 font-semibold tabular-nums">
                      {Math.round(cat.highestConfidence * 100)}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Detected Items Stream */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
          <span>Live Detection Stream</span>
          <span className="text-[10px] font-mono lowercase text-slate-500">continuous</span>
        </div>

        <div className="flex-1 max-h-[220px] overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {detections.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500 italic">
              Point camera at objects to detect
            </div>
          ) : (
            detections.map((item, idx) => {
              const colorInfo = getObjectClassColor(item.class);
              const scorePct = Math.round(item.score * 100);
              const isHighlighted =
                highlightCategory && item.class.toLowerCase() === highlightCategory.toLowerCase();

              return (
                <div
                  key={`${item.id}-${idx}`}
                  className={`px-3 py-2 rounded-lg border text-xs flex items-center justify-between gap-3 transition-colors ${
                    isHighlighted
                      ? 'bg-slate-800/90 border-cyan-500/60'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: colorInfo.hex }}
                    />
                    <span className="font-medium text-slate-200 capitalize truncate">
                      {item.class}
                    </span>
                  </div>

                  {/* Confidence Bar & Percentage */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${scorePct}%`,
                          backgroundColor: colorInfo.hex,
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-slate-300 tabular-nums min-w-[34px] text-right">
                      {scorePct}%
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
