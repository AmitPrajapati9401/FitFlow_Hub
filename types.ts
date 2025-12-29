

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    photo: string;
    gender: string;
    height: string;
    weight: string;
    age: number;
    fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    bmi?: number;
    bmr?: number;
}

// User interface extending UserProfile for database usage
export interface User extends UserProfile {}

export type LandmarkName = 'leftShoulder' | 'leftElbow' | 'leftWrist' | 'rightShoulder' | 'rightElbow' | 'rightWrist' | 'leftHip' | 'leftKnee' | 'leftAnkle' | 'rightHip' | 'rightKnee' | 'rightAnkle';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number; 
  calories: number; 
  image: string;
  subExercises?: Exercise[];
  aiInstructions?: string;
  category?: 'Lower body' | 'Upper body' | 'Cardio';
  type?: 'reps' | 'time';
  sets?: number;
  reps?: number;
  holdTime?: number;
  angleLandmarks?: [LandmarkName, LandmarkName, LandmarkName];
  angleThresholds?: { up: number; down: number; };
  holdPhase?: 'up' | 'down'; 
  cameraFacing?: 'front' | 'side';
  metValue: number;
}

export interface Landmark {
  x: number;
  y: number;
}

export interface Landmarks {
  [key: string]: Landmark;
}

export interface WorkoutStats {
    exercise: Exercise;
    reps: number;
    duration: number;
    calories: number;
    exerciseBreakdown?: { id: string; name: string; value: string }[];
}

export interface UserStats {
    steps: number;
    caloriesBurned: number;
    stepGoal: number;
    calorieTarget: number;
    stepGoalPercentage: number;
    caloriesRemaining: number;
}

export interface MuscleReadiness {
    name: string;
    readiness: 'fresh' | 'recovering' | 'sore';
}

export interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    tension: number;
    exerciseId?: string;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface FitnessData {
    steps: number;
    caloriesBurned: number;
    dailyActivity: {
        cardioTime: number;
        workoutTime: number;
    };
    weeklyHighlights: {
        caloriesBurned: number;
        bestLift: { exercise: string; weight: number };
        streak: number;
    };
    workoutHistory: (WorkoutStats & { date: string })[];
    strengthData: ChartData;
    recoveryScore: number;
    muscleReadiness: MuscleReadiness[];
    goals: {
        primary: { name: string; progress: number };
        badges: string[];
    };
    calendarHeatmapData: Record<string, number>;
    bmi?: number;
    bmr?: number;
}