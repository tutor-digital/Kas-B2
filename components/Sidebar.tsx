
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import { CloudOff, Sun, ChevronDown, School, Lock, ShieldCheck, LogOut, User, LogIn, X } from 'lucide-react';
import { SchoolClass } from '../types';

interface SidebarProps {
  isOpen: boolean;
  activeTab: string;
  onTabChange: (tab: string) => void;
  classes: SchoolClass[];
  selectedClassId: string;
  onClassChange: (id: string) => void;
  isAdmin: boolean;
  onLoginRequest: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, activeTab, onTabChange, classes, selectedClassId, onClassChange, isAdmin, onLoginRequest, onLogout }) => {
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
  
  // Filter kelas: Admin bisa lihat semua, User hanya yang aktif
  const visibleClasses = isAdmin ? classes : classes.filter(c => c.isActive);

  return (
    <aside className={`fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-xl border-r border-white/40 flex flex-col z-[70] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-sky-400 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
              {selectedClass?.name.charAt(0) || 'K'}
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-black text-slate-800 tracking-tighter leading-none">Kas Pintar</h1>
              <span className="text-[8px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1 block">Sistem Kas Kelas</span>
            </div>
          </div>
        </div>

        {/* User Status Card */}
        <div className={`mb-6 p-4 rounded-2xl border transition-all ${isAdmin ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isAdmin ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
              {isAdmin ? <ShieldCheck size={14} /> : <User size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Akses</p>
              <p className={`text-[9px] font-black truncate uppercase tracking-tighter ${isAdmin ? 'text-emerald-700' : 'text-slate-600'}`}>
                {isAdmin ? 'Bendahara' : 'Orang Tua (View)'}
              </p>
            </div>
          </div>
        </div>

        {/* Class Selector */}
        <div className="relative">
          <button 
            onClick={() => setShowClassList(!showClassList)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-100 rounded-xl text-[9px] font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
          >
            <div className="flex items-center gap-2">
              <School size={14} className="text-indigo-400" />
              {selectedClass?.name || 'Pilih Kelas'}
            </div>
            <ChevronDown size={14} className={`transition-transform ${showClassList ? 'rotate-180' : ''}`} />
          </button>
          
          {showClassList && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              {visibleClasses.map(c => (
                <button
                  key={c.id}
                  onClick={() => { onClassChange(c.id); setShowClassList(false); }}
                  className={`w-full text-left px-5 py-3 text-[9px] font-black uppercase tracking-widest transition-colors ${selectedClassId === c.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'} flex items-center justify-between`}
                >
                  <span>Kelas {c.name}</span>
                  {!c.isActive && <span className="bg-rose-100 text-rose-500 px-2 py-0.5 rounded-full text-[7px]">Nonaktif</span>}
                </button>
              ))}
              {visibleClasses.length === 0 && (
                <div className="px-5 py-3 text-[8px] text-slate-400 uppercase italic">Tidak ada kelas aktif</div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <nav className="flex-1 px-4 mt-2 overflow-y-auto">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const isRestricted = ['analytics', 'ai-assistant', 'admin'].includes(item.id);
            const isLocked = isRestricted && !isAdmin;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${isActive ? 'text-sky-400' : 'text-slate-300'}`}>
                      {item.icon}
                    </div>
                    <span className="text-[9px] uppercase tracking-widest font-black">{item.label}</span>
                  </div>
                  {isLocked && <Lock size={12} className="text-slate-200" />}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 space-y-2 mt-auto border-t border-slate-50">
        {!isAdmin ? (
          <button 
            onClick={onLoginRequest}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-100 active:scale-95"
          >
            <LogIn size={14} /> Masuk Admin
          </button>
        ) : (
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all font-black text-[9px] uppercase tracking-widest border border-rose-100 active:scale-95"
          >
            <LogOut size={14} /> Keluar Admin
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
