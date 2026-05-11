
import React, { useMemo } from 'react';
import { SummaryStats, SchoolClass, Transaction, TransactionType } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Wallet, CalendarRange, History } from 'lucide-react';

interface CashReportProps {
  stats: SummaryStats;
  selectedClass: SchoolClass;
  initialBalances: Record<string, number>;
  transactions: Transaction[];
}

const CashReport: React.FC<CashReportProps> = ({ stats, selectedClass, initialBalances, transactions }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const fundSummaries = selectedClass.funds.map(fund => {
    const initial = initialBalances[fund.id] || 0;
    
    const debet = transactions.reduce((sum, t) => {
      if (t.type !== TransactionType.INCOME) return sum;

      const isSplitCategory = selectedClass.splitRule.enabled && t.category === selectedClass.splitRule.category;
      if (isSplitCategory) {
        if (selectedClass.splitRule.targetFundIds.includes(fund.id)) {
          return sum + (t.amount * (selectedClass.splitRule.ratio || 0.5));
        }
        return sum;
      }

      if (t.fundId === fund.id) return sum + t.amount;
      if (t.fundId === 'gabungan' && selectedClass.splitRule.targetFundIds.includes(fund.id)) {
        return sum + (t.amount * (selectedClass.splitRule.ratio || 0.5));
      }
      return sum;
    }, 0);

    const kredit = transactions.reduce((sum, t) => {
      if (t.type !== TransactionType.EXPENSE) return sum;

      const isSplitCategory = selectedClass.splitRule.enabled && t.category === selectedClass.splitRule.category;
      if (isSplitCategory) {
        if (selectedClass.splitRule.targetFundIds.includes(fund.id)) {
          return sum + (t.amount * (selectedClass.splitRule.ratio || 0.5));
        }
        return sum;
      }

      if (t.fundId === fund.id) return sum + t.amount;
      if (t.fundId === 'gabungan' && selectedClass.splitRule.targetFundIds.includes(fund.id)) {
        return sum + (t.amount * (selectedClass.splitRule.ratio || 0.5));
      }
      return sum;
    }, 0);

    const final = initial + debet - kredit;

    return { name: fund.name, initial, debet, kredit, final };
  });

  const totals = fundSummaries.reduce((acc, curr) => ({
    initial: acc.initial + curr.initial,
    debet: acc.debet + curr.debet,
    kredit: acc.kredit + curr.kredit,
    final: acc.final + curr.final
  }), { initial: 0, debet: 0, kredit: 0, final: 0 });

  const monthlyMutations = useMemo(() => {
    const totalInitialBalance = (Object.values(initialBalances) as number[]).reduce((acc: number, val: number) => acc + val, 0);
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const groups = new Map<string, { label: string, dateObj: Date, initial: number, income: number, expense: number, final: number }>();
    let currentBalance: number = totalInitialBalance;

    for (const t of sortedTx) {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        
        if (!groups.has(key)) {
            const label = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
            groups.set(key, {
                label, dateObj: date, initial: currentBalance, income: 0, expense: 0, final: 0
            });
        }

        const group = groups.get(key)!;
        if (t.type === TransactionType.INCOME) {
            group.income += t.amount;
            currentBalance += t.amount;
        } else {
            group.expense += t.amount;
            currentBalance -= t.amount;
        }
        group.final = currentBalance;
    }
    return Array.from(groups.values()).reverse(); 
  }, [transactions, initialBalances]);


  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Global Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1e1b2e] border border-emerald-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all"></div>
          <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-lg shadow-emerald-500/10 border border-emerald-500/20">
            <ArrowUpCircle size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Total Dana Masuk</p>
            <p className="text-2xl font-black text-white">{formatCurrency(totals.debet)}</p>
          </div>
        </div>
        <div className="bg-[#1e1b2e] border border-rose-500/20 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-xl relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/20 transition-all"></div>
          <div className="p-4 bg-rose-500/20 text-rose-400 rounded-2xl shadow-lg shadow-rose-500/10 border border-rose-500/20">
            <ArrowDownCircle size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Total Dana Keluar</p>
            <p className="text-2xl font-black text-white">{formatCurrency(totals.kredit)}</p>
          </div>
        </div>
      </div>

      {/* Fund Details Table */}
      <div className="glass-panel rounded-[3rem] p-8 md:p-10 border border-white/5 shadow-xl overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-indigo-500/20 text-indigo-400 rounded-3xl border border-indigo-500/20">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Saldo per Kantong</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail pembagian uang kas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#110e1b]/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Kantong</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo Awal</th>
                <th className="px-6 py-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-right">Debet (+)</th>
                <th className="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest text-right">Kredit (-)</th>
                <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest text-right">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {fundSummaries.map((fund, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-indigo-400' : 'bg-purple-400'}`}></div>
                      <span className="text-sm font-bold text-slate-200">{fund.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-500 text-sm">{formatCurrency(fund.initial)}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald-400 text-sm">{formatCurrency(fund.debet)}</td>
                  <td className="px-6 py-4 text-right font-black text-rose-400 text-sm">{formatCurrency(fund.kredit)}</td>
                  <td className="px-6 py-4 text-right font-black text-indigo-400 text-sm">{formatCurrency(fund.final)}</td>
                </tr>
              ))}
              <tr className="bg-[#110e1b] border-t border-white/10">
                <td className="px-6 py-4 rounded-l-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL</span>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-500 text-xs">{formatCurrency(totals.initial)}</td>
                <td className="px-6 py-4 text-right font-black text-emerald-400 text-sm">{formatCurrency(totals.debet)}</td>
                <td className="px-6 py-4 text-right font-black text-rose-400 text-sm">{formatCurrency(totals.kredit)}</td>
                <td className="px-6 py-4 text-right font-black text-white text-lg rounded-r-2xl">{formatCurrency(totals.final)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Mutation Table */}
      <div className="glass-panel rounded-[3rem] p-8 md:p-10 border border-white/5 shadow-xl overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-amber-500/20 text-amber-400 rounded-3xl border border-amber-500/20">
            <CalendarRange size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white">Mutasi Kas Bulanan</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Riwayat saldo berjalan</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#110e1b]/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulan</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo Awal</th>
                <th className="px-6 py-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest text-right">Masuk</th>
                <th className="px-6 py-4 text-[10px] font-black text-rose-400 uppercase tracking-widest text-right">Keluar</th>
                <th className="px-6 py-4 text-[10px] font-black text-indigo-400 uppercase tracking-widest text-right">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {monthlyMutations.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 text-xs font-black uppercase tracking-widest italic">Belum ada transaksi</td>
                </tr>
              ) : (
                monthlyMutations.map((row, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl"><History size={14} /></div>
                        <span className="text-sm font-black text-slate-200 uppercase tracking-tight">{row.label}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-500 text-sm">{formatCurrency(row.initial)}</td>
                    <td className="px-6 py-4 text-right font-black text-emerald-400 text-sm">
                        {row.income > 0 ? `+ ${formatCurrency(row.income)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-rose-400 text-sm">
                        {row.expense > 0 ? `- ${formatCurrency(row.expense)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-indigo-400 text-sm bg-indigo-500/10 rounded-r-2xl border border-indigo-500/10">
                        {formatCurrency(row.final)}
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default CashReport;
