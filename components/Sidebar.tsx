
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import { CloudOff, Sun, ChevronDown, School, Lock, ShieldCheck, LogOut, User, LogIn } from 'lucide-react';
import { SchoolClass } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  classes: SchoolClass[];
  selectedClassId: string;
  onClassChange: (id: string) => void;
  isAdmin: boolean;
  onLoginRequest: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, classes, selectedClassId, onClassChange, isAdmin, onLoginRequest, onLogout }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showClassList, setShowClassList] = useState(false);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-white/40 hidden md:flex flex-col z-50 shadow-2xl shadow-slate-200/50">
      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gradient-to-tr from-sky-400 to-blue-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-sky-100">
            {selectedClass?.name.charAt(0) || 'S'}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-800 tracking-tighter leading-none">Kas Sekolah</h1>
            <span className="text-[9px] font-black text-sky-500 uppercase tracking-[0.2em] mt-1 block">Taman Kanak-Kanak</span>
          </div>
        </div>

        {/* User Info & Quick Login */}
        <div className={`mb-6 p-4 rounded-3xl border transition-all ${isAdmin ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isAdmin ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Akses Saat Ini</p>
              <p className={`text-[10px] font-black truncate uppercase tracking-tighter ${isAdmin ? 'text-emerald-700' : 'text-slate-600'}`}>
                {isAdmin ? 'Bendahara (Full)' : 'Tamu (View Only)'}
              </p>
            </div>
          </div>
        </div>

        {/* Class Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowClassList(!showClassList)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              <School size={14} className="text-sky-400" />
              Kelas {selectedClass?.name}
            </div>
            <ChevronDown size={14} className={`transition-transform ${showClassList ? 'rotate-180' : ''}`} />
          </button>
          
          {showClassList && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              {classes.map(c => (
                <button
                  key={c.id}
                  onClick={() => { onClassChange(c.id); setShowClassList(false); }}
                  className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors ${selectedClassId === c.id ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:bg-slate-50'}`}
                >
                  Kelas {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 px-4 mt-2 overflow-y-auto">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const isRestricted = ['analytics', 'ai-assistant', 'admin'].includes(item.id);
            const isLocked = isRestricted && !isAdmin;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xl shadow-slate-200'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`${isActive ? 'text-sky-400' : 'text-slate-300'}`}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] uppercase tracking-widest font-black">{item.label}</span>
                  </div>
                  {isLocked && <Lock size={12} className="text-slate-200" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 space-y-3 mt-auto border-t border-slate-50">
        {!isAdmin ? (
          <button 
            onClick={onLoginRequest}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95"
          >
            <LogIn size={16} /> Masuk Admin
          </button>
        ) : (
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all font-black text-[10px] uppercase tracking-widest border border-rose-100 active:scale-95"
          >
            <LogOut size={16} /> Keluar Admin
          </button>
        )}
        
        <div className={`flex items-center justify-center gap-3 py-2 text-[9px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
          {isOnline ? 'Terhubung' : 'Offline'}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;