
import React from 'react';
import { Transaction, TransactionType, FundCategory } from '../types';
import { Trash2, Tag, Layers } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short'
    }).format(new Date(dateStr));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-8 border-b border-slate-50 flex items-center justify-between">
        <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Riwayat Kas</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/30">
            <tr>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail & Kantong</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
              <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Opsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-8 py-16 text-center text-slate-400 text-sm font-medium italic">Belum ada transaksi</td>
              </tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-xs font-black text-slate-300">{formatDate(t.date)}</span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black text-white uppercase tracking-tighter ${
                          t.fundCategory === FundCategory.ANAK ? 'bg-indigo-500' : 'bg-purple-600'
                        }`}>
                          {t.fundCategory === FundCategory.ANAK ? 'Anak' : 'Perpisahan'}
                        </span>
                        <span className="text-sm font-bold text-slate-700">{t.description}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Tag size={10} /> {t.category}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-sm font-black ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button onClick={() => onDelete(t.id)} className="text-slate-200 hover:text-rose-500 p-2 hover:bg-rose-50 rounded-xl transition-all">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
