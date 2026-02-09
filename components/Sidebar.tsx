
import React from 'react';
import { NAV_ITEMS } from '../constants';
import { ChevronDown, School, X } from 'lucide-react';
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
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, classes, selectedClassId, isAdmin, onLoginRequest, onLogout }) => {
  const selectedClass = classes.find(c => c.id === selectedClassId);

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0b0e14] border-r border-white/5 hidden md:flex flex-col z-[90]">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-emerald-500/20">K</div>
              <div>
                <h1 className="text-white font-black text-lg tracking-tight">Kas Pintar</h1>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Web Dashboard</span>
              </div>
          </div>

          <div className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6">
            <div className="flex items-center gap-2"><School size={14} className="text-emerald-500" /> {selectedClass?.name}</div>
            <ChevronDown size={14} />
          </div>
        
          <nav className="flex-1 overflow-y-auto">
            <ul className="space-y-1 list-none">
                {NAV_ITEMS.map((item) => (
                <li key={item.id} className="list-none">
                    <button
                    onClick={() => onTabChange(item.id)}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl transition-all ${
                        activeTab === item.id ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'text-slate-500 hover:text-white hover:bg-white/5'
                    }`}
                    >
                    <div className="shrink-0">{item.icon}</div>
                    <span className="text-[11px] font-bold">{item.label}</span>
                    </button>
                </li>
                ))}
            </ul>
          </nav>
        </div>

        <div className="p-8 mt-auto border-t border-white/5">
          {!isAdmin ? (
            <button onClick={onLoginRequest} className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">Masuk Admin</button>
          ) : (
            <button onClick={onLogout} className="w-full py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500/20 transition-all">Keluar</button>
          )}
        </div>
      </aside>
  );
};

export default Sidebar;
