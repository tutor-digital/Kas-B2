
import React, { useState, useEffect } from 'react';
import { NAV_ITEMS } from '../constants';
import { Cloud, CloudOff } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-100">
            B2
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight leading-none">Kas B2</h1>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">School System</span>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 mt-4">
        <ul className="space-y-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-indigo-50 text-indigo-600 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
                }`}
              >
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-6 border-t border-slate-100">
        <div className={`flex items-center gap-2 ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
          {isOnline ? <Cloud size={16} /> : <CloudOff size={16} />}
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isOnline ? 'Sistem Online' : 'Sistem Offline'}
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
