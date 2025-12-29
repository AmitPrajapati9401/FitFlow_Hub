
import React from 'react';
import { motion } from 'framer-motion';
import { 
  CloseIcon, 
  CameraIcon, 
  InformationCircleIcon, 
  ShieldCheckIcon,
  TargetIcon,
  ZapIcon,
  TrophyIcon,
  NavSettingsIcon,
  SparklesIcon,
  CaptureIcon,
  ChartIcon,
  ActivityIcon,
  HistoryIcon
} from './icons/ControlIcons';

interface HelpCenterProps {
  onClose: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ onClose }) => {
  const guides = [
    {
      title: "Vision Setup",
      icon: <CameraIcon className="w-6 h-6 text-lime-300" />,
      content: "Ensure full-body visibility from 6-8 feet. The AI requires tracking for 33 key neural landmarks to maintain form integrity."
    },
    {
      title: "Bio-Feedback",
      icon: <TargetIcon className="w-6 h-6 text-orange-400" />,
      content: "Watch for color-coded skeletal overlays. Green indicates optimal range, while Amber signals a posture correction requirement."
    },
    {
      title: "Weekly Highlights",
      icon: <TrophyIcon className="w-6 h-6 text-yellow-400" />,
      content: "The Hub automatically benchmarks your 'Best Lift' and monitors your 'Workout Streak' and calorie burn consistency."
    },
    {
      title: "Workload Analytics",
      icon: <ActivityIcon className="w-6 h-6 text-purple-400" />,
      content: "The Hub monitors metabolic burn and training volume (duration vs. intensity) to calculate your relative metabolic age."
    },
    {
      title: "Muscle Readiness",
      icon: <ZapIcon className="w-6 h-6 text-yellow-400" />,
      content: "Our system analyzes session frequency to determine which muscle groups are fresh, recovering, or in a state of high fatigue."
    },
    {
      title: "Neural Privacy",
      icon: <ShieldCheckIcon className="w-6 h-6 text-sky-400" />,
      content: "Video frames are processed in volatile memory and instantly discarded. Your bio-metric data never leaves your hardware."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[300] flex flex-col p-6 overflow-y-auto"
    >
      <div className="max-w-2xl mx-auto w-full py-10">
        <div className="flex justify-between items-center mb-12 px-4">
          <div>
            <h1 className="text-5xl font-black tracking-tighter italic">HUB GUIDE</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Interface Protocol & Knowledge Base</p>
          </div>
          <button onClick={onClose} className="p-4 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors shadow-lg">
            <CloseIcon />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 px-2">
          {guides.map((guide, i) => (
            <motion.div 
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/50 border border-white/5 p-8 rounded-[3rem] hover:bg-zinc-900 transition-colors group"
            >
              <div className="flex items-center gap-5 mb-4">
                <div className="p-3 bg-black/40 rounded-2xl group-hover:scale-110 transition-transform">
                  {guide.icon}
                </div>
                <h3 className="text-2xl font-black tracking-tight uppercase tracking-tighter italic">{guide.title}</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed text-lg font-medium">{guide.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-lime-300 p-8 rounded-[3rem] text-center shadow-2xl shadow-lime-300/10 relative overflow-hidden group mx-2">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <SparklesIcon className="w-20 h-20 text-black" />
          </div>
          <p className="text-black font-black uppercase tracking-tighter text-sm mb-2 flex items-center justify-center gap-2">
            <InformationCircleIcon className="w-5 h-5" /> PRO TIP
          </p>
          <p className="text-zinc-900 text-xl font-black leading-tight italic">Check your <span className="underline">Weekly Highlights</span> regularly to see how your power output is evolving over time.</p>
        </div>
      </div>
    </motion.div>
  );
};

export default HelpCenter;
