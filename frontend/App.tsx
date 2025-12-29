
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
  // 1. Landing state (per session)
  const [showLanding, setShowLanding] = useState(() => !sessionStorage.getItem('landing_seen'));
  
  // 2. Onboarding state (persistent requirement until completed)
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
    const checkSession = () => {
      const user = db.getCurrentUser();
      if (user) {
        handleLogin(user);
      }
    };
    checkSession();
  }, []);

  const handleLandingFinish = () => {
    setShowLanding(false);
    sessionStorage.setItem('landing_seen', 'true');
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('fitflow_onboarding_done', 'true');
  };

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setWorkoutSummary(null);
  };

  const handleWorkoutFinish = (stats: WorkoutStats) => {
    addWorkout(stats);
    setWorkoutSummary(stats);
    setSelectedExercise(null);
  };

  const handleBackToDashboard = () => {
    setSelectedExercise(null);
    setWorkoutSummary(null);
    setCurrentView('plan');
  };

  const handleRetry = () => {
    if (workoutSummary?.exercise) {
      setSelectedExercise(workoutSummary.exercise);
    }
    setWorkoutSummary(null);
  };
  
  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };
  
  const handleSignUp = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    db.logout();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setAuthView('login');
    setSelectedExercise(null);
    setWorkoutSummary(null);
  };

  const handleUserUpdate = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
  };

  const renderScreen = () => {
    if (workoutSummary) {
      return <WorkoutSummary stats={workoutSummary} onFinish={handleBackToDashboard} onRetry={handleRetry} />;
    }
    if (selectedExercise && currentUser) {
      return <WorkoutTracker user={currentUser} exercise={selectedExercise} onFinish={handleWorkoutFinish} onBack={handleBackToDashboard} />;
    }

    return (
      <div className="flex flex-col min-h-screen bg-zinc-950 overflow-x-hidden">
        <Header user={currentUser} onShowHelp={() => setShowHelp(true)} />
        <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full pb-32">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {currentView === 'activity' && <ActivityDashboard onSelectExercise={handleSelectExercise} stats={userStats} fitnessData={fitnessData} />}
              {currentView === 'plan' && <WorkoutHub user={currentUser} onSelectExercise={handleSelectExercise} fitnessData={fitnessData} />}
              {currentView === 'progress' && <ProgressDashboard data={fitnessData} />}
              {currentView === 'settings' && currentUser && <Settings user={currentUser} onUpdate={handleUserUpdate} onLogout={handleLogout} />}
            </motion.div>
          </AnimatePresence>
        </main>
        <BottomNav activeView={currentView} setView={setCurrentView} />
        <AnimatePresence>
          {showHelp && <HelpCenter onClose={() => setShowHelp(false)} />}
        </AnimatePresence>
      </div>
    );
  };
  
  const Header: React.FC<{ user: UserProfile | null; onShowHelp: () => void }> = ({ user, onShowHelp }) => {
    return (
      <header className="py-4 px-4 sm:px-6 sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
                src={user?.photo || 'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'} 
                alt="User" 
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-cover ring-2 ring-white/10" 
            />
            <div className="hidden sm:block">
              <FitFlowLogo lightText />
            </div>
          </div>
          
          <div className="sm:hidden flex-grow flex justify-center">
             <FitFlowLogo className="opacity-40" lightText />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={onShowHelp} className="text-zinc-400 hover:text-white bg-white/5 rounded-full p-3 transition-colors">
              <InformationCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button className="relative text-zinc-400 hover:text-white bg-white/5 rounded-full p-3 transition-colors">
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-2.5 right-2.5 block h-2 w-2 rounded-full bg-lime-400 ring-2 ring-zinc-950"></span>
            </button>
          </div>
        </div>
      </header>
    );
  };

  // --- Strict Lifecycle Sequence ---
  
  if (showLanding) return <Landing onGetStarted={handleLandingFinish} />;
  
  if (showOnboarding) return <Onboarding onComplete={handleOnboardingComplete} />;

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center overflow-hidden">
        {authView === 'login' ? (
          <Login onLogin={handleLogin} onNavigateToSignUp={() => setAuthView('signup')} />
        ) : (
          <SignUp onSignUp={handleSignUp} onNavigateToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-lime-300 selection:text-black">
      {renderScreen()}
    </div>
  );
};

export default App;
