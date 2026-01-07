
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import { Cloud, CloudOff, Sun, ChevronDown, School } from 'lucide-react';
import { SchoolClass } from '../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  classes: SchoolClass[];
  selectedClassId: string;
  onClassChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, classes, selectedClassId, onClassChange }) => {
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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-white/40 hidden md:flex flex-col z-50">
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
      
      <nav className="flex-1 px-4 mt-2">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const isTransactions = item.id === 'transactions';
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all ${
                    isActive
                      ? isTransactions ? 'bg-blue-50 text-blue-600 shadow-inner' : 'bg-amber-100 text-amber-600 shadow-inner'
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600 font-bold'
                  }`}
                >
                  <div className={`${
                    isActive 
                      ? isTransactions ? 'text-blue-500' : 'text-amber-500'
                      : 'text-slate-300'
                  }`}>
                    {item.icon}
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-black">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-8 border-t border-slate-50 mt-auto">
        <div className={`flex items-center gap-3 p-4 rounded-2xl ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'} transition-colors`}>
          {isOnline ? <Sun size={18} className="animate-pulse" /> : <CloudOff size={18} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isOnline ? 'Terhubung' : 'Terputus'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;