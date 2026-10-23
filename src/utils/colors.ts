// Vibrant palette for COCO classes, ensuring high legibility and contrast against dark camera feeds

const CLASS_COLORS: Record<string, { hex: string; bg: string; border: string }> = {
  // People
  person: { hex: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4' }, // Cyan

  // Vehicles
  bicycle: { hex: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8' },
  car: { hex: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6' }, // Blue
  motorcycle: { hex: '#60a5fa', bg: 'rgba(96, 165, 250, 0.15)', border: '#60a5fa' },
  airplane: { hex: '#818cf8', bg: 'rgba(129, 140, 248, 0.15)', border: '#818cf8' },
  bus: { hex: '#2563eb', bg: 'rgba(37, 99, 235, 0.15)', border: '#2563eb' },
  train: { hex: '#1d4ed8', bg: 'rgba(29, 78, 216, 0.15)', border: '#1d4ed8' },
  truck: { hex: '#0284c7', bg: 'rgba(2, 132, 199, 0.15)', border: '#0284c7' },
  boat: { hex: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.15)', border: '#0ea5e9' },

  // Electronics & Gadgets
  'cell phone': { hex: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981' }, // Emerald
  laptop: { hex: '#14b8a6', bg: 'rgba(20, 184, 166, 0.15)', border: '#14b8a6' }, // Teal
  mouse: { hex: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: '#34d399' },
  remote: { hex: '#059669', bg: 'rgba(5, 150, 105, 0.15)', border: '#059669' },
  keyboard: { hex: '#2dd4bf', bg: 'rgba(45, 212, 191, 0.15)', border: '#2dd4bf' },
  tv: { hex: '#0d9488', bg: 'rgba(13, 148, 136, 0.15)', border: '#0d9488' },
  microwave: { hex: '#4ade80', bg: 'rgba(74, 222, 128, 0.15)', border: '#4ade80' },
  oven: { hex: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e' },
  toaster: { hex: '#16a34a', bg: 'rgba(22, 163, 74, 0.15)', border: '#16a34a' },
  refrigerator: { hex: '#15803d', bg: 'rgba(21, 128, 61, 0.15)', border: '#15803d' },

  // Animals
  bird: { hex: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b' },
  cat: { hex: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: '#fbbf24' },
  dog: { hex: '#d97706', bg: 'rgba(217, 119, 6, 0.15)', border: '#d97706' },
  horse: { hex: '#b45309', bg: 'rgba(180, 83, 9, 0.15)', border: '#b45309' },
  sheep: { hex: '#fcd34d', bg: 'rgba(252, 211, 77, 0.15)', border: '#fcd34d' },
  cow: { hex: '#ea580c', bg: 'rgba(234, 88, 12, 0.15)', border: '#ea580c' },
  elephant: { hex: '#c2410c', bg: 'rgba(194, 65, 12, 0.15)', border: '#c2410c' },
  bear: { hex: '#9a3412', bg: 'rgba(154, 52, 18, 0.15)', border: '#9a3412' },
  zebra: { hex: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316' },
  giraffe: { hex: '#ffedd5', bg: 'rgba(255, 237, 213, 0.15)', border: '#fed7aa' },

  // Food & Kitchenware
  bottle: { hex: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: '#a855f7' }, // Purple
  'wine glass': { hex: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '#c084fc' },
  cup: { hex: '#9333ea', bg: 'rgba(147, 51, 234, 0.15)', border: '#9333ea' },
  fork: { hex: '#7e22ce', bg: 'rgba(126, 34, 206, 0.15)', border: '#7e22ce' },
  knife: { hex: '#6b21a8', bg: 'rgba(107, 33, 168, 0.15)', border: '#6b21a8' },
  spoon: { hex: '#581c87', bg: 'rgba(88, 28, 135, 0.15)', border: '#581c87' },
  bowl: { hex: '#d8b4fe', bg: 'rgba(216, 180, 254, 0.15)', border: '#d8b4fe' },
  banana: { hex: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308' },
  apple: { hex: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444' },
  sandwich: { hex: '#f97316', bg: 'rgba(249, 115, 22, 0.15)', border: '#f97316' },
  orange: { hex: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', border: '#fb923c' },
  pizza: { hex: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)', border: '#dc2626' },
  donut: { hex: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899' },
  cake: { hex: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: '#f43f5e' },

  // Furniture & Home
  chair: { hex: '#f43f5e', bg: 'rgba(244, 63, 94, 0.15)', border: '#f43f5e' }, // Rose
  couch: { hex: '#e11d48', bg: 'rgba(225, 29, 72, 0.15)', border: '#e11d48' },
  'potted plant': { hex: '#84cc16', bg: 'rgba(132, 204, 22, 0.15)', border: '#84cc16' },
  bed: { hex: '#be123c', bg: 'rgba(190, 18, 60, 0.15)', border: '#be123c' },
  'dining table': { hex: '#fda4af', bg: 'rgba(253, 164, 175, 0.15)', border: '#fda4af' },
  toilet: { hex: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)', border: '#fb7185' },

  // Accessories & Personal Items
  backpack: { hex: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', border: '#eab308' },
  umbrella: { hex: '#06b6d4', bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4' },
  handbag: { hex: '#ca8a04', bg: 'rgba(202, 138, 4, 0.15)', border: '#ca8a04' },
  tie: { hex: '#a16207', bg: 'rgba(161, 98, 7, 0.15)', border: '#a16207' },
  suitcase: { hex: '#854d0e', bg: 'rgba(133, 77, 14, 0.15)', border: '#854d0e' },
  book: { hex: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1' },
  clock: { hex: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6' },
  vase: { hex: '#d946ef', bg: 'rgba(217, 70, 239, 0.15)', border: '#d946ef' },
  scissors: { hex: '#ec4899', bg: 'rgba(236, 72, 153, 0.15)', border: '#ec4899' },
  'teddy bear': { hex: '#f472b6', bg: 'rgba(244, 114, 182, 0.15)', border: '#f472b6' },
  toothbrush: { hex: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8' },
};

const DEFAULT_COLOR = {
  hex: '#38bdf8',
  bg: 'rgba(56, 189, 248, 0.15)',
  border: '#38bdf8',
};

export function getObjectClassColor(className: string): { hex: string; bg: string; border: string } {
  const normalized = className.toLowerCase().trim();
  return CLASS_COLORS[normalized] || DEFAULT_COLOR;
}
