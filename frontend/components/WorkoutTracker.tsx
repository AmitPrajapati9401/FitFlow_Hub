
import React, { useState, useRef, useEffect, useCallback, useReducer } from 'react';
import { Exercise, WorkoutStats, UserProfile, Landmarks } from '../types';
import { useCamera } from '../hooks/useCamera';
import { usePoseDetector } from '../hooks/usePoseDetector';
import { calculateAngle } from '../utils/poseUtils';
import PoseOverlay from './PoseOverlay';
import { calculateCaloriesBurned } from '../services/db';
import { APP_CONFIG } from '../config';
import { LoadingIcon, RetryIcon, PauseIcon, ChevronLeftIcon, CheckIcon, CameraIcon, CaptureIcon, SparklesIcon } from './icons/ControlIcons';
import CircularProgress from './CircularProgress';
import { motion, AnimatePresence } from 'framer-motion';

type WorkoutPhase = 'idle' | 'starting' | 'countdown' | 'exercising' | 'paused' | 'resting' | 'error';
interface WorkoutState {
    phase: WorkoutPhase;
    currentExerciseIndex: number;
    currentSet: number;
    restCountdown: number | null;
    initialCountdown: number | null;
    totalElapsedTime: number;
    errorMessage: string | null;
}
type WorkoutAction =
    | { type: 'START_REQUEST' }
    | { type: 'CAMERA_READY' }
    | { type: 'COUNTDOWN_TICK' }
    | { type: 'TOGGLE_PAUSE' }
    | { type: 'TICK_SECOND'; }
    | { type: 'FINISH_SET'; payload: { isLastSet: boolean; isLastExercise: boolean } }
    | { type: 'REST_TICK' }
    | { type: 'FINISH_REST'; payload: { isNewExercise: boolean } }
    | { type: 'RESET'; payload: Exercise };

const createInitialState = (): WorkoutState => ({
    phase: 'idle', currentExerciseIndex: 0, currentSet: 1, restCountdown: null,
    initialCountdown: null, totalElapsedTime: 0, errorMessage: null,
});

function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
    switch (action.type) {
        case 'START_REQUEST': return { ...state, phase: 'starting' };
        case 'CAMERA_READY': return { ...state, phase: 'countdown', initialCountdown: APP_CONFIG.INITIAL_COUNTDOWN };
        case 'COUNTDOWN_TICK':
            if (state.initialCountdown === null || state.initialCountdown <= 1) return { ...state, phase: 'exercising', initialCountdown: null };
            return { ...state, initialCountdown: state.initialCountdown - 1 };
        case 'TOGGLE_PAUSE': return { ...state, phase: state.phase === 'paused' ? 'exercising' : 'paused' };
        case 'TICK_SECOND': return { ...state, totalElapsedTime: state.totalElapsedTime + 1 };
        case 'FINISH_SET': {
            const { isLastSet, isLastExercise } = action.payload;
            if (isLastSet && isLastExercise) return state;
            return { ...state, phase: 'resting', restCountdown: APP_CONFIG.REST_PERIOD };
        }
        case 'REST_TICK':
            if (state.restCountdown === null || state.restCountdown <= 1) return state;
            return { ...state, restCountdown: state.restCountdown - 1 };
        case 'FINISH_REST': return {
            ...state, phase: 'exercising', restCountdown: null,
            currentExerciseIndex: action.payload.isNewExercise ? state.currentExerciseIndex + 1 : state.currentExerciseIndex,
            currentSet: action.payload.isNewExercise ? 1 : state.currentSet + 1,
        };
        default: return state;
    }
}

interface WorkoutTrackerProps {
  user: UserProfile;
  exercise: Exercise;
  onBack: () => void;
  onFinish: (stats: WorkoutStats) => void;
}

