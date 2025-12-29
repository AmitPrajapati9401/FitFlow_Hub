
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FitnessData, ChartData, WorkoutStats } from '../types';
import { 
  ChevronRightIcon, DumbbellIcon, FlameIcon, WalkingIcon, 
  TrophyIcon, TargetIcon, ZapIcon, ShieldCheckIcon, SparklesIcon, 
  MoonIcon, WaterIcon, FireIcon, ChevronLeftIcon, ChartIcon,
  TimerIcon, HistoryIcon, ActivityIcon
} from './icons/ControlIcons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';

const Section: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean; icon?: React.ReactNode }> = ({ title, children, defaultOpen = false, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl mb-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center p-8 text-left hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                    {icon && <div className="text-lime-300 p-3 bg-zinc-800 rounded-[1.25rem] group-hover:scale-110 transition-transform">{icon}</div>}
                    <h2 className="text-xl font-bold uppercase tracking-tight italic">{title}</h2>
                </div>
                <div className="p-2.5 bg-zinc-800 rounded-full transition-colors group-hover:bg-lime-300 group-hover:text-black">
                  <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-white/5 bg-zinc-900/50">
                  <div className="p-8 pt-6">{children}</div>
                </motion.div>
              )}
            </AnimatePresence>
        </div>
    );
};

const MetricBar: React.FC<{ label: string; value: number; max: number; color: string; unit?: string }> = ({ label, value, max, color, unit }) => (
    <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold italic">{value}{unit} <span className="text-zinc-600 font-bold not-italic">/ {max}{unit}</span></span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((value/max)*100, 100)}%` }} className={`h-full ${color}`} />
        </div>
    </div>
);

const ProgressDashboard: React.FC<{ data: FitnessData }> = ({ data }) => {
    return (
        <div className="pb-32 flex flex-col gap-6">
            <header>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic text-white">Progress Hub</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Holistic Intelligence</p>
            </header>

            <div className="flex flex-col gap-4 mb-2">
                <div className="px-2">
                    <h2 className="text-xl font-bold uppercase tracking-tight italic leading-none text-white">Highlights</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] mt-1">Real-time stats</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-xl relative overflow-hidden">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Calories</p>
                        <p className="text-4xl font-bold italic text-orange-400 tracking-tighter leading-none">{data.weeklyHighlights.caloriesBurned}</p>
                    </div>
                    <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-xl relative overflow-hidden">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Streak</p>
                        <p className="text-4xl font-bold italic text-purple-400 tracking-tighter leading-none">{data.weeklyHighlights.streak} DAYS</p>
                    </div>
                    <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 text-center shadow-xl relative overflow-hidden">
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Best Lift</p>
                        <p className="text-4xl font-bold italic text-lime-400 tracking-tighter leading-none">{data.weeklyHighlights.bestLift.weight} LBS</p>
                    </div>
                </div>
            </div>

            <Section title="Health Matrix" icon={<TargetIcon className="w-6 h-6" />} defaultOpen>
                <MetricBar label="Muscle Index" value={142} max={180} color="bg-purple-500" unit=" pts" />
                <MetricBar label="Recovery Score" value={data.recoveryScore} max={100} color="bg-sky-400" unit=" %" />
            </Section>

            <Section title="Loyalty" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                <div className="bg-zinc-950/40 p-8 rounded-[2.5rem] border border-white/5 mb-6">
                    <h3 className="font-bold text-base uppercase tracking-tight italic mb-4 text-white">{data.goals.primary.name}</h3>
                    <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden mb-3">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.goals.primary.progress}%` }} className="h-full bg-lime-400 shadow-[0_0_10px_rgba(163,230,53,0.3)]" />
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default ProgressDashboard;
