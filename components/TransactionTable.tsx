
import React from 'react';
import { Transaction, TransactionType, Fund } from '../types';
import { ArrowUpRight, ArrowDownLeft, Trash2, Edit2 } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  funds: Fund[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  isAdmin: boolean;
  enableFilter?: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, onDelete, isAdmin }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="w-full pb-24">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-bold text-white">Riwayat Transaksi</h3>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="py-12 text-center bg-[#1e1b2e] rounded-3xl border border-white/5">
             <p className="text-xs text-slate-500 font-medium">Belum ada transaksi tercatat.</p>
          </div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className="bg-[#1e1b2e] p-4 rounded-2xl flex items-center justify-between border border-white/5 hover:bg-[#252139] transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${t.type === TransactionType.INCOME ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {t.type === TransactionType.INCOME ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-sm font-semibold text-white truncate w-40 md:w-auto">{t.description}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(t.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} • {t.category}
                  </p>
                </div>
              </div>
              
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                </p>
                {isAdmin && (
                  <button onClick={() => onDelete(t.id)} className="text-[9px] text-rose-500/40 hover:text-rose-500 mt-1 block w-full text-right transition-colors">
                    Hapus
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionTable;
