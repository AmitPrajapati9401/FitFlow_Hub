import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Exercise, UserStats, FitnessData } from '../types';
import { PLAN_WORKOUTS } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, WalkingIcon, FlameIcon } from './icons/ControlIcons';

const DashboardCalendar: React.FC<{ heatmapData: Record<string, number> }> = ({ heatmapData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();
    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        let startDay = firstDay.getDay() - 1;
        if (startDay === -1) startDay = 6;

        const days = [];
        const prevMonthLast = new Date(year, month, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) days.push({ day: prevMonthLast - i, current: false });
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = new Date(year, month, i).toISOString().split('T')[0];
            days.push({ day: i, current: true, intensity: heatmapData[dateStr] || 0 });
        }
        while (days.length < 42) days.push({ day: days.length - daysInMonth - startDay + 1, current: false });
        return days;
    };

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter italic">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"><ChevronLeftIcon /></button>
                    <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"><ChevronRightIcon /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
                {daysOfWeek.map(d => <div key={d} className="text-[10px] font-black text-zinc-600">{d}</div>)}
                {getCalendarDays().map((d, i) => (
                    <div key={i} className={`aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all ${!d.current ? 'text-zinc-800' : (d.intensity ? 'bg-purple-500/30 text-purple-300' : 'bg-zinc-800/50 text-zinc-500')}`}>
                        {d.day}
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatBar: React.FC<{ icon: React.ReactNode; label: string; value: number; goal: number; color: string; }> = ({ icon, label, value, goal, color }) => (
    <div className="bg-zinc-900 border border-white/5 p-5 rounded-3xl">
        <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
                <div className="text-zinc-400">{icon}</div>
                <span className="font-black uppercase tracking-widest text-[10px] text-zinc-500">{label}</span>
            </div>
            <span className="font-black text-white italic">{value.toLocaleString()} <span className="text-zinc-600 text-xs not-italic">/ {goal.toLocaleString()}</span></span>
        </div>
        <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((value/goal)*100, 100)}%` }} className={`${color} h-full`} />
        </div>
    </div>
);

interface ActivityDashboardProps {
  onSelectExercise: (exercise: Exercise) => void;
  stats: UserStats;
  fitnessData: FitnessData;
}

const ActivityDashboard: React.FC<ActivityDashboardProps> = ({ onSelectExercise, stats, fitnessData }) => (
    <div className="flex flex-col gap-8">
        <header>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic">Activity</h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Daily Performance Dashboard</p>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3"><DashboardCalendar heatmapData={fitnessData.calendarHeatmapData} /></div>
            <div className="lg:col-span-2 flex flex-col gap-6">
                <StatBar icon={<WalkingIcon className="w-5 h-5" />} label="Step Count" value={stats.steps} goal={stats.stepGoal} color="bg-purple-500" />
                <StatBar icon={<FlameIcon className="w-5 h-5" />} label="Active Burn" value={stats.caloriesBurned} goal={stats.calorieTarget} color="bg-lime-400" />
                
                <h2 className="text-xl font-black uppercase tracking-tighter italic mt-2">Recommended</h2>
                <button 
                  onClick={() => onSelectExercise(PLAN_WORKOUTS[0])}
                  className="bg-lime-300 text-black rounded-[2rem] p-6 text-left hover:scale-[1.02] transition-all group"
                >
                    <p className="font-black uppercase tracking-widest text-[10px] opacity-60 mb-1">Coach Suggestion</p>
                    <div className="flex justify-between items-center">
                      <h3 className="font-black text-2xl uppercase tracking-tighter italic leading-none">{PLAN_WORKOUTS[0].name}</h3>
                      <ChevronRightIcon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                    </div>
                </button>
            </div>
        </div>
    </div>
);

export default ActivityDashboard;