
import React, { useState } from 'react';
import { SchoolClass, Fund, Category } from '../types';
import { Plus, Trash2, Save, School, Coins, Split, RefreshCw, Database, Terminal, CheckCircle2, AlertTriangle, Users, Power, Copy, Check, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
  classes: SchoolClass[];
  selectedClass: SchoolClass;
  onUpdateClasses: (classes: SchoolClass[]) => void;
  initialBalances: Record<string, number>;
  onUpdateBalances: (balances: Record<string, number>) => void;
  onRepair: () => void;
  dbStatus?: { connected: boolean; error: string | null; needsUpdate?: boolean; rowCount?: number };
  projectId?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ classes, selectedClass, onUpdateClasses, initialBalances, onUpdateBalances, onRepair, dbStatus, projectId }) => {
  const [newClassName, setNewClassName] = useState('');
  const [isRepairing, setIsRepairing] = useState(false);
  const [copied, setCopied] = useState(false);

  const sqlCode = `/* Jalankan di SQL Editor Supabase */
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS student_name TEXT,
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS payment_date DATE;`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddClass = () => {
    if (!newClassName) return;
    const newClass: SchoolClass = {
      id: Math.random().toString(36).substr(2, 9),
      name: newClassName,
      isActive: true,
      students: [],
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

  const handleToggleStatus = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (cls) {
      handleUpdateCurrentClass({ ...cls, isActive: !cls.isActive });
    }
  };

  const handleStudentListChange = (text: string) => {
    const list = text.split('\n').map(s => s.trim()).filter(s => s !== '');
    handleUpdateCurrentClass({ ...selectedClass, students: list });
  };

  const handleHardReset = () => {
    if (confirm('Ini akan menghapus semua data LOKAL di HP ini dan memuat ulang dari Database Cloud. Lanjutkan?')) {
      localStorage.clear();
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
      window.location.reload();
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      
      {/* Database Status & Repair */}
      <section className={`rounded-[3rem] p-10 border-4 transition-all ${dbStatus?.needsUpdate ? 'bg-rose-50 border-rose-500 shadow-2xl shadow-rose-200' : dbStatus?.connected ? 'bg-emerald-50 border-emerald-100 shadow-xl' : 'bg-amber-50 border-amber-200'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-3xl ${dbStatus?.needsUpdate ? 'bg-rose-600 text-white animate-bounce' : dbStatus?.connected ? 'bg-emerald-200 text-emerald-700' : 'bg-amber-500 text-white animate-pulse'}`}>
              {dbStatus?.needsUpdate ? <AlertTriangle size={24} /> : dbStatus?.connected ? <CheckCircle2 size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800">Status Server Cloud</h3>
              <p className={`text-[10px] font-black uppercase tracking-widest ${dbStatus?.needsUpdate ? 'text-rose-600' : dbStatus?.connected ? 'text-emerald-600' : 'text-amber-600'}`}>
                {dbStatus?.needsUpdate ? '⚠️ STRUKTUR TABEL PERLU DIPERBAIKI' : dbStatus?.connected ? 'Terhubung ke Database' : 'Koneksi Terputus'}
              </p>
              {projectId && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-slate-100 px-2 py-1 rounded-md text-slate-500 font-mono">ID: {projectId}</span>
                  </div>
                  {dbStatus?.connected && (
                    <div className="text-[10px] font-bold text-slate-600">
                      Total Data: {dbStatus.rowCount !== undefined ? dbStatus.rowCount : '...'} Transaksi
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <button 
              onClick={() => { setIsRepairing(true); onRepair(); setTimeout(() => setIsRepairing(false), 1000); }}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-white rounded-3xl font-black uppercase tracking-widest text-[10px] shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95"
            >
              <RefreshCw size={16} className={isRepairing ? 'animate-spin' : ''} />
              Cek Koneksi
            </button>
            <button 
              onClick={handleHardReset}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-rose-100 text-rose-600 rounded-3xl font-black uppercase tracking-widest text-[9px] shadow-sm hover:bg-rose-200 transition-all active:scale-95"
            >
              <RotateCcw size={14} />
              Reset App di HP Ini
            </button>
          </div>
        </div>

        {(dbStatus?.needsUpdate || !dbStatus?.connected) && (
          <div className="bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden animate-in zoom-in-95">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
                    <Terminal size={20} className="text-rose-400" /> Solusi Perbaikan (Copy & Paste ke Supabase)
                  </h4>
                  <button 
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Berhasil Dicopy!' : 'Salin Kode'}
                  </button>
                </div>
                <p className="text-slate-400 text-[10px] mb-4 font-bold leading-relaxed">
                  Langkah: Buka Supabase Dashboard &gt; SQL Editor &gt; Paste kode di bawah &gt; Klik Run.
                </p>
                <pre className="text-[11px] font-mono leading-relaxed bg-black/50 p-6 rounded-2xl overflow-x-auto text-emerald-400 border border-white/5 shadow-inner">
{sqlCode}
                </pre>
             </div>
          </div>
        )}
      </section>

      {/* Kelola Kelas & Status Aktif */}
      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-indigo-100 rounded-3xl text-indigo-600"><School size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Daftar Semua Kelas</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktifkan kelas agar bisa dilihat publik</p>
          </div>
        </div>
        
        <div className="flex gap-4 mb-8">
          <input 
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
            placeholder="Tambah Kelas Baru..."
            className="flex-1 p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-bold placeholder:text-slate-300"
          />
          <button onClick={handleAddClass} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 rounded-3xl font-black flex items-center gap-2 uppercase tracking-widest text-xs transition-all active:scale-95 shadow-lg">Tambah</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map(c => (
            <div key={c.id} className={`p-6 border-2 rounded-[2rem] flex justify-between items-center transition-all ${selectedClass.id === c.id ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => handleToggleStatus(c.id)}
                  className={`p-3 rounded-2xl transition-all ${c.isActive ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-500'}`}
                  title={c.isActive ? 'Nonaktifkan Kelas' : 'Aktifkan Kelas'}
                >
                  <Power size={18} />
                </button>
                <div className="flex flex-col">
                   <span className="font-black text-slate-700">Kelas {c.name}</span>
                   <span className={`text-[8px] font-black uppercase tracking-widest ${c.isActive ? 'text-emerald-500' : 'text-rose-400'}`}>
                    {c.isActive ? 'Aktif (Dilihat Publik)' : 'Inaktif (Disembunyikan)'}
                   </span>
                </div>
              </div>
              <div className="flex gap-2">
                {c.id !== 'b2' && (
                  <button onClick={() => onUpdateClasses(classes.filter(item => item.id !== c.id))} className="text-slate-300 hover:text-rose-500 p-2 transition-colors"><Trash2 size={18} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Daftar Nama Siswa */}
      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-sky-100 rounded-3xl text-sky-600"><Users size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Daftar Nama Siswa: {selectedClass.name}</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Masukkan nama siswa agar muncul di dropdown iuran</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ketik Nama Siswa (Satu nama per baris)</label>
          <textarea
            value={selectedClass.students?.join('\n')}
            onChange={(e) => handleStudentListChange(e.target.value)}
            placeholder="Ahmad Kurniawan&#10;Siti Aminah&#10;Budi Santoso..."
            className="w-full h-48 p-6 rounded-[2rem] bg-slate-50 border-2 border-transparent focus:border-sky-400 outline-none font-bold text-sm leading-relaxed"
          />
          <div className="bg-sky-50 text-sky-600 p-4 rounded-2xl flex items-center gap-3 text-[10px] font-bold">
            <CheckCircle2 size={16} />
            Terdeteksi {selectedClass.students?.length || 0} Siswa dalam daftar.
          </div>
        </div>
      </section>

      <section className="bg-white/80 backdrop-blur-md rounded-[3rem] p-10 border border-white/60 shadow-xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-amber-100 rounded-3xl text-amber-600"><Coins size={24} /></div>
          <div>
            <h3 className="text-xl font-black text-slate-800">Saldo Awal & Nama Kantong</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Atur saldo saat mulai pakai aplikasi</p>
          </div>
        </div>

        <div className="space-y-6">
          {selectedClass.funds.map(fund => (
            <div key={fund.id} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Kantong</label>
                <input 
                  value={fund.name}
                  onChange={(e) => {
                    const newFunds = selectedClass.funds.map(f => f.id === fund.id ? {...f, name: e.target.value} : f);
                    handleUpdateCurrentClass({...selectedClass, funds: newFunds});
                  }}
                  className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-amber-400 outline-none font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Saldo Awal (Rp)</label>
                <input 
                  type="number"
                  value={initialBalances[fund.id] || 0}
                  onChange={(e) => onUpdateBalances({ ...initialBalances, [fund.id]: Number(e.target.value) })}
                  className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-amber-400 outline-none font-black text-sm text-amber-600"
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminPanel;
