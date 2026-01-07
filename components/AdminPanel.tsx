
import React, { useState } from 'react';
import { SchoolClass, Fund, Category } from '../types';
import { Plus, Trash2, Save, School, Coins, Split, RefreshCw, Database, Terminal } from 'lucide-react';

interface AdminPanelProps {
  classes: SchoolClass[];
  selectedClass: SchoolClass;
  onUpdateClasses: (classes: SchoolClass[]) => void;
  initialBalances: Record<string, number>;
  onUpdateBalances: (balances: Record<string, number>) => void;
  onRepair: () => void;
  dbStatus?: { connected: boolean; error: string | null };
}

const AdminPanel: React.FC<AdminPanelProps> = ({ classes, selectedClass, onUpdateClasses, initialBalances, onUpdateBalances, onRepair, dbStatus }) => {
  const [newClassName, setNewClassName] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);
  const [showSql, setShowSql] = useState(false);

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
    await onRepair();
    setTimeout(() => setIsRepairing(false), 1000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* Database Debugger Section */}
      <section className={`rounded-[3rem] p-10 border-2 transition-all ${dbStatus?.connected ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl ${dbStatus?.connected ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-200 text-rose-700'}`}>
              <Database size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Status Database Cloud</h3>
              <p className={`text-xs font-bold ${dbStatus?.connected ? 'text-emerald-600' : 'text-rose-600'}`}>
                {dbStatus?.connected ? 'Terhubung & Sinkron' : 'Perlu Perbaikan Schema'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleForceRepair}
            className="flex items-center gap-2 px-8 py-4 bg-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-sm border hover:bg-slate-50"
          >
            <RefreshCw size={16} className={isRepairing ? 'animate-spin' : ''} />
            Tes Ulang Koneksi
          </button>
        </div>

        {!dbStatus?.connected && (
          <div className="space-y-4">
            <div className="bg-white/60 p-6 rounded-[2rem] border border-rose-200">
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-2">Pesan Error:</p>
              <code className="text-xs font-mono text-rose-600 block bg-rose-100/50 p-4 rounded-xl">
                {dbStatus?.error}
              </code>
            </div>
            
            <div className="pt-4">
              <button onClick={() => setShowSql(!showSql)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                <Terminal size={14} />
                {showSql ? 'Tutup Panduan' : 'Lihat Solusi Perbaikan (PENTING)'}
              </button>
              
              {showSql && (
                <div className="mt-4 p-8 bg-slate-900 rounded-[2.5rem] text-slate-300 animate-in slide-in-from-top-4 duration-300">
                  <h4 className="text-sm font-black text-white mb-4 uppercase tracking-widest">Cara Memperbaiki Database:</h4>
                  <ol className="text-xs space-y-4 list-decimal list-inside mb-6 font-medium leading-relaxed">
                    <li>Buka <strong>SQL Editor</strong> di Dashboard Supabase Anda.</li>
                    <li>Salin dan jalankan skrip di bawah untuk menambah kolom yang kurang (Data lama Anda tidak akan hilang):</li>
                  </ol>
                  <pre className="text-[10px] font-mono leading-relaxed bg-black/40 p-5 rounded-2xl overflow-x-auto text-emerald-400">
{`/* Menambah kolom class_id & recorded_by yang kurang */
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS class_id TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS recorded_by TEXT;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS fund_id TEXT;

/* Mengisi class_id untuk data yang sudah ada */
UPDATE transactions SET class_id = 'b2' WHERE class_id IS NULL;

/* Membuat tabel settings jika belum ada */
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB
);`}
                  </pre>
                  <p className="text-[9px] mt-4 italic text-slate-500">Note: Setelah menjalankan SQL di atas, klik tombol "Tes Ulang Koneksi" di atas.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Kelola Kelas & Saldo Awal (Tetap sama) */}
      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-amber-100 rounded-3xl text-amber-600"><School size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Daftar Kelas</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tambah kelas sekolah lainnya</p>
          </div>
        </div>
        
        <div className="flex gap-4 mb-8">
          <input 
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Nama Kelas Baru"
            className="flex-1 p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-amber-400 outline-none font-bold"
          />
          <button onClick={handleAddClass} className="bg-amber-500 text-white px-8 rounded-3xl font-black flex items-center gap-2 uppercase tracking-widest text-xs">Tambah</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <div key={c.id} className={`p-6 border-2 rounded-[2rem] flex justify-between items-center transition-all ${selectedClass.id === c.id ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
              <span className="font-black text-slate-700">Kelas {c.name}</span>
              {c.id !== 'b2' && (
                <button onClick={() => onUpdateClasses(classes.filter(item => item.id !== c.id))} className="text-slate-300 hover:text-rose-500 p-2"><Trash2 size={18} /></button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-100 rounded-3xl text-indigo-600"><Coins size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Saldo Awal: Kelas {selectedClass.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo fisik di tangan bendahara</p>
          </div>
        </div>

        <div className="space-y-6">
          {selectedClass.funds.map(fund => (
            <div key={fund.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Saldo Awal (Rp)</label>
                <input 
                  type="number"
                  value={initialBalances[fund.id] || 0}
                  onChange={(e) => handleBalanceChange(fund.id, e.target.value)}
                  className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold text-sm"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center pt-6">
         <div className="bg-emerald-50 text-emerald-600 px-8 py-4 rounded-full flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-100">
            <Save size={16} /> Data Tersimpan Otomatis (Lokal & Cloud)
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;