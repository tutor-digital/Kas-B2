
import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, Fund } from '../types';
import { Trash2, Tag, Calendar, Sparkles, User, Layers, Image as ImageIcon, ExternalLink, X, Pencil, ZoomIn, Filter } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  funds: Fund[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  isAdmin: boolean;
  enableFilter?: boolean; // Prop baru untuk mengaktifkan/menonaktifkan filter
}

const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, funds, onDelete, onEdit, isAdmin, enableFilter = false }) => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // State untuk Filter
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState<number>(-1); // -1 artinya "Semua Bulan"
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Generate opsi tahun (2 tahun lalu s/d 2 tahun depan)
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  // Logika Filter
  const filteredTransactions = useMemo(() => {
    if (!enableFilter) return transactions;

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      const matchYear = tDate.getFullYear() === selectedYear;
      const matchMonth = selectedMonth === -1 || tDate.getMonth() === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [transactions, selectedYear, selectedMonth, enableFilter]);

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
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
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
        <div className="p-8 md:p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                Riwayat Kas Sekolah
                {enableFilter && filteredTransactions.length > 0 && (
                    <span className="bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full text-[9px]">{filteredTransactions.length} Data</span>
                )}
            </h2>
            {!isAdmin && (
                <span className="md:hidden text-[8px] font-black bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-widest">Mode Lihat</span>
            )}
          </div>

          {/* Bagian Filter */}
          {enableFilter ? (
             <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Filter size={14} className="text-slate-400" />
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
                    >
                        <option value={-1}>Semua Bulan</option>
                        {months.map((m, idx) => (
                            <option key={idx} value={idx}>{m}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                    <Calendar size={14} className="text-slate-400" />
                    <select 
                        value={selectedYear} 
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
                    >
                        {yearOptions.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
             </div>
          ) : (
            !isAdmin && (
                <span className="hidden md:inline-block text-[8px] font-black bg-slate-100 text-slate-400 px-3 py-1.5 rounded-full uppercase tracking-widest">Mode Lihat</span>
             )
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/30">
              <tr>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Lengkap</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail & Kantong</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-10 py-20 text-center text-slate-300">
                    <div className="flex flex-col items-center gap-2">
                        <Filter size={24} className="text-slate-200" />
                        <span className="text-xs font-black uppercase tracking-widest italic">
                            {enableFilter ? 'Tidak ada transaksi di periode ini' : 'Belum Ada Transaksi'}
                        </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => {
                  const fund = getFundInfo(t.fundId);
                  const isSplit = t.fundId === 'gabungan';
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-10 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3 text-slate-500">
                          <div className="p-2 bg-indigo-50 text-indigo-500 rounded-xl">
                            <Calendar size={16} />
                          </div>
                          <span className="text-xs font-black uppercase tracking-tight">{formatDate(t.date)}</span>
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
                            {t.paymentDate && (
                                <span className="text-[9px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                                    Iuran {new Date(t.paymentDate).toLocaleString('id-ID', { month: 'long', year: 'numeric' })}
                                </span>
                            )}
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
                              className="text-indigo-400 hover:text-indigo-600 p-2.5 hover:bg-indigo-50 rounded-xl transition-all group relative"
                              title="Lihat Bukti Foto"
                            >
                              <ImageIcon size={16} />
                              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                              </span>
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

      {/* Modal Preview Gambar (Fixed Full Screen Z-Index High) */}
      {previewImage && (
        <div className="fixed inset-0 bg-black z-[10000] flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 pointer-events-auto">
            {/* Header Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[10001]">
               <span className="text-white/80 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                 <ImageIcon size={16} /> Pratinjau Bukti
               </span>
               <button 
                onClick={() => setPreviewImage(null)}
                className="bg-white/20 hover:bg-white/40 text-white p-4 rounded-full transition-all backdrop-blur-md group active:scale-95"
              >
                <X size={28} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Container Gambar */}
            <div className="w-full h-full flex items-center justify-center p-4 md:p-10 relative">
               <img 
                 src={previewImage} 
                 alt="Bukti Nota" 
                 className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10"
               />
            </div>
            
            <p className="absolute bottom-8 text-white/50 text-[10px] font-black uppercase tracking-widest">
               Ketuk tombol silang di pojok kanan atas untuk menutup
            </p>
        </div>
      )}
    </>
  );
};

export default TransactionTable;
