
import { User, UserProfile, FitnessData, MuscleReadiness, ChartData } from '../types';

const DB_KEY = 'fitflow_users';
const SESSION_KEY = 'fitflow_session';
const FITNESS_DATA_KEY = 'fitflow_fitness_data';
const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

// --- Health Metric Calculation Utilities ---

const parseHeight = (heightStr: string): number => {
    if (!heightStr) return 0;
    const feetMatch = heightStr.match(/(\d+)'/);
    const inchesMatch = heightStr.match(/(\d+)"/);
    const feet = feetMatch ? parseInt(feetMatch[1], 10) : 0;
    const inches = inchesMatch ? parseInt(inchesMatch[1], 10) : 0;
    return (feet * 12 + inches) * 2.54;
};

const calculateBMR = (user: Pick<UserProfile, 'gender' | 'weight' | 'height' | 'age'>): number => {
    const weightKg = parseFloat(user.weight) * 0.453592;
    const heightCm = parseHeight(user.height);
    const age = user.age;
    if (!weightKg || !heightCm || !age) return 1500;
    if (user.gender.toLowerCase() === 'male') {
        return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else {
        return 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    }
};

const calculateBMI = (user: Pick<UserProfile, 'weight' | 'height'>): number => {
    const weightKg = parseFloat(user.weight) * 0.453592;
    const heightM = parseHeight(user.height) / 100;
    if (!weightKg || !heightM) return 0;
    return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
};

export const calculateCaloriesBurned = (bmr: number, metValue: number, durationSeconds: number): number => {
    if (!bmr || !metValue || !durationSeconds) return 0;
    const caloriesPerSecond = (bmr / 86400) * metValue;
    return Math.round(caloriesPerSecond * durationSeconds);
};

// --- Initial Data Structures ---
const initialStrengthData: ChartData = {
    labels: ['May', 'Jun', 'Jul', 'Aug'],
    datasets: [
        { label: 'Squat (reps)', exerciseId: 'squat', data: [12, 15, 18, 22], borderColor: '#a855f7', tension: 0.4 },
        { label: 'Push-ups (reps)', exerciseId: 'push-up', data: [10, 12, 14, 20], borderColor: '#d946ef', tension: 0.4 },
        { label: 'Plank (seconds)', exerciseId: 'plank', data: [30, 45, 60, 75], borderColor: '#ec4899', tension: 0.4 },
    ],
};

const initialMuscleReadiness: MuscleReadiness[] = [
    { name: 'Chest', readiness: 'fresh' }, { name: 'Back', readiness: 'fresh' },
    { name: 'Biceps', readiness: 'fresh' }, { name: 'Triceps', readiness: 'fresh' },
    { name: 'Shoulders', readiness: 'fresh' }, { name: 'Quads', readiness: 'fresh' },
    { name: 'Hamstrings', readiness: 'fresh' }, { name: 'Glutes', readiness: 'fresh' },
    { name: 'Calves', readiness: 'fresh' }, { name: 'Abs', readiness: 'fresh' },
];

const getUsers = (): User[] => {
    const usersJson = localStorage.getItem(DB_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
};

export const getInitialFitnessData = (): FitnessData => {
    const today = new Date();
    const calendarHeatmapData: Record<string, number> = {};
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dateInLoop = new Date(year, month, i);
        calendarHeatmapData[dateInLoop.toISOString().split('T')[0]] = i % 3 === 0 ? 1 : 0;
    }

    return {
        steps: 4230,
        caloriesBurned: 320,
        dailyActivity: { cardioTime: 15, workoutTime: 45 },
        weeklyHighlights: { caloriesBurned: 1240, bestLift: { exercise: 'Squat', weight: 80 }, streak: 4 },
        workoutHistory: [],
        strengthData: initialStrengthData,
        recoveryScore: 85,
        muscleReadiness: initialMuscleReadiness,
        goals: { primary: { name: 'Reach 10,000 steps daily', progress: 42 }, badges: ['Early Bird', 'First Squat'] },
        calendarHeatmapData,
    };
};

export const getFitnessData = (userId: string): FitnessData => {
    const allData = JSON.parse(localStorage.getItem(FITNESS_DATA_KEY) || '{}');
    if (allData[userId]) return allData[userId];
    return getInitialFitnessData();
}

export const saveFitnessData = (userId: string, data: FitnessData) => {
    const allData = JSON.parse(localStorage.getItem(FITNESS_DATA_KEY) || '{}');
    allData[userId] = data;
    localStorage.setItem(FITNESS_DATA_KEY, JSON.stringify(allData));
}

// --- Initial Data (Always ensures demo@fitflow.com exists) ---
const initializeDB = () => {
    const users = getUsers();
    const demoEmail = 'demo@fitflow.com';
    if (!users.some(u => u.email === demoEmail)) {
        let demoUser: User = {
            id: 'user-demo',
            fullName: 'Alex Flow',
            email: demoEmail,
            photo: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400",
            gender: 'Male',
            height: "5'11\"",
            weight: '175',
            age: 28,
            fitnessLevel: 'Intermediate',
        };
        demoUser.bmr = calculateBMR(demoUser);
        demoUser.bmi = calculateBMI(demoUser);
        users.push(demoUser);
        saveUsers(users);
        saveFitnessData(demoUser.id, getInitialFitnessData());
    }
};

export const addUser = async (userData: Omit<User, 'id' | 'bmr' | 'bmi'>): Promise<User> => {
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error("User with this email already exists.");
    }
    let newUser: User = { ...userData, id: `user-${Date.now()}` };
    newUser.bmr = calculateBMR(newUser);
    newUser.bmi = calculateBMI(newUser);
    users.push(newUser);
    saveUsers(users);
    saveFitnessData(newUser.id, getInitialFitnessData());
    return newUser;
};

export const login = async (email: string, password?: string): Promise<UserProfile | null> => {
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
        localStorage.setItem(SESSION_KEY, user.id);
        return user;
    }
    return null;
};

export const getMostRecentUserWithPhoto = (): UserProfile | null => {
    const users = getUsers();
    for (let i = users.length - 1; i >= 0; i--) {
        if (users[i].photo && users[i].photo !== DEFAULT_AVATAR) return users[i];
    }
    return users[0] || null;
};

export const logout = () => localStorage.removeItem(SESSION_KEY);

export const getCurrentUser = (): UserProfile | null => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    const users = getUsers();
    return users.find(u => u.id === userId) || null;
};

export const updateUser = async (updatedProfile: UserProfile): Promise<UserProfile> => {
    const users = getUsers();
    const newUsers = users.map(user => {
        if (user.id === updatedProfile.id) {
            const updatedUser = { ...user, ...updatedProfile };
            updatedUser.bmr = calculateBMR(updatedUser);
            updatedUser.bmi = calculateBMI(updatedUser);
            return updatedUser;
        }
        return user;
    });
    saveUsers(newUsers);
    return newUsers.find(u => u.id === updatedProfile.id)!;
};

initializeDB();
