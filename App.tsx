import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Exercise, WorkoutStats, UserProfile } from './types';
import WorkoutTracker from './components/WorkoutTracker';
import Login from './components/Login';
import SignUp from './components/SignUp';
import WorkoutSummary from './components/WorkoutSummary';
import { BellIcon, FitFlowLogo, InformationCircleIcon } from './components/icons/ControlIcons';
import ActivityDashboard from './components/ActivityDashboard';
import WorkoutHub from './components/ExerciseSelector';
import BottomNav from './components/BottomNav';
import Settings from './components/Settings';
import ProgressDashboard from './components/ProgressDashboard';
import Landing from './components/Landing';
import HelpCenter from './components/HelpCenter';
import Onboarding from './components/Onboarding';
import * as db from './services/db';
import { useFitnessData } from './hooks/useFitnessData';

type View = 'activity' | 'plan' | 'progress' | 'settings';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(() => !sessionStorage.getItem('landing_seen'));
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('fitflow_onboarding_done'));
  const [showHelp, setShowHelp] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [workoutSummary, setWorkoutSummary] = useState<WorkoutStats | null>(null);
  const [currentView, setCurrentView] = useState<View>('activity');
  
  const { data: fitnessData, stats: userStats, addWorkout } = useFitnessData(currentUser);

  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setAuthView('login');
    setSelectedExercise(null);
    setWorkoutSummary(null);
  };

  if (showLanding) return <Landing onGetStarted={() => { setShowLanding(false); sessionStorage.setItem('landing_seen', 'true'); }} />;
  if (showOnboarding) return <Onboarding onComplete={() => { setShowOnboarding(false); localStorage.setItem('fitflow_onboarding_done', 'true'); }} />;

  if (!isLoggedIn || !currentUser) {
    return authView === 'login' 
      ? <Login onLogin={u => { setCurrentUser(u); setIsLoggedIn(true); }} onNavigateToSignUp={() => setAuthView('signup')} />
      : <SignUp onSignUp={u => { setCurrentUser(u); setIsLoggedIn(true); }} onNavigateToLogin={() => setAuthView('login')} />;
  }

  if (workoutSummary) return <WorkoutSummary stats={workoutSummary} onFinish={() => setWorkoutSummary(null)} onRetry={() => { setSelectedExercise(workoutSummary.exercise); setWorkoutSummary(null); }} />;
  if (selectedExercise) return <WorkoutTracker user={currentUser} exercise={selectedExercise} onFinish={s => { addWorkout(s); setWorkoutSummary(s); setSelectedExercise(null); }} onBack={() => setSelectedExercise(null)} />;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-white selection:bg-lime-300 selection:text-black">
      <header className="py-4 px-4 sm:px-6 sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
                src={currentUser.photo} 
                alt="User" 
                className="w-10 h-10 rounded-2xl object-cover ring-2 ring-white/10" 
            />
            <div className="hidden sm:block">
              <span className="text-white font-black text-sm uppercase tracking-tighter">Hi, {currentUser.fullName.split(' ')[0]}</span>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{currentUser.fitnessLevel}</p>
            </div>
          </div>
          <div className="sm:hidden"><FitFlowLogo className="h-5 opacity-40 scale-75" lightText /></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHelp(true)} className="text-zinc-400 hover:text-white bg-white/5 rounded-full p-2.5 transition-colors">
              <InformationCircleIcon className="w-5 h-5" />
            </button>
            <button className="relative text-zinc-400 hover:text-white bg-white/5 rounded-full p-2.5 transition-colors">
              <BellIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            {currentView === 'activity' && <ActivityDashboard onSelectExercise={setSelectedExercise} stats={userStats} fitnessData={fitnessData} />}
            {currentView === 'plan' && <WorkoutHub user={currentUser} onSelectExercise={setSelectedExercise} fitnessData={fitnessData} />}
            {currentView === 'progress' && <ProgressDashboard data={fitnessData} />}
            {currentView === 'settings' && <Settings user={currentUser} onUpdate={setCurrentUser} onLogout={handleLogout} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav activeView={currentView} setView={setCurrentView} />
      <AnimatePresence>{showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}</AnimatePresence>
    </div>
  );
};

export default App;