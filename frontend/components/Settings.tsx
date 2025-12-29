
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadIcon, ChevronRightIcon, TrendingUpIcon, LoadingIcon, LogoutIcon, CameraIcon, CheckIcon, NavSettingsIcon } from './icons/ControlIcons';
import { UserProfile } from '../types';
import * as db from '../services/db';
import CameraModal from './CameraModal';

const FormRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-5 border-b border-white/5 last:border-0">
        <label className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-2 sm:mb-0">{label}</label>
        <div className="w-full sm:w-auto flex items-center gap-2 text-white text-base font-bold italic">
            {children}
        </div>
    </div>
);

const Settings: React.FC<{ user: UserProfile; onUpdate: (user: UserProfile) => void; onLogout: () => void }> = ({ user, onUpdate, onLogout }) => {
    const [profile, setProfile] = useState<UserProfile>(user);
    const [isSaving, setIsSaving] = useState(false);
    const [isBasicExpanded, setIsBasicExpanded] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (field: keyof UserProfile, value: string | number) => {
        setProfile(p => ({ ...p, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updated = await db.updateUser(profile);
            onUpdate(updated);
        } catch (e) { console.error(e); }
        setIsSaving(false);
    };

    const inputStyles = "bg-zinc-800 sm:bg-transparent text-left sm:text-right w-full focus:outline-none p-3 sm:p-0 rounded-2xl sm:rounded-none border border-white/5 sm:border-0 font-bold";

    return (
        <div className="pb-32 flex flex-col gap-8">
            <header>
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic">Settings</h1>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-1">Interface Protocol</p>
            </header>
            
            <div className="bg-zinc-900 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl">
                <button onClick={() => setIsBasicExpanded(!isBasicExpanded)} className="w-full p-8 flex items-center gap-6 text-left">
                    <div className="h-16 w-16 rounded-3xl bg-zinc-800 flex items-center justify-center text-lime-300"><NavSettingsIcon className="w-8 h-8" /></div>
                    <div className="flex-grow">
                        <h2 className="text-xl font-bold uppercase tracking-tight italic">Identity & Metrics</h2>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Core Bio-Data</p>
                    </div>
                    <ChevronRightIcon className={`w-6 h-6 transition-transform ${isBasicExpanded ? 'rotate-90' : ''}`} />
                </button>
                <AnimatePresence>
                    {isBasicExpanded && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden px-8 pb-8">
                            <FormRow label="Full Name"><input type="text" value={profile.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} className={inputStyles} /></FormRow>
                            <FormRow label="Body Weight"><input type="number" value={profile.weight} onChange={(e) => handleInputChange('weight', e.target.value)} className={inputStyles} /></FormRow>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-col gap-4">
                <button onClick={handleSave} disabled={isSaving} className="w-full bg-white text-black font-bold py-6 rounded-full hover:bg-lime-300 transition-all text-xl uppercase italic shadow-xl shadow-lime-400/10">{isSaving ? <LoadingIcon /> : 'Apply Sync'}</button>
                <button onClick={onLogout} className="w-full bg-zinc-900/50 border border-red-500/20 text-red-500 font-bold py-4 rounded-full text-sm uppercase tracking-widest">Sign Out Session</button>
            </div>
        </div>
    );
};

export default Settings;
