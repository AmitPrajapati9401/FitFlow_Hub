
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Exercise, WorkoutStats, UserProfile, Landmarks } from '../types';
import { useCamera } from '../hooks/useCamera';
import { usePoseDetector } from '../hooks/usePoseDetector';
import { calculateAngle } from '../utils/poseUtils';
import PoseOverlay from './PoseOverlay';
import { calculateCaloriesBurned } from '../services/db';
import { APP_CONFIG } from '../config';
import { LoadingIcon, ChevronLeftIcon, CheckIcon, CameraIcon, CaptureIcon, SparklesIcon } from './icons/ControlIcons';
import CircularProgress from './CircularProgress';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutTrackerProps {
  user: UserProfile;
  exercise: Exercise;
  onBack: () => void;
  onFinish: (stats: WorkoutStats) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ user, exercise: plan, onBack, onFinish }) => {
  const { videoRef, startCamera, isCameraReady } = useCamera();
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'active' | 'resting'>('idle');
  const [countdown, setCountdown] = useState(APP_CONFIG.INITIAL_COUNTDOWN);
  const [repCount, setRepCount] = useState(0);
  const [timer, setTimer] = useState(0);
  const [totalElapsedTime, setTotalElapsedTime] = useState(0);
  const [feedback, setFeedback] = useState('Position Yourself');
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null);
  const [isFormValid, setIsFormValid] = useState(true);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  
  const moveStateRef = useRef<'up' | 'down'>('up');
  const subIdxRef = useRef(0);
  const currentSub = plan.subExercises?.[subIdxRef.current] || plan;
  const targetReps = currentSub.reps || 10;
  const targetTime = currentSub.holdTime || 30;
  const isTimed = currentSub.type === 'time';

  const onPose = useCallback((detected: Landmarks) => {
    setLandmarks(detected);
    if (phase !== 'active') return;

    if (currentSub.angleLandmarks) {
      const [a, b, c] = currentSub.angleLandmarks;
      if (detected[a] && detected[b] && detected[c]) {
        const deg = calculateAngle(detected[a], detected[b], detected[c]);
        setCurrentAngle(deg);
        const { up, down } = currentSub.angleThresholds!;
        
        if (!isTimed) {
          if (deg > up - 10) {
            if (moveStateRef.current === 'down') {
              setRepCount(r => r + 1);
              setFeedback("GOOD!");
            }
            moveStateRef.current = 'up';
          } else if (deg < down + 10) {
            moveStateRef.current = 'down';
            setFeedback("GO LOWER");
          }
        } else {
          const valid = currentSub.holdPhase === 'up' ? deg > up - 5 : deg < down + 10;
          setIsFormValid(valid);
          setFeedback(valid ? "HOLDING" : "ADJUST FORM");
        }
      } else {
        setFeedback("STAY IN VIEW");
        setIsFormValid(false);
      }
    }
  }, [phase, currentSub, isTimed]);

  const { startDetection, stopDetection, isDetectorReady } = usePoseDetector(videoRef, onPose);

  useEffect(() => {
    if (phase === 'countdown') {
        const int = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { setPhase('active'); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(int);
    } else if (phase === 'active') {
        const int = setInterval(() => {
            setTotalElapsedTime(t => t + 1);
            if (isTimed && isFormValid) setTimer(t => t + 1);
        }, 1000);
        return () => clearInterval(int);
    }
  }, [phase, isTimed, isFormValid]);

  useEffect(() => {
    if (isCameraReady && isDetectorReady && phase === 'active') startDetection();
    else stopDetection();
  }, [isCameraReady, isDetectorReady, phase, startDetection, stopDetection]);

  const finish = () => {
    const cals = user.bmr ? calculateCaloriesBurned(user.bmr, currentSub.metValue, totalElapsedTime) : 0;
    onFinish({ exercise: plan, reps: repCount, duration: totalElapsedTime, calories: cals });
  };

  const handleTakeSnapshot = () => {
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 200);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <div className="absolute inset-0">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover transform scaleX(-1)"></video>
          <PoseOverlay landmarks={landmarks || undefined} videoRef={videoRef} activeLandmarks={currentSub.angleLandmarks} isCorrectForm={isFormValid} />
      </div>

      <AnimatePresence>
        {showFlash && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white z-[100]" />}
      </AnimatePresence>

      <div className="absolute top-0 inset-x-0 p-6 z-[60] bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
        <button onClick={onBack} className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-full p-4 hover:bg-white/20 transition-colors"><ChevronLeftIcon className="w-6 h-6" /></button>
        <div className="bg-zinc-950/50 backdrop-blur-xl px-6 py-2 rounded-full font-mono text-2xl font-black">{Math.floor(totalElapsedTime/60)}:{(totalElapsedTime%60).toString().padStart(2, '0')}</div>
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <AnimatePresence>
          {phase === 'countdown' && (
            <motion.div initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="text-[12rem] font-black text-lime-300 italic z-[70]">{countdown}</motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-8 z-[60] bg-gradient-to-t from-black/90 via-black/40 to-transparent">
        <div className="bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 mb-8 text-center">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-white mb-1">{currentSub.name}</h2>
            <p className={`text-2xl font-black uppercase tracking-widest ${isFormValid ? 'text-lime-300' : 'text-amber-400'}`}>{feedback}</p>
        </div>
        
        <div className="flex justify-center items-center gap-12 mb-10">
            <CircularProgress 
                progress={Math.min(((isTimed ? timer : repCount) / (isTimed ? targetTime : targetReps)) * 100, 100)} 
                label={isTimed ? 'SEC' : 'REPS'} value={isTimed ? timer : repCount} size={120} strokeWidth={12}
            />
            <div className="text-center">
                <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Target</p>
                <p className="text-6xl font-black tracking-tighter">{isTimed ? targetTime : targetReps}</p>
            </div>
        </div>

        {phase === 'idle' ? (
          <button onClick={() => { startCamera(); setPhase('countdown'); }} className="w-full bg-lime-300 text-black font-black py-6 rounded-full text-2xl shadow-2xl hover:bg-lime-400 transition-all uppercase italic tracking-tighter">START WORKOUT</button>
        ) : (
          <button onClick={finish} className="w-full bg-white text-black font-black py-6 rounded-full text-2xl shadow-2xl hover:bg-zinc-200 transition-all uppercase italic tracking-tighter">FINISH WORKOUT</button>
        )}
      </div>
    </div>
  );
};

export default WorkoutTracker;
