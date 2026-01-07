
import React, { useState } from 'react';
import { SchoolClass, Fund, Category } from '../types';
import { Plus, Trash2, Save, School, Coins, Split, RefreshCw, AlertTriangle } from 'lucide-react';

interface AdminPanelProps {
  classes: SchoolClass[];
  selectedClass: SchoolClass;
  onUpdateClasses: (classes: SchoolClass[]) => void;
  initialBalances: Record<string, number>;
  onUpdateBalances: (balances: Record<string, number>) => void;
  onRepair: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ classes, selectedClass, onUpdateClasses, initialBalances, onUpdateBalances, onRepair }) => {
  const [newClassName, setNewClassName] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);

  const handleAddClass = () => {
    if (!newClassName) return;
    const newClass: SchoolClass = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClassName,
      funds: [
        { id: 'anak', name: 'Kas Anak', color: 'indigo', isMain: true },
        { id: 'perpisahan', name: 'Kas Perpisahan', color: 'purple', isMain: false }
      ],
      splitRule: { enabled: true, category: Category.DUES, ratio: 0.5, targetFundIds: ['anak', 'perpisahan'] }
    };
    onUpdateClasses([...classes, newClass]);
    setNewClassName('');
  };

  const handleUpdateCurrentClass = (updated: SchoolClass) => {
    onUpdateClasses(classes.map(c => c.id === updated.id ? updated : c));
  };

  const handleBalanceChange = (fundId: string, val: string) => {
    onUpdateBalances({ ...initialBalances, [fundId]: Number(val) });
  };

  const handleForceRepair = async () => {
    setIsRepairing(true);
    // Kita panggil onRepair yang akan merefresh fetchData
    await onRepair();
    setTimeout(() => setIsRepairing(false), 1000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      {/* System Status / Repair Tool */}
      <section className="bg-amber-50/80 backdrop-blur-md rounded-[3rem] p-8 border-2 border-amber-200 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-200 rounded-3xl text-amber-700"><AlertTriangle size={24} /></div>
          <div>
            <h3 className="text-lg font-black text-amber-900">Alat Pemulihan Data</h3>
            <p className="text-xs font-bold text-amber-700">Jika data B2 hilang, gunakan tombol ini untuk sinkronisasi ulang dengan Cloud.</p>
          </div>
        </div>
        <button 
          onClick={handleForceRepair}
          disabled={isRepairing}
          className={`flex items-center gap-2 px-8 py-4 bg-amber-600 text-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-200 transition-all ${isRepairing ? 'opacity-50 animate-pulse' : 'hover:bg-amber-700 active:scale-95'}`}
        >
          <RefreshCw size={16} className={isRepairing ? 'animate-spin' : ''} />
          {isRepairing ? 'Mensinkronkan...' : 'Sinkronisasi Ulang Cloud'}
        </button>
      </section>

      {/* 1. Kelola Kelas */}
      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-amber-100 rounded-3xl text-amber-600"><School size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Daftar Kelas</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tambah atau hapus kelas sekolah</p>
          </div>
        </div>
        
        <div className="flex gap-4 mb-8">
          <input 
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Nama Kelas Baru (Contoh: B3)"
            className="flex-1 p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-amber-400 outline-none font-bold"
          />
          <button onClick={handleAddClass} className="bg-amber-500 text-white px-8 rounded-3xl font-black flex items-center gap-2 shadow-lg shadow-amber-100 uppercase tracking-widest text-xs"><Plus size={18} /> Tambah</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <div key={c.id} className={`p-6 border-2 rounded-[2rem] flex justify-between items-center group transition-all ${selectedClass.id === c.id ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex flex-col">
                <span className="font-black text-slate-700">Kelas {c.name}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">ID: {c.id}</span>
              </div>
              {c.id !== 'b2' && (
                <button 
                  onClick={() => onUpdateClasses(classes.filter(item => item.id !== c.id))}
                  className="text-slate-300 hover:text-rose-500 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 2. Pengaturan Kas & Dana */}
      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-100 rounded-3xl text-indigo-600"><Coins size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Pengaturan Kas: {selectedClass.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tentukan kantong dana & saldo awal</p>
          </div>
        </div>

        <div className="space-y-6">
          {selectedClass.funds.map(fund => (
            <div key={fund.id} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kas</label>
                <input 
                  value={fund.name}
                  onChange={(e) => {
                    const newFunds = selectedClass.funds.map(f => f.id === fund.id ? {...f, name: e.target.value} : f);
                    handleUpdateCurrentClass({...selectedClass, funds: newFunds});
                  }}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Saldo Awal</label>
                <input 
                  type="number"
                  value={initialBalances[fund.id] || 0}
                  onChange={(e) => handleBalanceChange(fund.id, e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold text-sm"
                />
              </div>
              <div className="flex gap-2">
                 <button className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Aturan Pembagian (Split Rules) */}
      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-purple-100 rounded-3xl text-purple-600"><Split size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Aturan Pembagian Uang</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Konfigurasi pembagian iuran otomatis</p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
            <div>
              <p className="font-black text-slate-700">Aktifkan Pembagian Otomatis</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Uang masuk kategori tertentu akan dipecah</p>
            </div>
            <button 
              onClick={() => handleUpdateCurrentClass({...selectedClass, splitRule: {...selectedClass.splitRule, enabled: !selectedClass.splitRule.enabled}})}
              className={`w-14 h-8 rounded-full transition-all relative ${selectedClass.splitRule.enabled ? 'bg-indigo-500' : 'bg-slate-300'}`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${selectedClass.splitRule.enabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          {selectedClass.splitRule.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Pemicu</label>
                <select 
                  value={selectedClass.splitRule.category}
                  onChange={(e) => handleUpdateCurrentClass({...selectedClass, splitRule: {...selectedClass.splitRule, category: e.target.value as Category}})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold text-sm"
                >
                  {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rasio Pembagian (%)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="10" max="90" step="5"
                    value={selectedClass.splitRule.ratio * 100}
                    onChange={(e) => handleUpdateCurrentClass({...selectedClass, splitRule: {...selectedClass.splitRule, ratio: Number(e.target.value)/100}})}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="font-black text-slate-700 min-w-[3rem] text-center">{selectedClass.splitRule.ratio * 100}%</span>
                </div>
                <p className="text-[9px] text-slate-400 font-bold italic mt-1">Uang akan dibagi {selectedClass.splitRule.ratio * 100}% : {(1 - selectedClass.splitRule.ratio) * 100}%</p>
              </div>
            </div>
          )}
        </div>
      </section>
      
      <div className="flex justify-center pt-6">
         <div className="bg-emerald-50 text-emerald-600 px-8 py-4 rounded-full flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100 animate-pulse">
            <Save size={16} /> Perubahan Disimpan Otomatis ke Cloud
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;