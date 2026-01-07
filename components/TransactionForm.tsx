
import React, { useState } from 'react';
import { PlusCircle, X, Info, Coins } from 'lucide-react';
import { Category, TransactionType, Transaction, Fund, SplitRule } from '../types';

interface TransactionFormProps {
  funds: Fund[];
  splitRule: SplitRule;
  onAdd: (transaction: Omit<Transaction, 'id' | 'classId'>) => void;
  onClose: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ funds, splitRule, onAdd, onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: TransactionType.INCOME,
    fundId: funds[0]?.id || '',
    category: Category.DUES,
    date: new Date().toISOString().split('T')[0],
    recordedBy: 'Bendahara'
  });

  const isSplitActive = splitRule.enabled && formData.type === TransactionType.INCOME && formData.category === splitRule.category;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;
    onAdd({
      ...formData,
      amount: Number(formData.amount),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-[3rem] w-full max-w-md shadow-2xl overflow-hidden border-4 border-white">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"><PlusCircle size={24} /></div>
             <h2 className="text-xl font-black text-slate-800">Catat Kas</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full text-slate-300 hover:text-slate-600 transition-all shadow-sm">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {!isSplitActive ? (
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Pilih Kantong Kas</label>
              <div className="grid grid-cols-2 gap-3">
                {funds.map(fund => (
                  <button
                    key={fund.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, fundId: fund.id })}
                    className={`py-4 px-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      formData.fundId === fund.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                        : 'border-slate-50 text-slate-300 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    {fund.name}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border-2 border-amber-100 p-5 rounded-[2rem] flex items-start gap-3">
              <Info size={24} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Split Otomatis Aktif!</p>
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Uang akan otomatis dibagi ke {funds.map(f => f.name).join(' & ')}.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.INCOME })}
              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                formData.type === TransactionType.INCOME ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 text-slate-300'
              }`}
            >
              Uang Masuk
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: TransactionType.EXPENSE })}
              className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                formData.type === TransactionType.EXPENSE ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-50 text-slate-300'
              }`}
            >
              Uang Keluar
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Keterangan Transaksi</label>
              <input
                required type="text" placeholder="Contoh: Iuran Bulanan Susi"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Jumlah (Rp)</label>
                <input
                  required type="number" placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-slate-800 text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Kategori</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-slate-700 text-xs"
                >
                  {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-indigo-600 hover:shadow-xl hover:shadow-indigo-100 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[10px]"
          >
            <Coins size={20} /> Simpan Data Kas
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
