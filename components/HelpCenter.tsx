
import React from 'react';
import { motion } from 'framer-motion';
import { CloseIcon, CameraIcon, InformationCircleIcon, TargetIcon, ShieldCheckIcon, TrophyIcon, SparklesIcon } from './icons/ControlIcons';

const HelpCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const guides = [
    { title: "Optimal Setup", icon: <CameraIcon className="w-5 h-5 text-lime-300" />, content: "Place your device 6-8 feet away. Your full body must be in view for accuracy." },
    { title: "Bio-Feedback", icon: <TargetIcon className="w-5 h-5 text-purple-400" />, content: "Watch the angle gauge. Green indicators mean you've reached target depth." },
    { title: "Privacy First", icon: <ShieldCheckIcon className="w-5 h-5 text-sky-400" />, content: "All AI processing is local. No video ever leaves your device." },
    { title: "AI Sync", icon: <SparklesIcon className="w-5 h-5 text-yellow-400" />, content: "Face the camera. Our neural network tracks 33 joints in real-time." },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[100] p-6 overflow-y-auto">
      <div className="max-w-2xl mx-auto py-10">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black italic">TRAINER GUIDE</h1>
          <button onClick={onClose} className="p-3 bg-zinc-800 rounded-full"><CloseIcon /></button>
        </div>
        <div className="grid gap-6">
          {guides.map((g, i) => (
            <div key={i} className="bg-zinc-900 border border-white/5 p-6 rounded-[2.5rem]">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-black/40 rounded-xl">{g.icon}</div>
                <h3 className="text-xl font-bold italic">{g.title}</h3>
              </div>
              <p className="text-zinc-400 leading-relaxed">{g.content}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
export default HelpCenter;
