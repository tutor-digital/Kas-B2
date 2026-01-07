
import React from 'react';
import { Coins, TrendingUp, TrendingDown, Users, Sparkles, Wallet } from 'lucide-react';
import { SummaryStats } from '../types';

interface StatsCardsProps {
  stats: SummaryStats;
  initialBalances: { anak: number; perpisahan: number };
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, initialBalances }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-8 mb-10">
      {/* Arus Kas Utama (Ringkasan Bulanan) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Saldo Gabungan */}
        <div className="relative group overflow-hidden bg-white p-7 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12">
            <Wallet size={140} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="p-3.5 bg-slate-900 text-white rounded-2xl shadow-xl shadow-slate-200">
                <Coins size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">Net Worth</span>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Saldo Keseluruhan</h3>
            <p className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{formatCurrency(stats.totalBalance)}</p>
          </div>
        </div>

        {/* Pemasukan Bulanan */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 p-7 rounded-[2.5rem] shadow-xl shadow-emerald-200/50 text-white transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
            <TrendingUp size={110} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="p-3.5 bg-white/20 backdrop-blur-xl text-white rounded-2xl border border-white/30 shadow-lg">
                <TrendingUp size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-50 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">Iuran Bulanan (+)</span>
            </div>
            <h3 className="text-emerald-50/80 text-[10px] font-black uppercase tracking-widest">Total Pemasukan</h3>
            <p className="text-3xl font-black mt-1 tracking-tight">{formatCurrency(stats.totalIncome)}</p>
          </div>
        </div>

        {/* Pengeluaran Bulanan */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-rose-400 via-rose-500 to-orange-600 p-7 rounded-[2.5rem] shadow-xl shadow-rose-200/50 text-white transition-all hover:-translate-y-1 hover:shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
            <TrendingDown size={110} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div className="p-3.5 bg-white/20 backdrop-blur-xl text-white rounded-2xl border border-white/30 shadow-lg">
                <TrendingDown size={24} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-50 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md">Kas Keluar (-)</span>
            </div>
            <h3 className="text-rose-50/80 text-[10px] font-black uppercase tracking-widest">Total Pengeluaran</h3>
            <p className="text-3xl font-black mt-1 tracking-tight">{formatCurrency(stats.totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Pembagian Dana Strategis (50/50 Split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kas Anak */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-8 rounded-[3rem] shadow-2xl shadow-indigo-200/50 text-white group transition-all hover:scale-[1.01]">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-4 bg-white/15 backdrop-blur-2xl rounded-[1.5rem] border border-white/20 shadow-2xl">
                <Users size={32} />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200">Dana Operasional</span>
                      <h4 className="text-2xl font-black tracking-tight">KAS ANAK</h4>
                    </div>
                    {initialBalances.anak > 0 && (
                      <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                        <p className="text-[8px] font-black uppercase text-indigo-200">Saldo Awal</p>
                        <p className="text-xs font-bold">{formatCurrency(initialBalances.anak)}</p>
                      </div>
                    )}
                 </div>
               </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-black tracking-tighter">{formatCurrency(stats.balanceAnak)}</p>
                <p className="text-xs text-indigo-200/70 font-medium mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></span>
                  Siap digunakan untuk keperluan kelas
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Porsi Kas</p>
                <p className="text-xl font-black">50%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Kas Perpisahan */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-fuchsia-700 to-pink-800 p-8 rounded-[3rem] shadow-2xl shadow-fuchsia-200/50 text-white group transition-all hover:scale-[1.01]">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
               <div className="p-4 bg-white/15 backdrop-blur-2xl rounded-[1.5rem] border border-white/20 shadow-2xl">
                <Sparkles size={32} />
               </div>
               <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-200">Dana Tabungan</span>
                      <h4 className="text-2xl font-black tracking-tight">KAS PERPISAHAN</h4>
                    </div>
                    {initialBalances.perpisahan > 0 && (
                      <div className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                        <p className="text-[8px] font-black uppercase text-fuchsia-200">Saldo Awal</p>
                        <p className="text-xs font-bold">{formatCurrency(initialBalances.perpisahan)}</p>
                      </div>
                    )}
                 </div>
               </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-4xl font-black tracking-tighter">{formatCurrency(stats.balancePerpisahan)}</p>
                <p className="text-xs text-fuchsia-200/70 font-medium mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-pulse"></span>
                  Tabungan otomatis untuk momen spesial
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-fuchsia-300 uppercase tracking-widest mb-1">Porsi Kas</p>
                <p className="text-xl font-black">50%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
