
import React, { useMemo } from 'react';
import { SummaryStats, SchoolClass, Transaction, TransactionType } from '../types';
import { FileText, ArrowUpCircle, ArrowDownCircle, Wallet, Calculator, CalendarRange, History } from 'lucide-react';

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

  // --- LOGIKA 1: Ringkasan per Kantong (Fund) ---
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


  // --- LOGIKA 2: Laporan Mutasi Bulanan (Monthly Ledger) ---
  const monthlyMutations = useMemo(() => {
    // 1. Hitung Total Saldo Awal Global (Semua Kantong)
    const totalInitialBalance = Object.values(initialBalances).reduce((acc, val) => acc + val, 0);

    // 2. Urutkan transaksi dari TERLAMA ke TERBARU untuk menghitung saldo berjalan
    const sortedTx = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const groups = new Map<string, { label: string, dateObj: Date, initial: number, income: number, expense: number, final: number }>();
    let currentBalance = totalInitialBalance;

    // 3. Iterasi transaksi
    for (const t of sortedTx) {
        const date = new Date(t.date);
        const key = `${date.getFullYear()}-${date.getMonth()}`; // Key unik: 2025-0, 2025-1, dll
        
        // Jika bulan ini belum ada di map, inisialisasi
        if (!groups.has(key)) {
            const label = date.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
            groups.set(key, {
                label,
                dateObj: date,
                initial: currentBalance, // Saldo awal bulan ini = saldo berjalan saat ini
                income: 0,
                expense: 0,
                final: 0
            });
        }

        const group = groups.get(key)!;

        // Update saldo berjalan dan total per bulan
        if (t.type === TransactionType.INCOME) {
            group.income += t.amount;
            currentBalance += t.amount;
        } else {
            group.expense += t.amount;
            currentBalance -= t.amount;
        }
        
        // Update saldo akhir bulan ini
        group.final = currentBalance;
    }

    // 4. Ubah ke array dan balik urutan (Bulan Terbaru di Atas untuk display)
    const result = Array.from(groups.values());
    return result.reverse(); 
  }, [transactions, initialBalances]);


  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* BAGIAN 1: Ringkasan Global */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
          <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-100">
            <ArrowUpCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Dana Masuk</p>
            <p className="text-2xl font-black text-emerald-700">{formatCurrency(totals.debet)}</p>
          </div>
        </div>
        <div className="bg-rose-50 border border-rose-100 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
          <div className="p-4 bg-rose-500 text-white rounded-2xl shadow-lg shadow-rose-100">
            <ArrowDownCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Dana Keluar</p>
            <p className="text-2xl font-black text-rose-700">{formatCurrency(totals.kredit)}</p>
          </div>
        </div>
      </div>

      {/* BAGIAN 2: Tabel Transparansi Kantong */}
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-3xl">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Saldo per Kantong</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail pembagian uang kas</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Kantong</th>
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
                  <span className="text-xs font-black uppercase tracking-widest">TOTAL</span>
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

      {/* BAGIAN 3: Laporan Mutasi Bulanan (New Feature) */}
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl overflow-hidden">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-3xl">
            <CalendarRange size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Mutasi Kas Bulanan</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cek apakah semua transaksi sudah tercatat</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bulan</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Saldo Awal Bulan</th>
                <th className="px-8 py-6 text-[10px] font-black text-emerald-500 uppercase tracking-widest text-right">Masuk (Debet)</th>
                <th className="px-8 py-6 text-[10px] font-black text-rose-500 uppercase tracking-widest text-right">Keluar (Kredit)</th>
                <th className="px-8 py-6 text-[10px] font-black text-indigo-600 uppercase tracking-widest text-right">Saldo Akhir Bulan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {monthlyMutations.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-8 py-10 text-center text-slate-400 text-xs font-black uppercase tracking-widest italic">Belum ada transaksi</td>
                </tr>
              ) : (
                monthlyMutations.map((row, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/30 transition-colors">
                    <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><History size={14} /></div>
                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight">{row.label}</span>
                        </div>
                    </td>
                    <td className="px-8 py-6 text-right font-bold text-slate-500 text-sm">{formatCurrency(row.initial)}</td>
                    <td className="px-8 py-6 text-right font-black text-emerald-500 text-sm">
                        {row.income > 0 ? `+ ${formatCurrency(row.income)}` : '-'}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-rose-500 text-sm">
                        {row.expense > 0 ? `- ${formatCurrency(row.expense)}` : '-'}
                    </td>
                    <td className="px-8 py-6 text-right font-black text-indigo-600 text-sm bg-indigo-50/30 rounded-r-2xl">
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
