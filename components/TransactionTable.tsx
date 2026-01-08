
import React, { useState } from 'react';
import { Transaction, TransactionType, Fund } from '../types';
import { Trash2, Tag, Calendar, Sparkles, User, Layers, Image as ImageIcon, ExternalLink, X, Pencil } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  funds: Fund[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  isAdmin: boolean;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, funds, onDelete, onEdit, isAdmin }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short'
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getFundInfo = (fundId: string) => {
    if (fundId === 'gabungan') return { id: 'gabungan', name: 'Gabungan', color: 'indigo' };
    return funds.find(f => f.id === fundId.toLowerCase());
  };

  return (
    <>
      <div className="bg-white/80 backdrop-blur-md rounded-[3rem] shadow-xl border border-white/60 overflow-hidden animate-in fade-in duration-500">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
          <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Riwayat Kas Sekolah</h2>
          {!isAdmin && (
             <span className="text-[8px] font-black bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-widest">Mode Lihat</span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30">
              <tr>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail & Kantong</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-slate-300 text-xs font-black uppercase tracking-widest italic">Belum Ada Transaksi</td>
                </tr>
              ) : (
                transactions.map((t) => {
                  const fund = getFundInfo(t.fundId);
                  const isSplit = t.fundId === 'gabungan';
                  
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
                            <span className={`text-[8px] px-3 py-1 rounded-full font-black text-white uppercase tracking-widest shadow-sm ${isSplit ? 'bg-gradient-to-r from-sky-500 to-purple-500' : fund?.id === 'perpisahan' ? 'bg-purple-600' : 'bg-indigo-500'}`}>
                              {fund?.name || 'Kas'}
                            </span>
                            <span className="text-sm font-black text-slate-700">{t.description}</span>
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
                        <div className="flex items-center justify-end gap-1">
                          {t.attachmentUrl && (
                            <button 
                              onClick={() => setPreviewImage(t.attachmentUrl!)}
                              className="text-indigo-400 hover:text-indigo-600 p-2.5 hover:bg-indigo-50 rounded-xl transition-all"
                              title="Lihat Bukti Foto"
                            >
                              <ImageIcon size={16} />
                            </button>
                          )}
                          {isAdmin && (
                            <>
                              <button 
                                onClick={() => onEdit(t)} 
                                className="text-amber-400 hover:text-amber-600 p-2.5 hover:bg-amber-50 rounded-xl transition-all"
                                title="Edit Transaksi"
                              >
                                <Pencil size={16} />
                              </button>
                              <button 
                                onClick={() => onDelete(t.id)} 
                                className="text-slate-200 hover:text-rose-500 p-2.5 hover:bg-rose-50 rounded-xl transition-all"
                                title="Hapus Transaksi"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Preview Gambar */}
      {previewImage && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-6 max-w-2xl w-full relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute -top-4 -right-4 bg-rose-500 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-all"
            >
              <X size={24} />
            </button>
            <div className="p-4 bg-slate-50 rounded-[2rem] overflow-hidden border-4 border-white shadow-inner">
               <img src={previewImage} alt="Bukti Nota" className="w-full h-auto rounded-2xl max-h-[70vh] object-contain" />
            </div>
            <div className="mt-6 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lampiran Bukti Transaksi</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionTable;