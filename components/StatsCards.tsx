
import React from 'react';
import { Coins, TrendingUp, TrendingDown, Wallet, LayoutGrid } from 'lucide-react';
import { SummaryStats, SchoolClass } from '../types';

interface StatsCardsProps {
  stats: SummaryStats;
  selectedClass: SchoolClass;
  initialBalances: Record<string, number>;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, selectedClass, initialBalances }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group overflow-hidden bg-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:-translate-y-1">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl"><Coins size={24} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">Total Saldo</span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Saldo Keseluruhan</h3>
            <p className="text-3xl font-black text-slate-900 mt-1">{formatCurrency(stats.totalBalance)}</p>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-400 to-emerald-600 p-7 rounded-[2.5rem] shadow-xl text-white transition-all hover:-translate-y-1">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="p-3.5 bg-white/20 backdrop-blur-xl rounded-2xl"><TrendingUp size={24} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-50 bg-white/10 px-3 py-1.5 rounded-full">Pemasukan</span>
            </div>
            <h3 className="text-emerald-50/80 text-[10px] font-black uppercase tracking-widest">Total Uang Masuk</h3>
            <p className="text-3xl font-black mt-1">{formatCurrency(stats.totalIncome)}</p>
          </div>
        </div>

        <div className="relative group overflow-hidden bg-gradient-to-br from-rose-400 to-rose-600 p-7 rounded-[2.5rem] shadow-xl text-white transition-all hover:-translate-y-1">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="p-3.5 bg-white/20 backdrop-blur-xl rounded-2xl"><TrendingDown size={24} /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-50 bg-white/10 px-3 py-1.5 rounded-full">Pengeluaran</span>
            </div>
            <h3 className="text-rose-50/80 text-[10px] font-black uppercase tracking-widest">Total Uang Keluar</h3>
            <p className="text-3xl font-black mt-1">{formatCurrency(stats.totalExpense)}</p>
          </div>
        </div>
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-${Math.min(selectedClass.funds.length, 2)} gap-8`}>
        {selectedClass.funds.map(fund => (
          <div key={fund.id} className={`relative overflow-hidden bg-white p-8 rounded-[3rem] shadow-xl border-4 ${fund.id === 'anak' ? 'border-indigo-100' : 'border-purple-100'} group transition-all hover:scale-[1.01]`}>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                 <div className={`p-4 rounded-3xl ${fund.id === 'anak' ? 'bg-indigo-50 text-indigo-600' : 'bg-purple-50 text-purple-600'}`}>
                    <Wallet size={32} />
                 </div>
                 <div className="flex-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dana Terpisah</span>
                    <h4 className={`text-2xl font-black tracking-tight ${fund.id === 'anak' ? 'text-indigo-600' : 'text-purple-600'}`}>{fund.name.toUpperCase()}</h4>
                 </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-4xl font-black text-slate-800 tracking-tighter">{formatCurrency(stats.fundBalances[fund.id] || 0)}</p>
                  <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">Saldo Awal: {formatCurrency(initialBalances[fund.id] || 0)}</p>
                </div>
                <LayoutGrid className="text-slate-100" size={48} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;
