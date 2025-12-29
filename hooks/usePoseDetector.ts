import React, { useEffect, useState, useRef } from 'react';
import { PoseLandmarker, FilesetResolver, NormalizedLandmark } from '@mediapipe/tasks-vision';
import { Landmarks, LandmarkName } from '../types';
import { APP_CONFIG } from '../config';

const POSE_MAP: Record<number, LandmarkName> = {
  11: 'leftShoulder', 13: 'leftElbow', 15: 'leftWrist',
  12: 'rightShoulder', 14: 'rightElbow', 16: 'rightWrist',
  23: 'leftHip', 25: 'leftKnee', 27: 'leftAnkle',
  24: 'rightHip', 26: 'rightKnee', 28: 'rightAnkle',
};

export const usePoseDetector = (
  videoRef: React.RefObject<HTMLVideoElement>,
  onLandmarks: (landmarks: Landmarks) => void
) => {
  const [landmarker, setLandmarker] = useState<PoseLandmarker | null>(null);
  const [isDetectorReady, setIsDetectorReady] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(APP_CONFIG.WASM_LOADER_PATH);
        const lp = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { 
            modelAssetPath: APP_CONFIG.POSE_DETECTOR_MODEL_PATH, 
            delegate: "GPU" 
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });
        setLandmarker(lp);
        setIsDetectorReady(true);
      } catch (err) {
        console.error("Pose Detector failed to load:", err);
      }
    };
    init();
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      landmarker?.close();
    };
  }, []);

  const predict = () => {
    if (!videoRef.current || !landmarker || videoRef.current.readyState < 2) {
      rafId.current = requestAnimationFrame(predict);
      return;
    }
    
    const results = landmarker.detectForVideo(videoRef.current, performance.now());
    if (results.landmarks && results.landmarks[0]) {
      const appLandmarks: Landmarks = {};
      results.landmarks[0].forEach((lm: NormalizedLandmark, idx: number) => {
        const name = POSE_MAP[idx];
        if (name && (lm.visibility === undefined || lm.visibility > 0.5)) {
          appLandmarks[name] = { x: lm.x, y: lm.y };
        }
      });
      onLandmarks(appLandmarks);
    }
    rafId.current = requestAnimationFrame(predict);
  };

  const startDetection = () => { if (isDetectorReady && !rafId.current) predict(); };
  const stopDetection = () => { if (rafId.current) { cancelAnimationFrame(rafId.current); rafId.current = null; } };

  return { isDetectorReady, startDetection, stopDetection };
};