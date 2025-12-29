
import React from 'react';
import { motion } from 'framer-motion';
import { FitFlowLogo, ShieldCheckIcon, SparklesIcon, ZapIcon } from './icons/ControlIcons';

interface LandingProps {
  onGetStarted: () => void;
}

const Landing: React.FC<LandingProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-lime-400/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-2xl"
      >
        <FitFlowLogo className="h-20 mb-12" lightText />
        
        <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-6 leading-tight">
          TRAIN SMARTER WITH <span className="text-lime-300">ON-DEVICE AI</span>
        </h1>
        
        <p className="text-zinc-400 text-lg sm:text-xl mb-10 leading-relaxed">
          The world's first privacy-first fitness companion. Professional pose tracking, real-time form correction, and hands-free login—all processed locally on your device.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 flex flex-col items-center">
            <ShieldCheckIcon className="w-8 h-8 text-lime-300 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">100% Private</span>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 flex flex-col items-center">
            <SparklesIcon className="w-8 h-8 text-purple-400 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Gemini Powered</span>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-md p-4 rounded-2xl border border-zinc-800 flex flex-col items-center">
            <ZapIcon className="w-8 h-8 text-sky-400 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Real-time Biofeedback</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onGetStarted}
          className="bg-lime-300 text-black font-black text-2xl px-12 py-6 rounded-full shadow-2xl shadow-lime-300/20"
        >
          GET STARTED
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Landing;
