
import React, { useState } from 'react';
import { PlusCircle, X, Info } from 'lucide-react';
import { Category, TransactionType, Transaction, FundCategory } from '../types';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: TransactionType.INCOME,
    fundCategory: FundCategory.ANAK,
    category: Category.DUES,
    date: new Date().toISOString().split('T')[0],
    recordedBy: 'Bendahara Kelas'
  });

  const isDuesIncome = formData.type === TransactionType.INCOME && formData.category === Category.DUES;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      ...formData,
      amount: Number(formData.amount),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xl font-black text-slate-800">Catat Kas</h2>
            <p className="text-xs text-slate-400 font-medium">Masukkan detail transaksi hari ini</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-300 hover:text-slate-600 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!isDuesIncome ? (
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Pilih Kantong Dana</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fundCategory: FundCategory.ANAK })}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                    formData.fundCategory === FundCategory.ANAK
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-50 text-slate-400 bg-slate-50/50'
                  }`}
                >
                  KAS ANAK
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fundCategory: FundCategory.PERPISAHAN })}
                  className={`py-3 px-3 rounded-2xl text-xs font-bold border-2 transition-all ${
                    formData.fundCategory === FundCategory.PERPISAHAN
                      ? 'border-purple-600 bg-purple-50 text-purple-700'
                      : 'border-slate-50 text-slate-400 bg-slate-50/50'
                  }`}
                >
                  KAS PERPISAHAN
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
              <Info size={20} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs font-medium text-blue-700 leading-relaxed">
                <span className="font-bold">Mode Otomatis Aktif:</span> Iuran Bulanan akan otomatis dibagi 50% ke Kas Anak dan 50% ke Kas Perpisahan.
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
              className={`py-3 rounded-2xl text-xs font-black uppercase transition-all border-2 ${
                formData.type === TransactionType.INCOME
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-50 text-slate-300'
              }`}
            >
              Uang Masuk
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
              className={`py-3 rounded-2xl text-xs font-black uppercase transition-all border-2 ${
                formData.type === TransactionType.EXPENSE
                  ? 'border-rose-500 bg-rose-50 text-rose-700'
                  : 'border-slate-50 text-slate-300'
              }`}
            >
              Uang Keluar
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Keterangan</label>
              <input
                required
                type="text"
                placeholder="Misal: Bayar Iuran Susi"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Jumlah (IDR)</label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-medium text-slate-700"
                >
                  {Object.values(Category).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200 transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            <PlusCircle size={20} />
            Simpan Data
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
