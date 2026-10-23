import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import {
  DetectedObject,
  CategorySummary,
  CapturedSnapshot,
  CameraStatus,
  DetectionSettings,
} from './types/detection';
import { DEMO_SCENES } from './utils/demoScenes';
import { loadCocoModel, runObjectDetection, calculateAverageLuminance } from './services/cocoDetector';
import { getObjectClassColor } from './utils/colors';
import { speechManager } from './utils/speech';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { ControlsPanel } from './components/ControlsPanel';
import { DetectionResultsPanel } from './components/DetectionResultsPanel';
import { SnapshotModal } from './components/SnapshotModal';
import { SettingsModal } from './components/SettingsModal';
import { drawDetections } from './utils/canvasDrawer';

export default function App() {
  // References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const modelRef = useRef<cocoSsd.ObjectDetection | null>(null);
  const lastDetectionTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);

  // State
  const [modelLoading, setModelLoading] = useState(true);
  const [modelStage, setModelStage] = useState('Initializing neural engine...');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  // Detection and Telemetry State
  const [detections, setDetections] = useState<DetectedObject[]>([]);
  const [fps, setFps] = useState(0);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [luminance, setLuminance] = useState(128);

  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedDemoScene, setSelectedDemoScene] = useState<string>(DEMO_SCENES[0].id);

  // User Settings
  const [settings, setSettings] = useState<DetectionSettings>({
    minConfidence: 0.5,
    showBoxes: true,
    showLabels: true,
    speechAlerts: false,
    maxFps: 30,
    boxStyle: 'tech-brackets',
  });

  // UI state
  const [searchFilter, setSearchFilter] = useState('');
  const [highlightCategory, setHighlightCategory] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<CapturedSnapshot[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [shutterFlash, setShutterFlash] = useState(false);

  // Active Demo Scene object
  const currentDemo = useMemo(
    () => DEMO_SCENES.find((s) => s.id === selectedDemoScene) || DEMO_SCENES[0],
    [selectedDemoScene]
  );

  // Play synthesized shutter sound
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {
      // AudioContext may be restricted before user interaction
    }
  }, []);

  // Initialize COCO-SSD Model on Mount
  useEffect(() => {
    let isMounted = true;

    async function initModel() {
      try {
        setModelLoading(true);
        const model = await loadCocoModel((stage) => {
          if (isMounted) setModelStage(stage);
        });
        if (isMounted) {
          modelRef.current = model;
          setModelLoading(false);
        }
      } catch (err) {
        console.error('Failed to load COCO model:', err);
        if (isMounted) {
          setModelStage('Error loading model');
          setModelLoading(false);
          setErrorMessage('Could not load AI model weights. Check network connection.');
        }
      }
    }

    initModel();

    return () => {
      isMounted = false;
    };
  }, []);

  // Stop current camera stream
  const stopCameraStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start Camera Stream
  const startCameraStream = useCallback(async (facing: 'environment' | 'user' = facingMode) => {
    stopCameraStream();
    setErrorMessage(null);
    setCameraStatus('initializing');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API is not supported in this browser environment.');
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((e) => console.warn('Play error:', e));
          setCameraStatus('active');
        };
      }
    } catch (err: unknown) {
      console.warn('Camera access issue:', err);
      const error = err as { name?: string; message?: string };
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        setCameraStatus('permission_denied');
        setErrorMessage(
          'Camera access was denied. Please grant permission in your browser or switch to Demo Mode to test the detector immediately.'
        );
      } else {
        setCameraStatus('error');
        setErrorMessage(
          'No camera found or camera is being used by another application. Try switching to our Demo Mode test scenes.'
        );
      }
    }
  }, [facingMode, stopCameraStream]);

  // Sync canvas size to video or demo image element
  const updateCanvasDimensions = useCallback((srcWidth: number, srcHeight: number) => {
    const canvas = canvasRef.current;
    if (!canvas || srcWidth === 0 || srcHeight === 0) return;

    if (canvas.width !== srcWidth || canvas.height !== srcHeight) {
      canvas.width = srcWidth;
      canvas.height = srcHeight;
    }
  }, []);

  // Continuous Detection Loop
  useEffect(() => {
    let isActive = true;

    const detectFrame = async () => {
      if (!isActive) return;

      const model = modelRef.current;
      const isLiveActive = !isDemoMode && cameraStatus === 'active' && videoRef.current;
      const isDemoActive = isDemoMode && !modelLoading;

      if (model && (isLiveActive || isDemoActive)) {
        const now = performance.now();

        try {
          let mediaElem: HTMLVideoElement | HTMLImageElement | null = null;
          let elemW = 0;
          let elemH = 0;

          if (isLiveActive && videoRef.current) {
            mediaElem = videoRef.current;
            elemW = videoRef.current.videoWidth;
            elemH = videoRef.current.videoHeight;
          } else if (isDemoActive) {
            const demoImg = document.querySelector('img[alt="' + currentDemo.name + '"]') as HTMLImageElement;
            if (demoImg && demoImg.complete && demoImg.naturalWidth > 0) {
              mediaElem = demoImg;
              elemW = demoImg.naturalWidth;
              elemH = demoImg.naturalHeight;
            }
          }

          if (mediaElem && elemW > 0 && elemH > 0) {
            updateCanvasDimensions(elemW, elemH);

            const startTime = performance.now();
            const results = await runObjectDetection(
              model,
              mediaElem,
              settings.minConfidence,
              20
            );
            const endTime = performance.now();

            if (isActive) {
              setInferenceTime(Math.round(endTime - startTime));
              setDetections(results);

              // Calculate FPS via rolling frame interval
              if (lastDetectionTimeRef.current > 0) {
                const delta = now - lastDetectionTimeRef.current;
                const instantFps = 1000 / delta;
                frameTimesRef.current.push(instantFps);
                if (frameTimesRef.current.length > 10) {
                  frameTimesRef.current.shift();
                }
                const avgFps = Math.round(
                  frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
                );
                setFps(avgFps);
              }
              lastDetectionTimeRef.current = now;

              // Check luminance every 15 frames for low light check
              if (Math.random() < 0.1) {
                const lum = calculateAverageLuminance(mediaElem);
                setLuminance(lum);
              }

              // Announce objects via Speech if enabled
              if (settings.speechAlerts && results.length > 0) {
                const classes = results.map((r) => r.class);
                speechManager.announceObjects(classes, true);
              }
            }
          }
        } catch (err) {
          console.warn('Detection frame skip:', err);
        }
      }

      // Schedule next frame
      if (isActive && (cameraStatus === 'active' || isDemoMode)) {
        animationFrameRef.current = requestAnimationFrame(detectFrame);
      }
    };

    if (cameraStatus === 'active' || isDemoMode) {
      animationFrameRef.current = requestAnimationFrame(detectFrame);
    }

    return () => {
      isActive = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    cameraStatus,
    isDemoMode,
    modelLoading,
    currentDemo,
    settings.minConfidence,
    settings.speechAlerts,
    updateCanvasDimensions,
  ]);

  // Automatically start camera on initial load
  useEffect(() => {
    startCameraStream();

    return () => {
      stopCameraStream();
    };
  }, [startCameraStream, stopCameraStream]);

  // Aggregate Category Breakdown
  const categories: CategorySummary[] = useMemo(() => {
    const map = new Map<string, { count: number; highestConfidence: number }>();

    detections.forEach((d) => {
      const cls = d.class.toLowerCase();
      const existing = map.get(cls) || { count: 0, highestConfidence: 0 };
      map.set(cls, {
        count: existing.count + 1,
        highestConfidence: Math.max(existing.highestConfidence, d.score),
      });
    });

    return Array.from(map.entries())
      .map(([category, info]) => ({
        category,
        count: info.count,
        highestConfidence: info.highestConfidence,
        color: getObjectClassColor(category).hex,
      }))
      .sort((a, b) => b.count - a.count);
  }, [detections]);

  // Control Actions
  const handleToggleScan = () => {
    if (cameraStatus === 'active' || cameraStatus === 'paused') {
      stopCameraStream();
      setCameraStatus('stopped');
      setDetections([]);
    } else {
      if (isDemoMode) {
        setIsDemoMode(false);
      }
      startCameraStream();
    }
  };

  const handleTogglePause = () => {
    if (cameraStatus === 'active') {
      setCameraStatus('paused');
    } else if (cameraStatus === 'paused') {
      setCameraStatus('active');
    }
  };

  const handleSwitchCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    startCameraStream(nextFacing);
  };

  const handleToggleDemoMode = () => {
    if (!isDemoMode) {
      stopCameraStream();
      setIsDemoMode(true);
      setCameraStatus('idle');
    } else {
      setIsDemoMode(false);
      startCameraStream();
    }
  };

  const handleSelectDemoScene = (sceneId: string) => {
    setSelectedDemoScene(sceneId);
    setDetections([]);
  };

  // Capture Snapshot
  const handleCaptureSnapshot = () => {
    playShutterSound();
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 200);

    const canvas = canvasRef.current;
    let sourceElem: HTMLVideoElement | HTMLImageElement | null = null;
    let sWidth = 0;
    let sHeight = 0;

    if (!isDemoMode && videoRef.current) {
      sourceElem = videoRef.current;
      sWidth = videoRef.current.videoWidth;
      sHeight = videoRef.current.videoHeight;
    } else if (isDemoMode) {
      const demoImg = document.querySelector('img[alt="' + currentDemo.name + '"]') as HTMLImageElement;
      if (demoImg) {
        sourceElem = demoImg;
        sWidth = demoImg.naturalWidth;
        sHeight = demoImg.naturalHeight;
      }
    }

    if (!sourceElem || sWidth === 0 || sHeight === 0) return;

    // Create export snapshot canvas
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = sWidth;
    snapCanvas.height = sHeight;
    const snapCtx = snapCanvas.getContext('2d');
    if (!snapCtx) return;

    // 1. Draw frame
    snapCtx.drawImage(sourceElem, 0, 0, sWidth, sHeight);

    // 2. Draw detection boxes and watermark
    drawDetections(snapCtx, detections, {
      width: sWidth,
      height: sHeight,
      highlightCategory,
      settings: { ...settings, showBoxes: true, showLabels: true },
      searchFilter,
      isCapturing: true,
    });

    const dataUrl = snapCanvas.toDataURL('image/png');

    const newSnapshot: CapturedSnapshot = {
      id: `snap-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      dataUrl,
      detections: [...detections],
      objectCount: detections.length,
      width: sWidth,
      height: sHeight,
    };

    setSnapshots((prev) => [newSnapshot, ...prev]);
  };

  const handleClearHistory = () => {
    setSnapshots([]);
  };

  const handleDeleteSnapshot = (id: string) => {
    setSnapshots((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSpeech = () => {
    setSettings((prev) => ({
      ...prev,
      speechAlerts: !prev.speechAlerts,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar following Top Bar Contract */}
      <Header
        cameraStatus={cameraStatus}
        isDemoMode={isDemoMode}
        activeDemoName={currentDemo.name}
        fps={fps}
        objectCount={detections.length}
        speechEnabled={settings.speechAlerts}
        onToggleSpeech={handleToggleSpeech}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGallery={() => setIsGalleryOpen(true)}
        snapshotCount={snapshots.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col gap-5">
        {/* Responsive Grid: Live Viewport (Main) & Detection Analytics (Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left/Center Column: Live Camera & Controls */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <CameraView
              videoRef={videoRef}
              canvasRef={canvasRef}
              cameraStatus={cameraStatus}
              errorMessage={errorMessage}
              modelLoading={modelLoading}
              modelStage={modelStage}
              detections={detections}
              fps={fps}
              inferenceTime={inferenceTime}
              luminance={luminance}
              isDemoMode={isDemoMode}
              demoImageUrl={currentDemo.url}
              activeDemoName={currentDemo.name}
              highlightCategory={highlightCategory}
              searchFilter={searchFilter}
              settings={settings}
              shutterFlash={shutterFlash}
              onRetryCamera={() => startCameraStream()}
              onSwitchToDemo={handleToggleDemoMode}
            />

            {/* Bottom Controls Panel */}
            <ControlsPanel
              cameraStatus={cameraStatus}
              isDemoMode={isDemoMode}
              selectedDemoScene={selectedDemoScene}
              hasMultipleCameras={true}
              isDetecting={cameraStatus === 'active' || isDemoMode}
              onToggleScan={handleToggleScan}
              onTogglePause={handleTogglePause}
              onCaptureSnapshot={handleCaptureSnapshot}
              onSwitchCamera={handleSwitchCamera}
              onSelectDemoScene={handleSelectDemoScene}
              onToggleDemoMode={handleToggleDemoMode}
            />
          </div>

          {/* Right Column: Real-Time Detection Analytics & Category Counter */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <DetectionResultsPanel
              detections={detections}
              categories={categories}
              searchFilter={searchFilter}
              onSearchChange={setSearchFilter}
              highlightCategory={highlightCategory}
              onSelectCategory={setHighlightCategory}
            />
          </div>
        </div>
      </main>

      {/* Captured Snapshot History Modal */}
      <SnapshotModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        snapshots={snapshots}
        onClearHistory={handleClearHistory}
        onDeleteSnapshot={handleDeleteSnapshot}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newVals) => setSettings((prev) => ({ ...prev, ...newVals }))}
        currentFps={fps}
      />
    </div>
  );
}
