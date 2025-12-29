
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Exercise, UserStats, FitnessData } from '../types';
import { PLAN_WORKOUTS } from '../constants';
import { ChevronLeftIcon, ChevronRightIcon, WalkingIcon, FlameIcon } from './icons/ControlIcons';

const DashboardCalendar: React.FC<{ heatmapData: Record<string, number> }> = ({ heatmapData }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const today = new Date();

    const changeMonth = (amount: number) => {
        setCurrentDate(prevDate => {
            const newDate = new Date(prevDate);
            newDate.setDate(1); 
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const getCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        let startDayOfWeek = firstDayOfMonth.getDay() - 1;
        if (startDayOfWeek === -1) startDayOfWeek = 6;
        const days = [];
        const prevMonthLastDay = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) days.push({ day: prevMonthLastDay - i, isCurrentMonth: false, intensity: 0 });
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = new Date(year, month, i).toISOString().split('T')[0];
            days.push({ day: i, isCurrentMonth: true, intensity: heatmapData[dateStr] || 0 });
        }
        const gridTotal = 42;
        const remainingDays = gridTotal - days.length;
        for (let i = 1; i <= remainingDays; i++) days.push({ day: i, isCurrentMonth: false, intensity: 0 });
        return days;
    };

    const getIntensityColor = (intensity: number, isCurrentMonth: boolean, isToday: boolean) => {
        if (isToday) return 'bg-lime-300 text-black shadow-lg shadow-lime-400/20';
        if (!isCurrentMonth) return 'bg-zinc-900/30 opacity-20';
        if (intensity === 0) return 'bg-zinc-900/50 hover:bg-zinc-800 text-zinc-400';
        return 'bg-purple-500/60 hover:bg-purple-500/80 text-white';
    };

    const calendarDays = getCalendarDays();
    const monthYearLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-xl">
            <div className="flex justify-between items-center mb-8 px-2">
                <div>
                    <h2 className="text-xl font-bold uppercase tracking-tight italic leading-none">{monthYearLabel}</h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Training Frequency</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => changeMonth(-1)} className="p-3 bg-zinc-800 rounded-2xl hover:bg-zinc-700 transition-colors border border-white/5"><ChevronLeftIcon /></button>
                    <button onClick={() => changeMonth(1)} className="p-3 bg-zinc-800 rounded-2xl hover:bg-zinc-700 transition-colors border border-white/5"><ChevronRightIcon /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-2.5 text-center">
                {daysOfWeek.map(day => <div key={day} className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest mb-2">{day}</div>)}
                {calendarDays.map(({ day, isCurrentMonth, intensity }, index) => {
                    const isToday = isCurrentMonth && day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                    return (
                        <div key={index} className={`aspect-square relative flex items-center justify-center rounded-2xl transition-all duration-300 text-sm ${isToday ? 'font-bold' : 'font-medium'} ${getIntensityColor(intensity, isCurrentMonth, isToday)}`}>
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const StatBar: React.FC<{ icon: React.ReactNode; label: string; value: number; goal: number; color: string; }> = ({ icon, label, value, goal, color }) => {
    const percentage = Math.min((value / goal) * 100, 100);
    return (
        <div className="bg-zinc-900 border border-white/5 p-6 rounded-[2.5rem]">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <div className="text-zinc-400">{icon}</div>
                    <span className="font-bold uppercase tracking-widest text-[10px] text-zinc-500">{label}</span>
                </div>
                <span className="font-bold text-white italic">{value.toLocaleString()} <span className="text-zinc-600 text-xs not-italic">/ {goal.toLocaleString()}</span></span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%`}} className={`${color} h-full`} />
            </div>
        </div>
    );
};

const ActivityDashboard: React.FC<{ onSelectExercise: (exercise: Exercise) => void; stats: UserStats; fitnessData: FitnessData }> = ({ onSelectExercise, stats, fitnessData }) => {
    return (
        <div className="flex flex-col gap-8">
            <header>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">Activity</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Daily Performance Dashboard</p>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3">
                    <DashboardCalendar heatmapData={fitnessData.calendarHeatmapData} />
                </div>
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <StatBar icon={<WalkingIcon className="w-5 h-5" />} label="Step Count" value={stats.steps} goal={stats.stepGoal} color="bg-purple-500" />
                    <StatBar icon={<FlameIcon className="w-5 h-5" />} label="Active Burn" value={stats.caloriesBurned} goal={stats.calorieTarget} color="bg-lime-400" />
                    <div className="flex flex-col gap-4 mt-2 px-2">
                        <h2 className="text-xl font-bold uppercase tracking-tight italic">Recommended</h2>
                        <button onClick={() => onSelectExercise(PLAN_WORKOUTS[0])} className="bg-lime-300 text-black rounded-[2.5rem] p-8 text-left hover:scale-[1.02] transition-all group flex items-center justify-between shadow-xl">
                            <div>
                                <p className="font-bold uppercase tracking-widest text-[10px] opacity-60 mb-1">Session Proposal</p>
                                <h3 className="font-bold text-2xl uppercase tracking-tighter italic leading-none">{PLAN_WORKOUTS[0].name}</h3>
                            </div>
                            <ChevronRightIcon className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityDashboard;
