
import { useState, useEffect, useCallback } from 'react';
import { FitnessData, WorkoutStats, UserProfile, MuscleReadiness, ChartDataset } from '../types';
import * as db from '../services/db';

const STEP_GOAL = 8000;
const CALORIE_TARGET = 2200;

export const useFitnessData = (user: UserProfile | null) => {
    const [data, setData] = useState<FitnessData>(db.getInitialFitnessData());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            setData(db.getFitnessData(user.id));
            setIsLoading(false);
        } else {
            setIsLoading(true);
            setData(db.getInitialFitnessData());
        }
    }, [user]);

    useEffect(() => {
        if (!user || isLoading) return;
        const stepInterval = setInterval(() => {
            setData(prev => ({ ...prev, steps: prev.steps + Math.floor(Math.random() * 3) }));
        }, 5000);
        return () => clearInterval(stepInterval);
    }, [user, isLoading]);

    const addWorkout = useCallback((workout: WorkoutStats) => {
        if (!user) return;
        setData(prev => {
            const todayStr = new Date().toISOString().split('T')[0];
            const updatedHistory = [{ ...workout, date: todayStr }, ...prev.workoutHistory];
            const updatedCals = prev.caloriesBurned + workout.calories;
            const updatedWorkoutTime = prev.dailyActivity.workoutTime + Math.round(workout.duration / 60);
            
            const updatedStrength = JSON.parse(JSON.stringify(prev.strengthData));
            const monthIdx = updatedStrength.labels.length - 1;
            workout.exerciseBreakdown?.forEach(b => {
                const dataset = updatedStrength.datasets.find((d: ChartDataset) => d.exerciseId === b.id);
                if (dataset) {
                    const valStr = b.value.split('x')[1] || b.value;
                    const val = parseInt(valStr, 10) || 0;
                    dataset.data[monthIdx] = Math.max(dataset.data[monthIdx], val);
                }
            });

            const updated = {
                ...prev,
                caloriesBurned: updatedCals,
                dailyActivity: { ...prev.dailyActivity, workoutTime: updatedWorkoutTime },
                workoutHistory: updatedHistory,
                calendarHeatmapData: { ...prev.calendarHeatmapData, [todayStr]: (prev.calendarHeatmapData[todayStr] || 0) + 1 },
                strengthData: updatedStrength,
                weeklyHighlights: {
                    ...prev.weeklyHighlights,
                    caloriesBurned: prev.weeklyHighlights.caloriesBurned + workout.calories,
                    streak: Math.max(prev.weeklyHighlights.streak, 1)
                }
            };
            db.saveFitnessData(user.id, updated);
            return updated;
        });
    }, [user]);

    const stepGoalPercentage = Math.min(Math.round((data.steps / STEP_GOAL) * 100), 100);
    const caloriesRemaining = Math.max(0, CALORIE_TARGET - data.caloriesBurned);

    return {
        data: { ...data, bmi: user?.bmi, bmr: user?.bmr },
        isLoading,
        addWorkout,
        stats: {
            steps: data.steps,
            caloriesBurned: data.caloriesBurned,
            stepGoal: STEP_GOAL,
            calorieTarget: CALORIE_TARGET,
            stepGoalPercentage,
            caloriesRemaining,
        }
    };
};
