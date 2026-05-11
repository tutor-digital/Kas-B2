
import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, X, Info, Coins, Sparkles, User, Camera, FileText, Check, Pencil, CalendarClock, Wallet } from 'lucide-react';
import { Category, TransactionType, Transaction, Fund, SplitRule } from '../types';

interface TransactionFormProps {
  funds: Fund[];
  students: string[];
  splitRule: SplitRule;
  initialData?: Transaction | null;
  defaultType?: TransactionType;
  onAdd: (transaction: Omit<Transaction, 'id' | 'classId'>) => void;
  onUpdate?: (transaction: Transaction) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ funds, students, splitRule, initialData, defaultType = TransactionType.INCOME, onAdd, onUpdate, onClose }) => {
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: initialData?.type || defaultType,
    fundId: funds[0]?.id || 'anak',
    category: Category.DUES,
    date: new Date().toISOString().split('T')[0],
    recordedBy: 'Bendahara',
    studentName: '',
    attachmentUrl: ''
  });
  
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [paymentYear, setPaymentYear] = useState(currentYear);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  useEffect(() => {
    if (initialData && initialData.amount !== undefined) {
      setFormData({
        description: initialData.description || '',
        amount: initialData.amount !== undefined ? initialData.amount.toString() : '',
        type: initialData.type,
        fundId: initialData.fundId || (splitRule.enabled && initialData.category === splitRule.category ? 'gabungan' : (funds[0]?.id || 'anak')),
        category: initialData.category || Category.DUES,
        date: initialData.date || new Date().toISOString().split('T')[0],
        recordedBy: initialData.recordedBy || 'Bendahara',
        studentName: initialData.studentName || '',
        attachmentUrl: initialData.attachmentUrl || ''
      });
      
      if (initialData.paymentDate) {
         const d = new Date(initialData.paymentDate);
         setSelectedMonths([d.getMonth()]);
         setPaymentYear(d.getFullYear());
      }
    } else {
        // Reset defaults if needed, specifically ensuring correct type
        const today = new Date();
        setSelectedMonths([today.getMonth()]);
        setPaymentYear(today.getFullYear());
        
        // Ensure type respects defaultType if initialData is not present
        if (!initialData) {
            setFormData(prev => ({ 
              ...prev, 
              type: defaultType,
              fundId: splitRule.enabled && prev.category === splitRule.category && defaultType === TransactionType.INCOME ? 'gabungan' : (funds[0]?.id || 'anak')
            }));
        }
    }
  }, [initialData, defaultType, funds, splitRule]);

  // Auto-switch fundId when category or type changes
  useEffect(() => {
    if (!initialData && splitRule.enabled) {
      if (formData.category === splitRule.category && formData.type === TransactionType.INCOME) {
        setFormData(prev => ({ ...prev, fundId: 'gabungan' }));
      } else if (formData.fundId === 'gabungan' && (formData.category !== splitRule.category || formData.type !== TransactionType.INCOME)) {
        setFormData(prev => ({ ...prev, fundId: funds[0]?.id || 'anak' }));
      }
    }
  }, [formData.category, formData.type, splitRule, initialData, funds]);

  const toggleMonth = (idx: number) => {
    if (initialData) return;
    setSelectedMonths(prev => 
      prev.includes(idx) ? prev.filter(m => m !== idx) : [...prev, idx]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
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
    
    const isMultiMonth = !initialData && formData.category === Category.DUES && formData.type === TransactionType.INCOME && selectedMonths.length > 0;

    if (isMultiMonth) {
        const totalAmount = Number(formData.amount);
        const amountPerTx = Math.round(totalAmount / selectedMonths.length);

        selectedMonths.sort((a,b) => a - b).forEach(monthIndex => {
            const monthName = months[monthIndex];
            const paymentDateStr = `${paymentYear}-${String(monthIndex + 1).padStart(2, '0')}-01`;
            
            const finalDescription = (formData.category === Category.DUES && formData.studentName)
                ? `${formData.description.split(' (')[0]} (${formData.studentName} - ${monthName} ${paymentYear})`
                : `${formData.description} (${monthName} ${paymentYear})`;

            const payload = {
                ...formData,
                description: finalDescription,
                amount: amountPerTx,
                paymentDate: paymentDateStr
            };
            onAdd(payload);
        });
    } else {
        const finalDescription = (formData.category === Category.DUES && formData.studentName)
        ? `${formData.description.split(' (')[0]} (${formData.studentName})`
        : formData.description;

        let paymentDateStr = undefined;
        if (selectedMonths.length > 0) {
            paymentDateStr = `${paymentYear}-${String(selectedMonths[0] + 1).padStart(2, '0')}-01`;
        }

        const transactionPayload = {
            ...formData,
            description: finalDescription,
            amount: Number(formData.amount),
            paymentDate: paymentDateStr
        };

        if (initialData && onUpdate) {
            onUpdate({ ...transactionPayload, id: initialData.id, classId: initialData.classId });
        } else {
            onAdd(transactionPayload);
        }
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-[#1e1b2e] rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-[#1e1b2e]/90 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3">
             <div className={`p-2 rounded-xl ${initialData ? 'bg-amber-500/20 text-amber-400' : 'bg-violet-500/20 text-violet-400'}`}>
                {initialData ? <Pencil size={24} /> : <PlusCircle size={24} />}
             </div>
             <h2 className="text-xl font-black text-white">{initialData ? 'Ubah Data' : 'Catat Baru'}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Date Input */}
          <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-5 py-3 rounded-2xl border border-white/10 bg-[#110e1b] focus:border-violet-500 outline-none transition-all font-bold text-white"
                style={{ colorScheme: 'dark' }}
              />
          </div>

          {/* Transaction Type */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                formData.type === TransactionType.INCOME ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-white/5 text-slate-500 bg-white/5 hover:bg-white/10'
              }`}
            >
              Uang Masuk
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                formData.type === TransactionType.EXPENSE ? 'border-rose-500/50 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'border-white/5 text-slate-500 bg-white/5 hover:bg-white/10'
              }`}
            >
              Uang Keluar
            </button>
          </div>

          <div className="space-y-4">
            {/* Fund Selection */}
            <div className="animate-in slide-in-from-top-2 duration-300">
                <label className={`block text-[10px] font-black mb-2 uppercase tracking-widest ml-1 flex items-center gap-2 ${formData.type === TransactionType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <Wallet size={12} /> {formData.type === TransactionType.INCOME ? 'Masuk ke Kantong' : 'Sumber Dana'}
                </label>
                <select
                value={formData.fundId}
                onChange={(e) => setFormData({ ...formData, fundId: e.target.value })}
                className={`w-full px-5 py-4 rounded-2xl border bg-[#110e1b] outline-none transition-all font-black text-[11px] uppercase tracking-wider cursor-pointer ${
                    formData.type === TransactionType.INCOME 
                    ? 'border-emerald-500/30 text-emerald-200 focus:border-emerald-500' 
                    : 'border-rose-500/30 text-rose-200 focus:border-rose-500'
                }`}
                >
                {funds.map(f => (
                    <option key={f.id} value={f.id} className="bg-[#1e1b2e]">{f.name}</option>
                ))}
                {splitRule.enabled && (
                    <option value="gabungan" className="bg-[#1e1b2e]">Gabungan (Split 50/50)</option>
                )}
                </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#110e1b] focus:border-violet-500 outline-none transition-all font-black text-white text-[11px] uppercase tracking-wider appearance-none"
              >
                {Object.values(Category).map(cat => <option key={cat} value={cat} className="bg-[#1e1b2e]">{cat}</option>)}
              </select>
            </div>

            {/* Student Payment Details (Dues only) */}
            {formData.category === Category.DUES && formData.type === TransactionType.INCOME && (
              <div className="animate-in slide-in-from-top-2 duration-300 space-y-4">
                <div>
                    <label className="block text-[10px] font-black text-indigo-400 mb-2 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <User size={12} /> Nama Siswa
                    </label>
                    <select
                    required
                    value={formData.studentName}
                    onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl border border-indigo-500/30 bg-indigo-900/10 focus:border-indigo-500 outline-none transition-all font-black text-indigo-200 text-[11px] uppercase tracking-wider"
                    >
                    <option value="" className="bg-[#1e1b2e]">-- Pilih Nama Siswa --</option>
                    {students.map(s => <option key={s} value={s} className="bg-[#1e1b2e]">{s}</option>)}
                    </select>
                </div>

                <div className="bg-[#110e1b] p-4 rounded-3xl border border-white/5">
                    <label className="block text-[10px] font-black text-indigo-400 mb-3 uppercase tracking-widest flex justify-between items-center">
                        <span className="flex items-center gap-2"><CalendarClock size={12} /> Iuran Tahun?</span>
                        <select 
                            value={paymentYear} 
                            onChange={(e) => setPaymentYear(Number(e.target.value))}
                            className="bg-white/10 px-2 py-1 rounded-lg text-indigo-300 font-black outline-none text-xs border border-white/10"
                        >
                            {yearOptions.map(y => (
                                <option key={y} value={y} className="bg-[#1e1b2e]">{y}</option>
                            ))}
                        </select>
                    </label>
                    <p className="text-[9px] text-slate-500 mb-2 font-bold ml-1">Pilih Bulan (Bisa lebih dari satu):</p>
                    <div className="grid grid-cols-4 gap-2">
                        {months.map((m, idx) => (
                            <button
                                key={m}
                                type="button"
                                onClick={() => toggleMonth(idx)}
                                className={`py-2 rounded-xl text-[10px] font-black transition-all ${selectedMonths.includes(idx) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 transform scale-105' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                    {selectedMonths.length > 1 && !initialData && (
                        <p className="text-[9px] text-indigo-400 mt-2 font-bold italic text-center">
                            *Total {selectedMonths.length} bulan. Rp {Number(formData.amount || 0).toLocaleString('id-ID')} akan dibagi rata.
                        </p>
                    )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Keterangan</label>
              <input
                required type="text" placeholder="Keterangan transaksi..."
                value={formData.description.split(' (')[0]}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#110e1b] focus:border-violet-500 outline-none transition-all font-bold text-white placeholder-slate-700"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Total Jumlah (Rp)</label>
              <input
                required type="number" placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-white/10 bg-[#110e1b] focus:border-violet-500 outline-none transition-all font-black text-white text-xl text-center placeholder-slate-700"
              />
            </div>
            
            {/* File Upload (Expense only) */}
            {formData.type === TransactionType.EXPENSE && (
              <div className="pt-2">
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Bukti Foto</label>
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full py-4 rounded-2xl border border-dashed flex items-center justify-center gap-3 transition-all ${
                    formData.attachmentUrl ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#110e1b] border-white/10 text-slate-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {isUploading ? <span className="animate-pulse">Mengunggah...</span> : formData.attachmentUrl ? <><Check size={18} /><span>Foto Terlampir</span></> : <><Camera size={18} /><span>Ganti/Pilih Foto</span></>}
                </button>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            type="submit"
            className={`w-full text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px] shadow-xl ${
              initialData ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' : 'bg-violet-600 hover:bg-violet-700 shadow-violet-600/30'
            }`}
          >
            {initialData ? <><Pencil size={20} /> Simpan Perubahan</> : <><Coins size={20} /> Simpan Data Baru</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
