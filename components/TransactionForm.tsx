
import React, { useState, useRef } from 'react';
import { PlusCircle, X, Info, Coins, Sparkles, User, Camera, FileText, Check } from 'lucide-react';
import { Category, TransactionType, Transaction, Fund, SplitRule } from '../types';

interface TransactionFormProps {
  funds: Fund[];
  students: string[];
  splitRule: SplitRule;
  onAdd: (transaction: Omit<Transaction, 'id' | 'classId'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ funds, students, splitRule, onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: TransactionType.INCOME,
    fundId: funds[0]?.id || 'anak',
    category: Category.DUES,
    date: new Date().toISOString().split('T')[0],
    recordedBy: 'Bendahara',
    studentName: '',
    attachmentUrl: ''
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSplitActive = splitRule.enabled && 
                       formData.type === TransactionType.INCOME && 
                       formData.category === splitRule.category;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // Simulasi upload ke Cloud/Supabase Storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, attachmentUrl: reader.result as string });
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    
    // Jika iuran dan ada nama siswa, deskripsi ditambahkan nama siswa agar lebih jelas
    const finalDescription = (formData.category === Category.DUES && formData.studentName)
      ? `${formData.description} (${formData.studentName})`
      : formData.description;

    onAdd({
      ...formData,
      description: finalDescription,
      amount: Number(formData.amount),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border-4 border-white animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><PlusCircle size={24} /></div>
             <h2 className="text-xl font-black text-slate-800">Catat Kas Baru</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-300 hover:text-slate-600 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                formData.type === TransactionType.INCOME ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-inner' : 'border-slate-50 text-slate-300 bg-slate-50/30'
              }`}
            >
              Uang Masuk
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                formData.type === TransactionType.EXPENSE ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-inner' : 'border-slate-50 text-slate-300 bg-slate-50/30'
              }`}
            >
              Uang Keluar
            </button>
          </div>

          {/* Input Kategori & Nama Siswa (Jika Iuran) */}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Kategori Transaksi</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-slate-700 text-[11px] uppercase tracking-wider"
              >
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {formData.category === Category.DUES && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-[10px] font-black text-indigo-500 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User size={12} /> Nama Siswa yang Bayar
                </label>
                <select
                  required
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-slate-700 text-[11px] uppercase tracking-wider"
                >
                  <option value="">-- Pilih Nama Siswa --</option>
                  {students.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <p className="text-[8px] font-bold text-slate-400 mt-2 italic px-1">*Pilih nama agar tercatat otomatis di daftar iuran.</p>
              </div>
            )}
          </div>

          {isSplitActive && (
            <div className="bg-indigo-600 p-6 rounded-[2rem] flex items-start gap-4 shadow-xl shadow-indigo-100 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-2 bg-white/20 rounded-xl text-white">
                <Sparkles size={20} />
              </div>
              <p className="text-[10px] font-bold text-white leading-relaxed">
                <span className="font-black uppercase tracking-widest">Split Aktif!</span> Iuran akan otomatis dibagi 50/50 ke Kas Anak & Perpisahan.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Keterangan / Deskripsi</label>
              <input
                required type="text" placeholder="Contoh: Iuran Bulan Agustus"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Jumlah (Rp)</label>
              <input
                required type="number" placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-slate-800 text-xl text-center"
              />
            </div>
            
            {/* Fitur Upload untuk Pengeluaran */}
            {formData.type === TransactionType.EXPENSE && (
              <div className="pt-2">
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Lampiran Bukti (Foto Nota)</label>
                <input 
                  type="file" accept="image/*" className="hidden" 
                  ref={fileInputRef} onChange={handleFileChange} 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-3 transition-all ${
                    formData.attachmentUrl 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600' 
                    : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-500'
                  }`}
                >
                  {isUploading ? (
                    <span className="animate-pulse">Mengunggah...</span>
                  ) : formData.attachmentUrl ? (
                    <>
                      <Check size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Foto Berhasil Dilampirkan</span>
                    </>
                  ) : (
                    <>
                      <Camera size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Klik untuk Foto / Pilih File</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
          >
            <Coins size={20} /> Simpan Data Sekarang
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
