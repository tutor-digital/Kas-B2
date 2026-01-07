
import React, { useState } from 'react';
import { SchoolClass, Fund, Category } from '../types';
import { Plus, Trash2, Save, School, Coins, Split, RefreshCw, Database, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';

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
  const [showSql, setShowSql] = useState(true); // Default tampilkan jika ada error

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
      
      {/* Database Setup Helper */}
      <section className={`rounded-[3rem] p-10 border-2 transition-all ${dbStatus?.connected ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-200 shadow-2xl shadow-rose-100'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl ${dbStatus?.connected ? 'bg-emerald-200 text-emerald-700' : 'bg-rose-500 text-white animate-pulse'}`}>
              {dbStatus?.connected ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Sinkronisasi Database</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${dbStatus?.connected ? 'text-emerald-600' : 'text-rose-600'}`}>
                {dbStatus?.connected ? 'Cloud Terhubung Sempurna' : 'Perlu Perbaikan Schema (Klik Solusi di Bawah)'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleForceRepair}
            className="flex items-center gap-2 px-8 py-4 bg-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
          >
            <RefreshCw size={16} className={isRepairing ? 'animate-spin' : ''} />
            Tes Ulang Koneksi
          </button>
        </div>

        {!dbStatus?.connected && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-rose-100">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertTriangle size={12} /> Pesan Error Terdeteksi:
              </p>
              <code className="text-xs font-mono text-slate-600 block bg-slate-50 p-4 rounded-xl border border-slate-100">
                {dbStatus?.error}
              </code>
            </div>
            
            <div className="pt-4 bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 text-white rotate-12">
                <Terminal size={120} />
              </div>
              <div className="relative z-10">
                <h4 className="text-sm font-black text-white mb-6 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-[10px]">FIX</span>
                  Solusi Perbaikan Database (PENTING)
                </h4>
                <div className="space-y-4 text-xs text-slate-300 font-medium leading-relaxed mb-8">
                  <p>Sistem mendeteksi tabel <code className="text-indigo-400">transactions</code> Anda belum memiliki kolom <code className="text-indigo-400">class_id</code>. Lakukan ini di Supabase:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Buka menu <span className="text-white">SQL Editor</span> di Supabase.</li>
                    <li>Buat <span className="text-white">New Query</span>.</li>
                    <li>Salin & Jalankan (Run) kode di bawah ini:</li>
                  </ol>
                </div>
                <div className="group relative">
                  <pre className="text-[10px] font-mono leading-relaxed bg-black/50 p-6 rounded-2xl overflow-x-auto text-emerald-400 border border-white/5">
{`/* Jalankan SQL ini untuk sinkronisasi schema */
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS class_id TEXT DEFAULT 'b2',
ADD COLUMN IF NOT EXISTS recorded_by TEXT DEFAULT 'Bendahara',
ADD COLUMN IF NOT EXISTS fund_id TEXT DEFAULT 'anak';

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value JSONB
);

INSERT INTO settings (key, value) 
VALUES ('balances_b2', '{"anak": 0, "perpisahan": 0}')
ON CONFLICT (key) DO NOTHING;`}
                  </pre>
                  <div className="absolute -top-3 -right-3 bg-emerald-500 text-white text-[8px] font-black px-3 py-1.5 rounded-full uppercase shadow-lg">Copy Code</div>
                </div>
                <p className="text-[9px] mt-6 italic text-slate-500">Setelah menjalankan SQL, klik tombol "Tes Ulang Koneksi" di atas.</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Kelola Kelas & Saldo Awal */}
      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-amber-100 rounded-3xl text-amber-600"><School size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Daftar Kelas</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atur kelas sekolah yang aktif</p>
          </div>
        </div>
        
        <div className="flex gap-4 mb-8">
          <input 
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Ketik Nama Kelas Baru..."
            className="flex-1 p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-amber-400 outline-none font-bold placeholder:text-slate-300"
          />
          <button onClick={handleAddClass} className="bg-amber-500 hover:bg-amber-600 text-white px-8 rounded-3xl font-black flex items-center gap-2 uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg shadow-amber-100">Tambah</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map(c => (
            <div key={c.id} className={`p-6 border-2 rounded-[2rem] flex justify-between items-center transition-all ${selectedClass.id === c.id ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${selectedClass.id === c.id ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>{c.name.charAt(0)}</div>
                <span className="font-black text-slate-700">Kelas {c.name}</span>
              </div>
              {c.id !== 'b2' && (
                <button onClick={() => onUpdateClasses(classes.filter(item => item.id !== c.id))} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><Trash2 size={18} /></button>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-100 rounded-3xl text-indigo-600"><Coins size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Saldo Fisik: Kelas {selectedClass.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo awal saat mulai menggunakan aplikasi</p>
          </div>
        </div>

        <div className="space-y-6">
          {selectedClass.funds.map(fund => (
            <div key={fund.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kantong Kas</label>
                <input 
                  value={fund.name}
                  onChange={(e) => {
                    const newFunds = selectedClass.funds.map(f => f.id === fund.id ? {...f, name: e.target.value} : f);
                    handleUpdateCurrentClass({...selectedClass, funds: newFunds});
                  }}
                  className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Saldo Awal (Rp)</label>
                <input 
                  type="number"
                  value={initialBalances[fund.id] || 0}
                  onChange={(e) => handleBalanceChange(fund.id, e.target.value)}
                  className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-black text-sm text-indigo-600"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-center pt-6">
         <div className="bg-emerald-50 text-emerald-600 px-10 py-5 rounded-full flex items-center gap-3 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-50/50 border border-emerald-100">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
            Data Tersimpan Secara Otomatis di Lokal & Cloud
         </div>
      </div>
    </div>
  );
};

export default AdminPanel;