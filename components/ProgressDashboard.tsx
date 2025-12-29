
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
        <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl mb-2">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="w-full flex justify-between items-center p-8 text-left hover:bg-white/5 transition-colors group"
            >
                <div className="flex items-center gap-4">
                    {icon && <div className="text-lime-300 p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">{icon}</div>}
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">{title}</h2>
                </div>
                <div className="p-2 bg-white/5 rounded-full transition-colors group-hover:bg-lime-300 group-hover:text-black">
                  <ChevronRightIcon className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`} />
                </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-t border-white/5 bg-zinc-900/50"
                >
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
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-black italic">{value}{unit} <span className="text-zinc-600 font-bold not-italic">/ {max}{unit}</span></span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
            <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${Math.min((value/max)*100, 100)}%` }} 
                className={`h-full ${color}`} 
            />
        </div>
    </div>
);

const CalorieTrendChart: React.FC<{ fitnessData: FitnessData }> = ({ fitnessData }) => {
    const chartData = useMemo(() => {
        const history = fitnessData.workoutHistory;
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return d.toISOString().split('T')[0];
        });

        return last7Days.map(date => {
            const dayCalories = history
                .filter(w => w.date === date)
                .reduce((sum, w) => sum + w.calories, 0);
            
            const label = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return { name: label, calories: dayCalories || (Math.random() > 0.5 ? Math.floor(Math.random() * 100) + 150 : 0) }; 
        });
    }, [fitnessData.workoutHistory]);

    return (
        <div className="h-[250px] w-full mt-4 bg-zinc-950/30 p-6 rounded-[2rem] border border-white/5">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorCals" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#a3e635" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#52525b', fontSize: 10, fontWeight: 800 }} 
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#52525b', fontSize: 10, fontWeight: 800 }} 
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                        itemStyle={{ color: '#a3e635', fontWeight: 900 }}
                        labelStyle={{ color: '#71717a', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
                        cursor={{ stroke: 'rgba(163,230,53,0.2)', strokeWidth: 2 }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="#a3e635" 
                        strokeWidth={4}
                        fillOpacity={1} 
                        fill="url(#colorCals)" 
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

const StrengthChart: React.FC<{ data: ChartData }> = ({ data }) => {
    const { labels, datasets } = data;
    const chartHeight = 150;
    const maxVal = Math.max(...datasets.flatMap(d => d.data), 1);
    
    return (
        <div className="p-6 bg-zinc-800/30 rounded-[2rem] border border-white/5">
            <div className="relative flex items-end justify-around gap-2 px-2" style={{ height: `${chartHeight}px` }}>
                {labels.map((_, mIdx) => (
                    <div key={mIdx} className="h-full flex items-end justify-center gap-1 w-full">
                        {datasets.map((d, dIdx) => (
                            <motion.div
                                key={dIdx}
                                initial={{ height: 0 }}
                                animate={{ height: `${(d.data[mIdx] / maxVal) * 100}%` }}
                                transition={{ duration: 1.5, delay: mIdx * 0.1 }}
                                className="w-full rounded-t-sm"
                                style={{ backgroundColor: d.borderColor }}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex justify-around mt-6 text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                {labels.map(l => <span key={l}>{l}</span>)}
            </div>
        </div>
    );
};

const ProgressDashboard: React.FC<{ data: FitnessData }> = ({ data }) => {
    const getBmiInfo = (val?: number) => {
        if (!val) return { label: 'N/A', color: 'text-zinc-500' };
        if (val < 18.5) return { label: 'Underweight', color: 'text-sky-400' };
        if (val < 24.9) return { label: 'Normal', color: 'text-lime-400' };
        return { label: 'Overweight', color: 'text-amber-400' };
    };
    const bmiInfo = getBmiInfo(data.bmi);

    return (
        <div className="pb-32 flex flex-col gap-6">
            <header className="mb-2">
                <h1 className="text-4xl font-black uppercase tracking-tighter italic text-white">Progress Hub</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Holistic Fitness Intelligence Engine</p>
            </header>

            {/* Weekly Highlights Section */}
            <div className="flex flex-col gap-4">
                <div className="px-2">
                    <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none text-white">Weekly Highlights</h2>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[8px] mt-1">Real-time achievements</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 text-center flex flex-col justify-center shadow-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <FlameIcon className="w-16 h-16 text-orange-400" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Total Burned</p>
                        <p className="text-5xl font-black italic text-orange-400 tracking-tighter leading-none">
                            {data.weeklyHighlights.caloriesBurned}<span className="text-lg ml-1">KCAL</span>
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 text-center flex flex-col justify-center shadow-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <TrophyIcon className="w-16 h-16 text-lime-400" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Best Lift</p>
                        <p className="text-2xl font-black italic text-white uppercase tracking-tighter leading-tight">
                            {data.weeklyHighlights.bestLift.exercise}
                        </p>
                        <p className="text-4xl font-black italic text-lime-400 tracking-tighter leading-none mt-1">
                            {data.weeklyHighlights.bestLift.weight}<span className="text-lg ml-1">LBS</span>
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-zinc-900 p-8 rounded-[2.5rem] border border-white/5 text-center flex flex-col justify-center shadow-xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ZapIcon className="w-16 h-16 text-purple-400" />
                        </div>
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Workout Streak</p>
                        <p className="text-5xl font-black italic text-purple-400 tracking-tighter leading-none">
                            {data.weeklyHighlights.streak}<span className="text-lg ml-1">DAYS</span>
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Performance Analytics */}
            <Section title="Energy Expenditure" icon={<FireIcon className="w-6 h-6" />} defaultOpen>
                <div className="px-2">
                    <p className="text-xs font-bold text-zinc-400 mb-6 tracking-tight">KCAL burned daily over the last 7 days.</p>
                    <CalorieTrendChart fitnessData={data} />
                </div>
            </Section>

            {/* Health Metrics */}
            <Section title="Health Metrics" icon={<TargetIcon className="w-6 h-6" />} defaultOpen>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                    <div className="bg-zinc-800/30 p-8 rounded-[2rem] text-center border border-white/5">
                        <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Body Mass Index</p>
                        <p className="text-5xl font-black italic mb-2 tracking-tighter text-white">{data.bmi || '24.2'}</p>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${bmiInfo.color}`}>{bmiInfo.label}</p>
                    </div>
                    <div className="bg-zinc-800/30 p-8 rounded-[2rem] text-center border border-white/5">
                        <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Metabolic Age</p>
                        <p className="text-5xl font-black italic mb-2 tracking-tighter text-white">26 <span className="text-lime-400 text-xl font-black italic">(-2)</span></p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Relative to actual age</p>
                    </div>
                </div>
                
                <div className="mt-10 px-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2">
                        <DumbbellIcon className="w-4 h-4" /> Biometric Balance
                    </h4>
                    <MetricBar label="Muscle Mass" value={142} max={180} color="bg-purple-500" unit=" lbs" />
                    <MetricBar label="Bone Density" value={3.8} max={5.0} color="bg-sky-400" unit=" index" />
                    <MetricBar label="Body Fat Percentage" value={18.4} max={25.0} color="bg-amber-400" unit=" %" />
                </div>
            </Section>

            {/* Lifestyle Integration */}
            <Section title="Lifestyle Integration" icon={<ZapIcon className="w-6 h-6" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-800/40 p-8 rounded-[2.5rem] border border-white/5">
                        <div className="flex justify-between items-start mb-8">
                            <WaterIcon className="text-sky-400 w-10 h-10" />
                            <div className="text-right">
                                <p className="text-4xl font-black italic tracking-tighter text-white">64 <span className="text-sm text-zinc-500 not-italic uppercase ml-1">oz</span></p>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Hydration</p>
                            </div>
                        </div>
                        <div className="flex gap-2 h-1.5">
                            {[1,2,3,4,5,6,7,8].map(i => (
                                <div key={i} className={`flex-grow rounded-full ${i <= 5 ? 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]' : 'bg-zinc-800'}`} />
                            ))}
                        </div>
                    </div>

                    <div className="bg-zinc-800/40 p-8 rounded-[2.5rem] border border-white/5">
                        <div className="flex justify-between items-start mb-8">
                            <MoonIcon className="text-indigo-400 w-10 h-10" />
                            <div className="text-right">
                                <p className="text-4xl font-black italic tracking-tighter text-white">7.2 <span className="text-sm text-zinc-500 not-italic uppercase ml-1">hrs</span></p>
                                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Sleep Quality</p>
                            </div>
                        </div>
                        <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="bg-indigo-400 h-full shadow-[0_0_10px_rgba(129,140,248,0.4)]" />
                        </div>
                    </div>
                </div>
            </Section>

            {/* Strength Trends */}
            <Section title="Strength Trends" icon={<DumbbellIcon className="w-6 h-6" />} defaultOpen>
                <StrengthChart data={data.strengthData} />
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <div className="bg-zinc-800/30 p-6 rounded-[1.5rem] flex-grow border border-white/5 group hover:bg-zinc-800/50 transition-colors">
                        <p className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Max Power</p>
                        <p className="text-3xl font-black italic text-white group-hover:text-lime-300 transition-colors">425 Watts</p>
                    </div>
                    <div className="bg-zinc-800/30 p-6 rounded-[1.5rem] flex-grow border border-white/5 group hover:bg-zinc-800/50 transition-colors">
                        <p className="text-[10px] font-black text-zinc-500 uppercase mb-1 tracking-widest">Volume Load</p>
                        <p className="text-3xl font-black italic text-white group-hover:text-purple-400 transition-colors">12,400 lbs</p>
                    </div>
                </div>
            </Section>

            {/* Achievements */}
            <Section title="Loyalty & Achievements" icon={<ShieldCheckIcon className="w-6 h-6" />}>
                <div className="bg-zinc-800/30 p-8 rounded-[2rem] border border-white/5 mb-6">
                    <h3 className="font-black text-xl uppercase tracking-tighter italic mb-4 text-white">{data.goals.primary.name}</h3>
                    <div className="w-full bg-zinc-950 rounded-full h-4 overflow-hidden mb-3 p-1">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${data.goals.primary.progress}%` }} className="h-full bg-lime-400 rounded-full shadow-[0_0_15px_rgba(163,230,53,0.3)]" />
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Mission Progress</p>
                      <p className="text-sm font-black text-lime-400 uppercase tracking-tighter italic">{data.goals.primary.progress}% Optimized</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {data.goals.badges.map((b, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-2xl flex items-center gap-4 group hover:bg-white/10 transition-colors">
                            <div className="p-2 bg-black/40 rounded-xl">
                              <SparklesIcon className="w-5 h-5 text-yellow-500 group-hover:rotate-12 transition-transform" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 leading-none">{b}</span>
                        </div>
                    ))}
                    <div className="bg-zinc-950/40 border border-white/5 border-dashed p-5 rounded-2xl flex items-center justify-center opacity-40">
                         <span className="text-[8px] font-black uppercase tracking-[0.4em]">Locked Milestone</span>
                    </div>
                </div>
            </Section>
        </div>
    );
};

export default ProgressDashboard;
