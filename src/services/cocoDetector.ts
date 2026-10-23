import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectedObject } from '../types/detection';
import { getObjectClassColor } from '../utils/colors';

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null;
let loadedModel: cocoSsd.ObjectDetection | null = null;

export async function loadCocoModel(
  onProgress?: (stage: string) => void
): Promise<cocoSsd.ObjectDetection> {
  if (loadedModel) return loadedModel;
  if (modelPromise) return modelPromise;

  modelPromise = (async () => {
    onProgress?.('Preparing TensorFlow execution environment...');
    await tf.ready();

    // Prefer webgl backend for high speed GPU acceleration on browser
    try {
      if (tf.getBackend() !== 'webgl') {
        await tf.setBackend('webgl');
      }
    } catch {
      // Fallback to current backend (cpu / wasm) if webgl not available
    }

    onProgress?.('Downloading COCO-SSD neural weights (MobileNet V2)...');
    const model = await cocoSsd.load({
      base: 'mobilenet_v2', // Good balance of accuracy and 30+ FPS speed
    });

    loadedModel = model;
    onProgress?.('Neural network ready');
    return model;
  })();

  return modelPromise;
}

export async function runObjectDetection(
  model: cocoSsd.ObjectDetection,
  mediaElement: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
  minConfidence: number = 0.5,
  maxObjects: number = 20
): Promise<DetectedObject[]> {
  if (!model || !mediaElement) return [];

  // If video is not ready yet, skip frame
  if (mediaElement instanceof HTMLVideoElement) {
    if (mediaElement.readyState < 2 || mediaElement.videoWidth === 0 || mediaElement.videoHeight === 0) {
      return [];
    }
  }

  const rawPredictions = await model.detect(mediaElement, maxObjects, minConfidence);

  const now = Date.now();
  return rawPredictions.map((pred, index) => {
    const color = getObjectClassColor(pred.class).hex;
    return {
      id: `${pred.class}-${index}-${Math.round(pred.bbox[0])}-${Math.round(pred.bbox[1])}`,
      class: pred.class,
      score: pred.score,
      bbox: pred.bbox, // [x, y, width, height]
      color,
      timestamp: now,
    };
  });
}

// Calculate average frame luminance (0-255) to detect low lighting
const lumCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const lumCtx = lumCanvas ? lumCanvas.getContext('2d', { willReadFrequently: true }) : null;

export function calculateAverageLuminance(
  video: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): number {
  if (!lumCanvas || !lumCtx) return 128;

  const w = 32;
  const h = 24;
  lumCanvas.width = w;
  lumCanvas.height = h;

  try {
    lumCtx.drawImage(video, 0, 0, w, h);
    const imgData = lumCtx.getImageData(0, 0, w, h);
    const data = imgData.data;
    let totalLuminance = 0;
    const pixelCount = w * h;

    for (let i = 0; i < data.length; i += 4) {
      // Relative luminance formula: 0.299*R + 0.587*G + 0.114*B
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      totalLuminance += lum;
    }

    return Math.round(totalLuminance / pixelCount);
  } catch {
    return 128; // Fallback normal lighting
  }
}
