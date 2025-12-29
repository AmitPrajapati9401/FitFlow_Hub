
import React, { useRef, useState, useEffect } from 'react';
import { 
  FitFlowLogo, LoadingIcon, CameraOffIcon, EyeIcon, CheckIcon, CloseIcon, CameraIcon 
} from './icons/ControlIcons';
import * as db from '../services/db';
import { recognizeUser } from '../services/geminiService';
import { UserProfile } from '../types';
import CameraModal from './CameraModal';

interface LoginProps {
  onLogin: (user: UserProfile) => void;
  onNavigateToSignUp: () => void;
}

type ScanState = 'idle' | 'recognizing' | 'success' | 'error' | 'no_user';

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignUp }) => {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scannableUser, setScannableUser] = useState<UserProfile | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const user = db.getMostRecentUserWithPhoto();
    if (user) {
      setScannableUser(user);
    } else {
      setScanState('no_user');
    }
  }, []);

  const handleCaptureAndRecognize = async (capturedPhotoDataUrl: string) => {
    setIsCameraModalOpen(false);
    if (!scannableUser) {
      setError("User profile not found for comparison.");
      setScanState('error');
      return;
    }

    setScanState('recognizing');
    setError(null);

    try {
      const cameraFrameBase64 = capturedPhotoDataUrl.split(',')[1];
      const result = await recognizeUser(scannableUser.photo, cameraFrameBase64);

      if (result.match && result.confidence > 0.7) {
        setScanState('success');
        setTimeout(() => onLogin(scannableUser), 1200);
      } else {
        setError("Face match failed. Please try again or use your password.");
        setScanState('error');
      }
    } catch (e: any) {
      setError(e.message || "Face recognition unavailable.");
      setScanState('error');
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const user = await db.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError("Invalid email or password.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetScan = () => {
    setError(null);
    setScanState('idle');
  };

  return (
    <>
      {isCameraModalOpen && (
        <CameraModal
          onClose={() => setIsCameraModalOpen(false)}
          onCapture={handleCaptureAndRecognize}
        />
      )}

      <div className="min-h-screen text-white bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm mx-auto text-center">
          <FitFlowLogo className="h-16 mx-auto mb-10" lightText />
          
          <h1 className="text-3xl font-black tracking-tighter uppercase italic leading-none mb-2">
            Welcome Back
          </h1>
          <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest mb-8">
            {scannableUser ? 'Tap below to verify' : 'Login to continue'}
          </p>

          <div className="mb-10">
            <div className={`w-44 h-44 relative mx-auto bg-zinc-900 rounded-[2.5rem] border-4 transition-all duration-500 overflow-hidden shadow-2xl flex flex-col items-center justify-center
              ${scanState === 'success' ? 'border-lime-400' : 'border-zinc-800'}
            `}>
              {scanState === 'recognizing' ? (
                <div className="flex flex-col items-center">
                  <LoadingIcon className="w-10 h-10 text-lime-400" />
                  <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Scanning</p>
                </div>
              ) : scanState === 'success' ? (
                <div className="flex flex-col items-center animate-bounce">
                  <CheckIcon className="w-12 h-12 text-lime-400" />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-lime-400">Verified</p>
                </div>
              ) : scanState === 'error' ? (
                <button onClick={resetScan} className="flex flex-col items-center group">
                  <CloseIcon className="w-12 h-12 text-red-500 group-hover:scale-110 transition-transform" />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Retry Scan</p>
                </button>
              ) : scanState === 'no_user' ? (
                <div className="flex flex-col items-center px-6 opacity-30">
                  <CameraOffIcon className="w-12 h-12" />
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em]">Face ID Locked</p>
                </div>
              ) : (
                scannableUser && (
                  <button
                    onClick={() => setIsCameraModalOpen(true)}
                    className="w-full h-full relative group"
                  >
                    <img src={scannableUser.photo} alt="User" className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/10 flex items-center justify-center transition-all">
                      <CameraIcon className="w-12 h-12 text-white drop-shadow-xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                    </div>
                  </button>
                )
              )}
            </div>
          </div>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-black">OR USE EMAIL</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>

          {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold">{error}</div>}

          <form onSubmit={handlePasswordLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-6 py-5 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-2 focus:ring-lime-400 outline-none transition-all font-bold text-sm tracking-wide"
              required
            />
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-5 bg-zinc-900 border border-white/5 rounded-2xl focus:ring-2 focus:ring-lime-400 outline-none transition-all font-bold text-sm tracking-wide"
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-0 px-6 flex items-center text-zinc-600 hover:text-white transition-colors"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-black py-6 rounded-full hover:bg-lime-400 transition-all disabled:opacity-50 shadow-xl uppercase tracking-widest mt-2"
            >
              {isSubmitting ? <LoadingIcon className="mx-auto" /> : 'Log In'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-600 mt-10 font-bold uppercase tracking-widest">
            New here?{' '}
            <button onClick={onNavigateToSignUp} className="text-lime-400 hover:underline">
              Join Hub
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
