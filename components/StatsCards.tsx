
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Wallet, Receipt, MoreHorizontal, Download, Upload } from 'lucide-react';
import { SummaryStats, SchoolClass, TransactionType } from '../types';

interface StatsCardsProps {
  stats: SummaryStats;
  selectedClass: SchoolClass;
  onOpenForm: (type?: TransactionType) => void;
  onNavigate: (tab: string) => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, selectedClass, onOpenForm, onNavigate }) => {
  const [showBalance, setShowBalance] = useState(true);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full mb-8">
      {/* THE PURPLE CARD */}
      <div className="stockbit-card rounded-[2.5rem] p-8 relative overflow-hidden text-white mb-8 shadow-2xl">
        {/* Decorative Curves */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-900/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-violet-100 text-xs font-medium mb-2 flex items-center gap-2 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                {selectedClass.name} Portfolio
              </p>
              <p className="text-violet-200 text-[10px] font-medium mb-1">Total Balance</p>
              <h2 className="text-4xl font-bold tracking-tight mb-2">
                {showBalance ? formatCurrency(stats.totalBalance) : 'Rp •••••••••'}
              </h2>
               <button onClick={() => setShowBalance(!showBalance)} className="opacity-70 hover:opacity-100 flex items-center gap-2 text-xs">
                  {showBalance ? <><Eye size={12} /> Sembunyikan</> : <><EyeOff size={12} /> Tampilkan</>}
                </button>
            </div>
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-sm border border-white/10">
               <Wallet size={24} className="text-white" />
            </div>
          </div>
          
           <div className="flex items-center gap-2 mt-4">
             <div className="bg-emerald-400/20 px-3 py-1.5 rounded-lg border border-emerald-400/30 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-100">Kas Aktif</span>
             </div>
             <div className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
                <span className="text-[10px] font-medium text-violet-100">
                  Perpisahan: {showBalance ? formatCurrency(stats.fundBalances['perpisahan'] || 0) : '•••'}
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons (Round) */}
      <div className="grid grid-cols-4 gap-4 px-2">
        <button onClick={() => onOpenForm(TransactionType.INCOME)} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-violet-500/10 group-active:scale-90 transition-all">
            <ArrowDownLeft size={24} className="text-violet-600" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">Masuk</span>
        </button>

        <button onClick={() => onOpenForm(TransactionType.EXPENSE)} className="flex flex-col items-center gap-2 group">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-violet-500/10 group-active:scale-90 transition-all">
            <ArrowUpRight size={24} className="text-rose-500" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">Keluar</span>
        </button>

        <button onClick={() => onNavigate('checklist')} className="flex flex-col items-center gap-2 group">
           <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-violet-500/10 group-active:scale-90 transition-all">
            <Receipt size={24} className="text-violet-600" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">Ceklis</span>
        </button>

        <button onClick={() => onNavigate('report')} className="flex flex-col items-center gap-2 group">
           <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-violet-500/10 group-active:scale-90 transition-all">
            <MoreHorizontal size={24} className="text-violet-600" />
          </div>
          <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">Laporan</span>
        </button>
      </div>
    </div>
  );
};

export default StatsCards;