const WorkoutTracker: React.FC<WorkoutTrackerProps> = ({ user, exercise: plan, onBack, onFinish }) => {
  const { videoRef, startCamera, isCameraReady } = useCamera();
  const exercises = plan.subExercises || [];
  const [state, dispatch] = useReducer(workoutReducer, createInitialState());
  const { phase, currentExerciseIndex, currentSet, restCountdown, initialCountdown, totalElapsedTime } = state;
  
  const [repCount, setRepCount] = useState(0);
  const [exerciseTimer, setExerciseTimer] = useState(0);
  const [feedback, setFeedback] = useState('Position Yourself');
  const [landmarks, setLandmarks] = useState<Landmarks | null>(null);
  const [isFormValid, setIsFormValid] = useState(true);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [showFlash, setShowFlash] = useState(false);
  const [captureMessage, setCaptureMessage] = useState<string | null>(null);
  
  const exercisePhaseRef = useRef<'start' | 'mid' | null>(null);
  const prevFormValidRef = useRef<boolean>(true);
  const currentExercise = exercises[currentExerciseIndex];
  const isTimed = currentExercise?.type === 'time';
  const targetReps = currentExercise?.reps || 10;
  const targetTime = currentExercise?.holdTime || 30;
  const totalSets = currentExercise?.sets || 1;

  const workoutStatsRef = useRef({ totalReps: 0, totalCalories: 0, breakdown: [] as any[] }).current;

  const handleLandmarks = useCallback((detected: Landmarks) => {
      setLandmarks(detected);
      if (phase !== 'exercising' || !currentExercise) return;

      if (currentExercise.angleLandmarks && currentExercise.angleThresholds) {
          const [p1, p2, p3] = currentExercise.angleLandmarks;
          if (detected[p1] && detected[p2] && detected[p3]) {
              const angle = calculateAngle(detected[p1], detected[p2], detected[p3]);
              setCurrentAngle(angle);
              const { up, down } = currentExercise.angleThresholds;
              
              if (!isTimed) {
                  if (angle > up - 8) {
                      if (exercisePhaseRef.current === 'mid') {
                          setRepCount(r => r + 1);
                          setFeedback("PERFECT!");
                          // Haptic feedback for rep completion
                          if ('vibrate' in navigator) navigator.vibrate(50);
                          exercisePhaseRef.current = 'start';
                      } else {
                          setFeedback("GO LOWER");
                          exercisePhaseRef.current = 'start';
                      }
                  } else if (angle < down + 8) {
                      // Haptic feedback for hitting target depth (transitioning to correct form)
                      if (exercisePhaseRef.current === 'start' && 'vibrate' in navigator) navigator.vibrate(20);
                      exercisePhaseRef.current = 'mid';
                      setFeedback("PUSH UP");
                  }
                  setIsFormValid(true);
              } else {
                  const valid = currentExercise.holdPhase === 'up' ? angle > up - 5 : angle < down + 10;
                  
                  // Haptic feedback when form becomes valid
                  if (valid && !prevFormValidRef.current && 'vibrate' in navigator) {
                    navigator.vibrate(20);
                  }
                  
                  prevFormValidRef.current = valid;
                  setIsFormValid(valid);
                  setFeedback(valid ? "HOLDING STRONG" : "ADJUST FORM");
              }
          } else {
              setFeedback("FULL BODY IN VIEW");
              setIsFormValid(false);
          }
      }
  }, [phase, currentExercise, isTimed]);

  const { startDetection, stopDetection, isDetectorReady } = usePoseDetector(videoRef, handleLandmarks);

  const handleFinishSet = useCallback(() => {
    const isLastSet = currentSet >= totalSets;
    const isLastEx = currentExerciseIndex >= exercises.length - 1;
    if (!isTimed) workoutStatsRef.totalReps += repCount;
    if (isLastSet) workoutStatsRef.breakdown.push({ 
        id: currentExercise.id, name: currentExercise.name, 
        value: isTimed ? `${totalSets}x${targetTime}s` : `${totalSets}x${targetReps}` 
    });

    if (isLastSet && isLastEx) {
        onFinish({
            exercise: plan, reps: workoutStatsRef.totalReps,
            duration: totalElapsedTime, calories: Math.round(workoutStatsRef.totalCalories),
            exerciseBreakdown: workoutStatsRef.breakdown,
        });
    } else {
        dispatch({ type: 'FINISH_SET', payload: { isLastSet, isLastExercise: isLastEx } });
    }
  }, [currentSet, totalSets, currentExerciseIndex, exercises.length, repCount, onFinish, plan, totalElapsedTime, currentExercise, isTimed, targetTime, targetReps]);

  const handleTakeSnapshot = () => {
    setShowFlash(true);
    setCaptureMessage("Analysis saved: assets/screenshots/");
    setTimeout(() => setShowFlash(false), 200);
    setTimeout(() => setCaptureMessage(null), 3500);
  };

  useEffect(() => {
    if (phase !== 'exercising') return;
    if (isTimed ? exerciseTimer >= targetTime : repCount >= targetReps) handleFinishSet();
  }, [phase, repCount, exerciseTimer, isTimed, targetTime, targetReps, handleFinishSet]);

  useEffect(() => {
    if (!['exercising', 'resting', 'countdown'].includes(phase)) return;
    const interval = setInterval(() => {
        if (phase === 'countdown') dispatch({ type: 'COUNTDOWN_TICK' });
        else if (phase === 'exercising') {
            const cal = user.bmr && currentExercise.metValue ? calculateCaloriesBurned(user.bmr, currentExercise.metValue, 1) : 0;
            workoutStatsRef.totalCalories += cal;
            dispatch({ type: 'TICK_SECOND' });
            if (isTimed && isFormValid) setExerciseTimer(t => t + 1);
        } else if (phase === 'resting') {
            if (restCountdown && restCountdown > 1) dispatch({ type: 'REST_TICK' });
            else {
                dispatch({ type: 'FINISH_REST', payload: { isNewExercise: currentSet >= totalSets } });
                setRepCount(0); setExerciseTimer(0);
            }
        }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, user.bmr, currentExercise, restCountdown, currentSet, totalSets, isTimed, isFormValid]);
  
  useEffect(() => { if (isCameraReady && phase === 'starting') dispatch({ type: 'CAMERA_READY' }); }, [isCameraReady, phase]);
  useEffect(() => {
      if (isCameraReady && isDetectorReady && phase === 'exercising') startDetection();
      else stopDetection();
      return () => stopDetection();
  }, [isCameraReady, isDetectorReady, phase, startDetection, stopDetection]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      <div className="absolute inset-0">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover transform scaleX(-1)"></video>
          <PoseOverlay landmarks={landmarks || undefined} videoRef={videoRef} activeLandmarks={currentExercise?.angleLandmarks} isCorrectForm={isFormValid} />
      </div>

      <AnimatePresence>
        {showFlash && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="absolute inset-0 bg-white z-[100]"
          />
        )}
      </AnimatePresence>

      {/* Top HUD */}
      <div className="absolute top-0 inset-x-0 p-4 sm:p-6 z-[60] bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start">
        <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={onBack} className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 text-white rounded-full p-3 sm:p-4 hover:bg-zinc-800/60 transition-colors"><ChevronLeftIcon className="w-5 h-5 sm:w-6 sm:h-6" /></button>
            <div>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tighter uppercase leading-none truncate max-w-[150px] sm:max-w-none">{currentExercise?.name}</h1>
                <p className="text-lime-300 font-bold text-[10px] sm:text-xs tracking-widest mt-1">SET {currentSet} / {totalSets}</p>
            </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/10 px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xl sm:text-2xl font-black font-mono shadow-xl">{formatTime(totalElapsedTime)}</div>
          {phase === 'exercising' && (
            <button 
                onClick={handleTakeSnapshot}
                className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-full text-white hover:bg-white/20 transition-all shadow-2xl"
                aria-label="Capture form snapshot"
            >
                <CaptureIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {captureMessage && (
            <motion.div 
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="absolute top-24 left-1/2 -translate-x-1/2 z-[70] bg-lime-400 text-black px-5 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl border border-black/10"
            >
                <SparklesIcon className="w-4 h-4" />
                {captureMessage}
            </motion.div>
        )}

        {initialCountdown !== null && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-[70]"
          >
            <CameraIcon className="w-16 h-16 sm:w-20 sm:h-20 text-lime-300 mb-6 sm:mb-8" />
            <p className="text-2xl sm:text-4xl font-black tracking-tighter mb-4 px-8 text-center">FACE CAMERA <span className="text-lime-300 uppercase">{currentExercise?.cameraFacing}</span> ON</p>
            <motion.p key={initialCountdown} initial={{ scale: 2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-[10rem] sm:text-[15rem] font-black leading-none">{initialCountdown}</motion.p>
          </motion.div>
        )}

        {phase === 'resting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-purple-950/95 backdrop-blur-xl z-[70]">
            <p className="text-xl sm:text-2xl font-black tracking-widest opacity-50 uppercase mb-4">Recovery</p>
            <p className="text-[8rem] sm:text-[12rem] font-black leading-none mb-8 sm:mb-12">{restCountdown}</p>
            <div className="text-center bg-black/40 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-white/10 max-w-sm w-[90%]">
                <p className="text-zinc-500 uppercase tracking-widest text-[10px] sm:text-xs mb-2">Up Next</p>
                <p className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">{currentSet < totalSets ? currentExercise.name : exercises[currentExerciseIndex + 1]?.name}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls HUD */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-8 z-[60] bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        <motion.div 
            animate={{ scale: isFormValid ? 1 : [1, 1.02, 1] }}
            className={`backdrop-blur-2xl border rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 mb-4 sm:mb-8 text-center transition-colors duration-300 ${isFormValid ? 'bg-black/40 border-white/10' : 'bg-amber-500/20 border-amber-500/50'}`}
        >
            <p className={`text-2xl sm:text-4xl font-black uppercase tracking-tighter ${isFormValid ? 'text-lime-300' : 'text-amber-400'}`}>{feedback}</p>
            <div className="mt-3 flex items-center gap-3 px-4 sm:px-10">
                <span className="font-mono text-[10px] opacity-50 w-8">{Math.round(currentAngle)}°</span>
                <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(currentAngle/180)*100}%` }} className={`h-full ${isFormValid ? 'bg-lime-300' : 'bg-amber-400'}`} />
                </div>
            </div>
        </motion.div>
        
        <div className="flex justify-center items-center gap-6 sm:gap-12 mb-6 sm:mb-10">
            <CircularProgress 
                progress={Math.min(((isTimed ? exerciseTimer : repCount) / (isTimed ? targetTime : targetReps)) * 100, 100)} 
                label={isTimed ? 'SEC' : 'REPS'} value={isTimed ? exerciseTimer : repCount} size={110} strokeWidth={12}
            />
            <div className="h-12 w-[1px] bg-white/10" />
            <div className="text-center">
                <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Target</p>
                <p className="text-4xl sm:text-6xl font-black tracking-tighter">{isTimed ? targetTime : targetReps}</p>
            </div>
        </div>

        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleFinishSet}
            disabled={phase !== 'exercising'}
            className="w-full bg-lime-300 text-black font-black py-4 sm:py-6 rounded-full text-xl sm:text-2xl flex items-center justify-center gap-3 disabled:opacity-10 shadow-2xl shadow-lime-300/20"
        >
            <CheckIcon className="w-6 h-6 sm:w-8 sm:h-8" /> FINISH SET
        </motion.button>
      </div>

      {phase === 'idle' && (
          <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center z-[80]">
              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => { dispatch({ type: 'START_REQUEST' }); startCamera(); }} 
                className="bg-lime-300 text-black text-2xl sm:text-3xl font-black rounded-full px-12 sm:px-20 py-8 sm:py-10 shadow-2xl shadow-lime-300/30 uppercase tracking-tight"
              >
                  START WORKOUT
              </motion.button>
          </div>
      )}
    </div>
  );
};

export default WorkoutTracker;
