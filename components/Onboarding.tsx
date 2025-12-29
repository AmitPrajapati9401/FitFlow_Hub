import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  ZapIcon, 
  CameraIcon, 
  ChevronRightIcon, 
  FitFlowLogo, 
  CheckIcon,
  LoadingIcon
} from './icons/ControlIcons.tsx';
import { useCamera } from '../hooks/useCamera.ts';

interface OnboardingProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 'vision',
    title: "Neural Pose Vision",
    subtitle: "PHASE_01: AI_TRACKING",
    description: "Experience professional-grade skeletal tracking. Our AI analyzes 33 key joints at 60FPS to understand every inch of your movement.",
    icon: "🧬",
    color: "from-lime-600/20 to-emerald-950",
    accent: "bg-lime-400"
  },
  {
    id: 'feedback',
    title: "Dynamic Bio-Feedback",
    subtitle: "PHASE_02: REAL_TIME_COACH",
    description: "Your digital trainer never sleeps. Get instant alerts when your form breaks, helping you hit target depth and maximum safety.",
    icon: "⚡",
    color: "from-purple-600/20 to-indigo-950",
    accent: "bg-purple-400"
  },
  {
    id: 'privacy',
    title: "Privacy First Engine",
    subtitle: "PHASE_03: ON_DEVICE_ONLY",
    description: "Your space is sacred. Video frames are processed in local memory and instantly discarded. Nothing is ever recorded or uploaded.",
    icon: "🛡️",
    color: "from-sky-600/20 to-blue-950",
    accent: "bg-sky-400"
  },
  {
    id: 'camera',
    title: "Activate Trainer",
    subtitle: "PHASE_04: HARDWARE_SYNC",
    description: "Clear a 6-8ft path for full-body visibility. We need camera access to bring your AI coach to life. No data ever leaves this device.",
    icon: "📸",
    color: "from-zinc-800 to-zinc-950",
    accent: "bg-white"
  }
];

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const { startCamera, isCameraReady, error } = useCamera();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleNext = async () => {
    if (slides[currentSlide].id === 'camera' && !isCameraReady) {
      setIsRequesting(true);
      try {
        await startCamera();
      } catch (e) {
        // Error is handled in the UI display
      } finally {
        setIsRequesting(false);
      }
      return;
    }

    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const current = slides[currentSlide];

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    })
  };

  return (
    <div className="fixed inset-0 z-[8000] bg-zinc-950 overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 select-none touch-none">
      {/* Background Atmosphere */}
      <div className={`absolute inset-0 transition-all duration-1000 bg-gradient-to-br ${current.color}`} />
      
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 ${current.accent} rounded-full blur-[100px] opacity-10 transition-colors duration-1000`}
        />
      </div>

      {/* Progress Track */}
      <div className="absolute top-12 left-0 right-0 flex justify-center gap-2 px-12 z-[8050]">
        {slides.map((_, i) => (
          <motion.div 
            key={i} 
            layout
            animate={{ 
              width: i === currentSlide ? 48 : 12,
              backgroundColor: i === currentSlide ? "rgba(255, 255, 255, 1)" : i < currentSlide ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.2)"
            }}
            className="h-1 rounded-full shadow-sm"
          />
        ))}
      </div>

      {/* Slide Container */}
      <div className="w-full max-w-lg z-[8010] relative h-[80vh] flex flex-col items-center justify-center overflow-hidden pointer-events-auto">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 200, damping: 25 },
              opacity: { duration: 0.2 },
              scale: { duration: 0.3 }
            }}
            className="flex flex-col items-center w-full px-4"
          >
            {/* Visual Identity */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="text-8xl sm:text-[10rem] mb-6 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-float">
                {current.icon}
              </div>
              <div className="px-5 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10">
                <span className="text-[10px] sm:text-xs font-mono-cyber uppercase tracking-[0.4em] text-white/50">
                  {current.subtitle}
                </span>
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-zinc-950/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-12 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden text-center w-full">
              <div className={`absolute top-0 right-0 w-32 h-32 ${current.accent} opacity-5 blur-3xl rounded-full -mr-16 -mt-16 transition-colors duration-1000`}></div>

              <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6 uppercase tracking-tighter leading-[0.9] italic">
                {current.title}
              </h1>
              
              <p className="text-base sm:text-lg font-medium text-zinc-300 leading-relaxed mb-10 sm:mb-12">
                {current.description}
              </p>

              {current.id === 'camera' && error && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex flex-col gap-1"
                >
                    <p>{error}</p>
                    <button onClick={startCamera} className="text-[9px] font-black underline uppercase tracking-widest text-white/80 hover:text-white">Retry System Link</button>
                </motion.div>
              )}
              
              <div className="flex flex-col gap-3">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext} 
                  disabled={isRequesting}
                  className={`w-full py-5 sm:py-6 text-lg sm:text-xl font-black rounded-full transition-all flex items-center justify-center gap-3 shadow-2xl
                    ${isCameraReady && current.id === 'camera' 
                      ? 'bg-lime-300 text-black shadow-lime-400/20' 
                      : 'bg-white text-black hover:bg-zinc-100'}
                  `}
                >
                  {isRequesting ? (
                    <><LoadingIcon className="w-5 h-5 sm:w-6 sm:h-6" /> SYNCING AI...</>
                  ) : isCameraReady && current.id === 'camera' ? (
                    <><CheckIcon className="w-6 h-6 sm:w-7 sm:h-7" /> ENTER THE FLOW</>
                  ) : currentSlide === slides.length - 1 ? (
                    "ENABLE CAMERA"
                  ) : (
                    <>CONTINUE <ChevronRightIcon className="w-5 h-5 sm:w-6 sm:h-6" /></>
                  )}
                </motion.button>

                {currentSlide < slides.length - 1 && (
                  <button 
                    onClick={onComplete}
                    className="text-[10px] sm:text-xs font-black text-white/30 hover:text-white uppercase tracking-[0.3em] transition-colors py-2"
                  >
                    Skip Induction
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center opacity-20 pointer-events-none">
          <FitFlowLogo className="h-5 sm:h-6 scale-75" lightText />
      </div>
    </div>
  );
};

export default Onboarding;