
import React from 'react';
import { SummaryStats, SchoolClass, Transaction, TransactionType } from '../types';
import { FileText, ArrowUpCircle, ArrowDownCircle, Wallet, Calculator } from 'lucide-react';

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

  // Menghitung Debet/Kredit per Fund
  const fundSummaries = selectedClass.funds.map(fund => {
    const initial = initialBalances[fund.id] || 0;
    
    const debet = transactions.reduce((sum, t) => {
      if (t.type !== TransactionType.INCOME) return sum;
      if (t.fundId === fund.id) return sum + t.amount;
      if (t.fundId === 'gabungan' && selectedClass.splitRule.targetFundIds.includes(fund.id)) {
        return sum + (t.amount * 0.5);
      }
      return sum;
    }, 0);

    const kredit = transactions.reduce((sum, t) => {
      if (t.type !== TransactionType.EXPENSE) return sum;
      if (t.fundId === fund.id) return sum + t.amount;
      if (t.fundId === 'gabungan' && selectedClass.splitRule.targetFundIds.includes(fund.id)) {
        return sum + (t.amount * 0.5);
      }
      return sum;
    }, 0);

    const final = initial + debet - kredit;

    return {
      name: fund.name,
      initial,
      debet,
      kredit,
      final
    };
  });

  const totals = fundSummaries.reduce((acc, curr) => ({
    initial: acc.initial + curr.initial,
    debet: acc.debet + curr.debet,
    kredit: acc.kredit + curr.kredit,
    final: acc.final + curr.final
  }), { initial: 0, debet: 0, kredit: 0, final: 0 });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-3xl">
            <FileText size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Laporan Transparansi Kas</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ringkasan Keuangan Kelas {selectedClass.name}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Kas</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo Awal</th>
                <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right">Debet (+)</th>
                <th className="px-8 py-6 text-[10px] font-black text-rose-500 uppercase tracking-widest text-right">Kredit (-)</th>
                <th className="px-8 py-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest text-right">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fundSummaries.map((fund, idx) => (
                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-purple-500'}`}></div>
                      <span className="text-sm font-black text-slate-700">{fund.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right font-bold text-slate-400 text-sm">{formatCurrency(fund.initial)}</td>
                  <td className="px-8 py-6 text-right font-black text-emerald-500 text-sm">{formatCurrency(fund.debet)}</td>
                  <td className="px-8 py-6 text-right font-black text-rose-500 text-sm">{formatCurrency(fund.kredit)}</td>
                  <td className="px-8 py-6 text-right font-black text-indigo-600 text-sm">{formatCurrency(fund.final)}</td>
                </tr>
              ))}
              <tr className="bg-slate-900 text-white">
                <td className="px-8 py-6 rounded-l-[2rem]">
                  <span className="text-xs font-black uppercase tracking-widest">TOTAL KESELURUHAN</span>
                </td>
                <td className="px-8 py-6 text-right font-black text-slate-400 text-xs">{formatCurrency(totals.initial)}</td>
                <td className="px-8 py-6 text-right font-black text-emerald-400 text-sm">{formatCurrency(totals.debet)}</td>
                <td className="px-8 py-6 text-right font-black text-rose-400 text-sm">{formatCurrency(totals.kredit)}</td>
                <td className="px-8 py-6 text-right font-black text-sky-400 text-lg rounded-r-[2rem]">{formatCurrency(totals.final)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-6">
          <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
            <ArrowUpCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Dana Masuk</p>
            <p className="text-2xl font-black text-emerald-700">{formatCurrency(totals.debet)}</p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] flex items-center gap-6">
          <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-100">
            <ArrowDownCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Dana Keluar</p>
            <p className="text-2xl font-black text-rose-700">{formatCurrency(totals.kredit)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashReport;
