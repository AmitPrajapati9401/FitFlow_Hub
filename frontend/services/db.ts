
import { User, UserProfile, FitnessData, MuscleReadiness, ChartData } from '../types';

const DB_KEY = 'fitflow_users';
const SESSION_KEY = 'fitflow_session';
const FITNESS_DATA_KEY = 'fitflow_fitness_data';
const DEFAULT_AVATAR = "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg";

// --- Health Metric Calculation Utilities ---

const parseHeight = (heightStr: string): number => {
    // Parses height like "5'10\"" into centimeters
    if (!heightStr) return 0;
    const feetMatch = heightStr.match(/(\d+)'/);
    const inchesMatch = heightStr.match(/(\d+)"/);
    const feet = feetMatch ? parseInt(feetMatch[1], 10) : 0;
    const inches = inchesMatch ? parseInt(inchesMatch[1], 10) : 0;
    return (feet * 12 + inches) * 2.54;
};

const calculateBMR = (user: Pick<UserProfile, 'gender' | 'weight' | 'height' | 'age'>): number => {
    // Harris-Benedict Equation
    const weightKg = parseFloat(user.weight) * 0.453592;
    const heightCm = parseHeight(user.height);
    const age = user.age;

    if (!weightKg || !heightCm || !age) return 1500; // Return a default value

    if (user.gender.toLowerCase() === 'male') {
        return 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
    } else { // Assume female or other, use female formula as a general base
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
    // Formula: (BMR / 24 / 3600) * MET * duration_in_seconds
    const caloriesPerSecond = (bmr / 86400) * metValue;
    return Math.round(caloriesPerSecond * durationSeconds);
};

// --- Initial Data Structures ---
const initialStrengthData: ChartData = {
    labels: ['May', 'Jun', 'Jul', 'Aug'],
    datasets: [
        { label: 'Squat (reps)', exerciseId: 'squat', data: [0, 0, 0, 0], borderColor: '#a855f7', tension: 0.4 },
        { label: 'Push-ups (reps)', exerciseId: 'push-up', data: [0, 0, 0, 0], borderColor: '#d946ef', tension: 0.4 },
        { label: 'Plank (seconds)', exerciseId: 'plank', data: [0, 0, 0, 0], borderColor: '#ec4899', tension: 0.4 },
    ],
};

const initialMuscleReadiness: MuscleReadiness[] = [
    { name: 'Chest', readiness: 'fresh' }, { name: 'Back', readiness: 'fresh' },
    { name: 'Biceps', readiness: 'fresh' }, { name: 'Triceps', readiness: 'fresh' },
    { name: 'Shoulders', readiness: 'fresh' }, { name: 'Quads', readiness: 'fresh' },
    { name: 'Hamstrings', readiness: 'fresh' }, { name: 'Glutes', readiness: 'fresh' },
    { name: 'Calves', readiness: 'fresh' }, { name: 'Abs', readiness: 'fresh' },
];

// --- Helper Functions ---
const getUsers = (): User[] => {
    const usersJson = localStorage.getItem(DB_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(DB_KEY, JSON.stringify(users));
};

// --- Initial Data (if DB is empty) ---
const initializeDB = () => {
    const users = getUsers();
    if (users.length === 0) {
        let defaultUser: User = {
            id: 'user-1',
            fullName: 'Amit',
            email: 'amit@example.com',
            photo: DEFAULT_AVATAR,
            gender: 'Male',
            height: "6'0\"",
            weight: '180',
            age: 32,
            fitnessLevel: 'Intermediate',
        };
        // Calculate and add BMR/BMI
        defaultUser.bmr = calculateBMR(defaultUser);
        defaultUser.bmi = calculateBMI(defaultUser);
        saveUsers([defaultUser]);
        saveFitnessData(defaultUser.id, getInitialFitnessData());
    }
};


// --- Fitness Data Management ---
export const getInitialFitnessData = (): FitnessData => {
    const today = new Date();
    const calendarHeatmapData: Record<string, number> = {};
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
        const dateInLoop = new Date(year, month, i);
        calendarHeatmapData[dateInLoop.toISOString().split('T')[0]] = 0;
    }

    return {
        steps: 0,
        caloriesBurned: 0,
        dailyActivity: { cardioTime: 0, workoutTime: 0 },
        weeklyHighlights: { caloriesBurned: 0, bestLift: { exercise: 'N/A', weight: 0 }, streak: 0 },
        workoutHistory: [],
        strengthData: initialStrengthData,
        recoveryScore: 100,
        muscleReadiness: initialMuscleReadiness,
        goals: { primary: { name: 'Set your first goal!', progress: 0 }, badges: [] },
        calendarHeatmapData,
    };
};

export const getFitnessData = (userId: string): FitnessData => {
    const allData = JSON.parse(localStorage.getItem(FITNESS_DATA_KEY) || '{}');
    if (allData[userId]) {
        return allData[userId];
    }
    return getInitialFitnessData();
}

export const saveFitnessData = (userId: string, data: FitnessData) => {
    const allData = JSON.parse(localStorage.getItem(FITNESS_DATA_KEY) || '{}');
    allData[userId] = data;
    localStorage.setItem(FITNESS_DATA_KEY, JSON.stringify(allData));
}

// --- Public API ---
export const addUser = async (userData: Omit<User, 'id' | 'bmr' | 'bmi'>): Promise<User> => {
    await new Promise(res => setTimeout(res, 500));
    
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error("User with this email already exists.");
    }

    let newUser: User = {
        ...userData,
        id: `user-${Date.now()}`,
    };
    newUser.bmr = calculateBMR(newUser);
    newUser.bmi = calculateBMI(newUser);
    
    users.push(newUser);
    saveUsers(users);
    saveFitnessData(newUser.id, getInitialFitnessData());
    
    return newUser;
};

export const login = async (email: string, password?: string): Promise<UserProfile | null> => {
    await new Promise(res => setTimeout(res, 500));
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
        localStorage.setItem(SESSION_KEY, user.id);
        return user;
    }
    
    return null;
};

export const getUserByEmail = (email: string): UserProfile | null => {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const getMostRecentUserWithPhoto = (): UserProfile | null => {
    const users = getUsers();
    // Find the last user in the array that has a non-default photo
    for (let i = users.length - 1; i >= 0; i--) {
        if (users[i].photo && users[i].photo !== DEFAULT_AVATAR) {
            return users[i];
        }
    }
    return null; // No user with a custom photo found
};

export const logout = () => {
    localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): UserProfile | null => {
    const userId = localStorage.getItem(SESSION_KEY);
    if (!userId) return null;
    const users = getUsers();
    return users.find(u => u.id === userId) || null;
};

export const updateUser = async (updatedProfile: UserProfile): Promise<UserProfile> => {
    await new Promise(res => setTimeout(res, 500));
    
    const users = getUsers();

    const newUsers = users.map(user => {
        if (user.id === updatedProfile.id) {
            // Create a new, updated user object by merging old and new data
            const updatedUser = {
                ...user,
                ...updatedProfile,
            };

            // Recalculate derived data based on the newly updated profile
            updatedUser.bmr = calculateBMR(updatedUser);
            updatedUser.bmi = calculateBMI(updatedUser);

            return updatedUser;
        }
        return user; // Return unmodified user if it's not the one we're updating
    });

    saveUsers(newUsers);

    // Find the fully updated user object from the new array to return
    const fullyUpdatedUser = newUsers.find(u => u.id === updatedProfile.id);

    if (!fullyUpdatedUser) {
        throw new Error("User not found after update, something went wrong.");
    }
    
    return fullyUpdatedUser;
};

initializeDB();
