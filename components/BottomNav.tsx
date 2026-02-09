
import React from 'react';
import { Home, ReceiptText, PlusCircle, PieChart, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenForm: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onOpenForm }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bottom-nav pb-safe pt-2 px-6 h-[80px] flex items-center justify-between z-50 md:hidden">
      <button 
        onClick={() => onTabChange('dashboard')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'nav-item-active' : 'nav-item-inactive'}`}
      >
        <Home size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
        <span className="text-[9px] font-medium">Beranda</span>
      </button>

      <button 
        onClick={() => onTabChange('transactions')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'transactions' ? 'nav-item-active' : 'nav-item-inactive'}`}
      >
        <ReceiptText size={22} strokeWidth={activeTab === 'transactions' ? 2.5 : 2} />
        <span className="text-[9px] font-medium">Riwayat</span>
      </button>

      {/* Center Floating Button */}
      <div className="relative -top-5">
        <button 
          onClick={onOpenForm}
          className="w-14 h-14 rounded-full bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-600/30 active:scale-95 transition-transform"
        >
          <PlusCircle size={28} />
        </button>
      </div>

      <button 
        onClick={() => onTabChange('report')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'report' ? 'nav-item-active' : 'nav-item-inactive'}`}
      >
        <PieChart size={22} strokeWidth={activeTab === 'report' ? 2.5 : 2} />
        <span className="text-[9px] font-medium">Laporan</span>
      </button>

      <button 
        onClick={() => onTabChange('admin')}
        className={`flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'nav-item-active' : 'nav-item-inactive'}`}
      >
        <Settings size={22} strokeWidth={activeTab === 'admin' ? 2.5 : 2} />
        <span className="text-[9px] font-medium">Admin</span>
      </button>
    </div>
  );
};

export default BottomNav;
