
import React, { useState } from 'react';
import { Eye, EyeOff, ArrowDownLeft, ArrowUpRight, Wallet, Receipt, ChevronRight } from 'lucide-react';
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
    <div className="w-full mb-6">
      {/* THE GREEN CARD */}
      <div className="alim-card rounded-[2rem] p-6 relative overflow-hidden text-white mb-6">
        {/* Decorative Circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-xl"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-emerald-100 text-xs font-medium mb-1 flex items-center gap-2">
                Total Saldo Kas
                <button onClick={() => setShowBalance(!showBalance)} className="opacity-70 hover:opacity-100">
                  {showBalance ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                {showBalance ? formatCurrency(stats.totalBalance) : 'Rp ••••••••'}
              </h2>
            </div>
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
               <Wallet size={20} className="text-white" />
            </div>
          </div>

          <div className="mt-1 mb-6 flex items-center gap-2">
            <span className="text-[10px] bg-black/10 px-2 py-1 rounded-lg text-emerald-50 font-medium">
              {selectedClass.name}
            </span>
            <span className="text-[10px] bg-black/10 px-2 py-1 rounded-lg text-emerald-50 font-medium">
              Dana Perpisahan: {showBalance ? formatCurrency(stats.fundBalances['perpisahan'] || 0) : '•••'}
            </span>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => onOpenForm(TransactionType.INCOME)} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm group-active:scale-90 transition-all border border-white/10">
                <ArrowDownLeft size={20} />
              </div>
              <span className="text-[10px] font-medium text-emerald-50">Masuk</span>
            </button>

            <button onClick={() => onOpenForm(TransactionType.EXPENSE)} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm group-active:scale-90 transition-all border border-white/10">
                <ArrowUpRight size={20} />
              </div>
              <span className="text-[10px] font-medium text-emerald-50">Keluar</span>
            </button>

            <button onClick={() => onNavigate('checklist')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm group-active:scale-90 transition-all border border-white/10">
                <Receipt size={20} />
              </div>
              <span className="text-[10px] font-medium text-emerald-50">Ceklis</span>
            </button>

            <button onClick={() => onNavigate('report')} className="flex flex-col items-center gap-2 group">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm group-active:scale-90 transition-all border border-white/10">
                <ChevronRight size={20} />
              </div>
              <span className="text-[10px] font-medium text-emerald-50">Laporan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
