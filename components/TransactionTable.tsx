
import React from 'react';
import { Transaction, TransactionType, Fund } from '../types';
import { Trash2, Tag, Calendar, Link as LinkIcon, User } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  funds: Fund[];
  onDelete: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, funds, onDelete }) => {
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

  const getFundInfo = (fundId: string) => funds.find(f => f.id === fundId.toLowerCase());

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-xl border border-white/60 overflow-hidden">
      <div className="p-10 border-b border-slate-50 flex items-center justify-between">
        <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Riwayat Kas Sekolah</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/30">
            <tr>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail & Kantong</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
              <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Opsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-10 py-20 text-center text-slate-300 text-xs font-black uppercase tracking-widest italic">Belum Ada Data Transaksi</td>
              </tr>
            ) : (
              transactions.map((t) => {
                const fund = getFundInfo(t.fundId);
                const isSplit = t.recordedBy === 'Sistem Split';
                
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar size={12} />
                        <span className="text-xs font-black uppercase tracking-tighter">{formatDate(t.date)}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <span className={`text-[8px] px-3 py-1 rounded-full font-black text-white uppercase tracking-widest shadow-sm ${fund?.id === 'perpisahan' ? 'bg-purple-600' : 'bg-indigo-500'}`}>
                            {fund?.name || 'Kas'}
                          </span>
                          <span className="text-sm font-black text-slate-700">{t.description}</span>
                          {isSplit && (
                            <span className="flex items-center gap-1 bg-amber-50 text-amber-600 text-[7px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-100">
                              <LinkIcon size={8} /> Split 50/50
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-1">
                            <Tag size={10} /> {t.category}
                          </span>
                          <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-1">
                            <User size={10} /> {t.recordedBy}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className={`text-sm font-black ${t.type === TransactionType.INCOME ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button onClick={() => onDelete(t.id)} className="text-slate-100 hover:text-rose-500 p-3 hover:bg-rose-50 rounded-2xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;