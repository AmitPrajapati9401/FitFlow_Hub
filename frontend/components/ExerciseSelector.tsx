
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Exercise, FitnessData, UserProfile } from '../types';
import { PLAN_WORKOUTS, EXERCISES } from '../constants';
import { ChevronRightIcon, DumbbellIcon, TargetIcon, DiceIcon, CheckIcon } from './icons/ControlIcons';

interface WorkoutHubProps {
  user: UserProfile;
  onSelectExercise: (exercise: Exercise) => void;
  fitnessData: FitnessData;
}

const WEEKLY_GOAL = 3;

const WeeklyGoal: React.FC<{ workoutsCompleted: number }> = ({ workoutsCompleted }) => {
    const progress = Math.min((workoutsCompleted / WEEKLY_GOAL) * 100, 100);
    return (
        <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight italic leading-none">Weekly Progress</h3>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Consistency is key</p>
                </div>
                <div className="flex items-center gap-2 text-lime-400 font-bold italic text-xl">
                    <TargetIcon className="w-6 h-6" />
                    <span>{workoutsCompleted} / {WEEKLY_GOAL}</span>
                </div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="bg-lime-300 h-full rounded-full" />
            </div>
        </div>
    );
};

const QuickStart: React.FC<{ user: UserProfile, onSelectExercise: (exercise: Exercise) => void }> = ({ user, onSelectExercise }) => {
    const [quickStartExercises, setQuickStartExercises] = useState<Exercise[]>([]);

    const filteredExercises = useMemo(() => {
        const level = user.fitnessLevel;
        if (level === 'Beginner') return EXERCISES.filter(ex => ex.difficulty === 'Beginner');
        if (level === 'Intermediate') return EXERCISES.filter(ex => ex.difficulty === 'Beginner' || ex.difficulty === 'Intermediate');
        return EXERCISES;
    }, [user.fitnessLevel]);

    useEffect(() => {
        const shuffled = [...filteredExercises].sort(() => 0.5 - Math.random());
        setQuickStartExercises(shuffled.slice(0, 3));
    }, [filteredExercises]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end px-2">
              <div>
                <h3 className="text-xl font-bold uppercase tracking-tight italic leading-none">Quick Start</h3>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Single moves</p>
              </div>
              <button onClick={() => setQuickStartExercises([...filteredExercises].sort(() => 0.5 - Math.random()).slice(0, 3))} className="p-3 bg-zinc-900 border border-white/5 rounded-[1.25rem] text-lime-300"><DiceIcon className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickStartExercises.map((ex, idx) => (
                    <button key={ex.id} onClick={() => onSelectExercise({ ...ex, type: 'reps', sets: 3, reps: 10, subExercises: [{ ...ex, type: 'reps', sets: 3, reps: 10 }]})} className="bg-zinc-900/40 border border-white/5 p-6 rounded-[2.5rem] text-left hover:bg-zinc-800 transition-all flex items-center gap-4 group">
                        <div className="w-14 h-14 rounded-[1.25rem] overflow-hidden flex-shrink-0"><img src={ex.image} alt={ex.name} className="w-full h-full object-cover" /></div>
                        <div>
                            <p className="font-bold uppercase tracking-tight italic text-white group-hover:text-lime-300 transition-colors">{ex.name}</p>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{ex.difficulty}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

const WorkoutHub: React.FC<WorkoutHubProps> = ({ user, onSelectExercise, fitnessData }) => {
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const filteredPlans = useMemo(() => PLAN_WORKOUTS, []);
  
  return (
    <div className="flex flex-col gap-10 pb-20">
      <header>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">Workout Hub</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Optimization Phase</p>
      </header>
      <WeeklyGoal workoutsCompleted={fitnessData.workoutHistory.length} />
      <QuickStart user={user} onSelectExercise={onSelectExercise} />
      <div className="flex flex-col gap-8">
        <h2 className="text-xl font-bold uppercase tracking-tight italic px-2">Training Plans</h2>
        <div className="flex flex-col gap-6">
            {filteredPlans.map((workout) => (
                <div key={workout.id} onClick={() => setExpandedPlan(expandedPlan === workout.id ? null : workout.id)} className={`bg-zinc-900 border border-white/5 p-6 rounded-[2.5rem] cursor-pointer transition-all shadow-xl group ${expandedPlan === workout.id ? 'border-lime-400/20' : ''}`}>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="h-32 w-full sm:h-24 sm:w-24 rounded-[1.5rem] overflow-hidden"><img src={workout.image} alt={workout.name} className="h-full w-full object-cover" /></div>
                        <div className="flex-grow w-full flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-xl uppercase tracking-tight italic group-hover:text-lime-300 transition-colors">{workout.name}</h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{workout.category} • {workout.duration} MINS</p>
                            </div>
                            <div className="p-2.5 bg-white/5 rounded-[1.25rem] group-hover:bg-lime-300 group-hover:text-black transition-colors"><ChevronRightIcon className={`w-5 h-5 transition-transform ${expandedPlan === workout.id ? 'rotate-90' : ''}`} /></div>
                        </div>
                    </div>
                    <AnimatePresence>
                        {expandedPlan === workout.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-6 pt-6 border-t border-white/5">
                                <button onClick={() => onSelectExercise(workout)} className="w-full bg-lime-300 text-black font-bold py-5 rounded-full text-lg uppercase italic tracking-tight shadow-xl">Start Program</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default WorkoutHub;
