export interface DetectedObject {
  id: string;
  class: string;
  score: number; // 0 to 1
  bbox: [number, number, number, number]; // [x, y, width, height]
  color: string;
  timestamp: number;
}

export interface CategorySummary {
  category: string;
  count: number;
  highestConfidence: number;
  color: string;
}

export interface CapturedSnapshot {
  id: string;
  timestamp: number;
  dataUrl: string;
  detections: DetectedObject[];
  objectCount: number;
  width: number;
  height: number;
}

export type CameraStatus = 'idle' | 'initializing' | 'active' | 'paused' | 'stopped' | 'error' | 'permission_denied';

export interface DetectionSettings {
  minConfidence: number; // 0.1 to 0.95
  showBoxes: boolean;
  showLabels: boolean;
  speechAlerts: boolean;
  maxFps: number; // e.g. 15, 30, 60
  boxStyle: 'tech-brackets' | 'classic' | 'minimal';
}

export interface DemoScene {
  id: string;
  name: string;
  description: string;
  type: 'image' | 'video' | 'synthetic';
  url: string;
}
