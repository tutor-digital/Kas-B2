
import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
           <img 
             src="https://ui-avatars.com/api/?name=Admin+Kas&background=10b981&color=fff" 
             alt="Profile" 
             className="w-full h-full object-cover"
           />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{getGreeting()}</p>
          <h3 className="text-sm font-bold text-white">Bendahara Kelas</h3>
        </div>
      </div>

      <button className="w-10 h-10 rounded-full bg-[#151a23] border border-white/5 flex items-center justify-center text-slate-300 relative">
        <Bell size={18} />
        <div className="absolute top-2.5 right-3 w-2 h-2 bg-rose-500 rounded-full border border-[#151a23]"></div>
      </button>
    </div>
  );
};

export default Header;
