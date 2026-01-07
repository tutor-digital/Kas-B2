
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import FinancialAnalytics from './components/FinancialAnalytics';
import AIAssistant from './components/AIAssistant';
import AdminPanel from './components/AdminPanel';
import { Transaction, TransactionType, SummaryStats, SchoolClass, Category, Fund } from './types';
import { Plus, RefreshCw, Sun, Cloud, Lock, Database, Pencil, Book, WifiOff, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hmkgweuqhoppmxpovwkb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta2d3ZXVxaG9wcG14cG92d2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTA3NTMsImV4cCI6MjA4MzI2Njc1M30.Ypqk5TYHqK54u4UESs8KIU4eb2mMRKoWeDWdVXRBTKk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_FUNDS: Fund[] = [
  { id: 'anak', name: 'Kas Anak', color: 'sky', isMain: true },
  { id: 'perpisahan', name: 'Kas Perpisahan', color: 'purple', isMain: false }
];

const DEFAULT_CLASS: SchoolClass = {
  id: 'b2',
  name: 'B2',
  funds: DEFAULT_FUNDS,
  splitRule: { enabled: true, category: Category.DUES, ratio: 0.5, targetFundIds: ['anak', 'perpisahan'] }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  
  // State utama diinisialisasi dari LocalStorage jika ada (Fallback)
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem('kas_classes');
    return saved ? JSON.parse(saved) : [DEFAULT_CLASS];
  });
  const [selectedClassId, setSelectedClassId] = useState('b2');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kas_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [initialBalances, setInitialBalances] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('kas_balances');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const selectedClass = useMemo(() => 
    classes.find(c => c.id === selectedClassId) || classes[0], 
  [classes, selectedClassId]);

  // Simpan ke LocalStorage setiap kali ada perubahan data lokal
  useEffect(() => {
    localStorage.setItem('kas_classes', JSON.stringify(classes));
    localStorage.setItem('kas_transactions', JSON.stringify(transactions));
    localStorage.setItem('kas_balances', JSON.stringify(initialBalances));
  }, [classes, transactions, initialBalances]);

  const fetchData = async () => {
    setIsSyncing(true);
    setCloudError(null);
    try {
      // 1. Ambil Konfigurasi Kelas
      const { data: classData, error: cErr } = await supabase.from('settings').select('value').eq('key', 'school_classes').maybeSingle();
      if (cErr) throw cErr;
      if (classData?.value) setClasses(classData.value);

      // 2. Ambil Transaksi
      const { data: txData, error: tErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('date', { ascending: false });
      
      if (tErr) throw tErr;
      if (txData) {
        setTransactions(txData.map(d => ({
          id: d.id, classId: d.class_id, date: d.date, description: d.description,
          amount: Number(d.amount), type: d.type as TransactionType,
          fundId: d.fund_id, category: d.category as Category, recordedBy: d.recorded_by
        })));
      }

      // 3. Ambil Saldo Awal
      const { data: balData, error: bErr } = await supabase.from('settings').select('value').eq('key', `balances_${selectedClassId}`).maybeSingle();
      if (bErr) throw bErr;
      if (balData?.value) setInitialBalances(balData.value);

    } catch (err: any) { 
      console.error("Supabase Error:", err);
      setCloudError("Gagal sinkron dengan cloud. Menggunakan data lokal.");
    } finally { 
      setIsSyncing(false);
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [selectedClassId]);

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id' | 'classId'>) => {
    const baseId = Math.random().toString(36).substr(2, 9);
    const payloads: any[] = [];
    const localNewTxs: Transaction[] = [];

    // Logika Split atau Biasa
    if (selectedClass.splitRule.enabled && newTx.category === selectedClass.splitRule.category && newTx.type === TransactionType.INCOME) {
      const amountPerFund = newTx.amount * selectedClass.splitRule.ratio;
      selectedClass.splitRule.targetFundIds.forEach((fId, idx) => {
        const id = `${baseId}-${idx}`;
        const item = {
          id, class_id: selectedClassId, date: newTx.date, 
          description: newTx.description, amount: amountPerFund, type: newTx.type,
          fund_id: fId, category: newTx.category, recorded_by: 'Sistem Split'
        };
        payloads.push(item);
        localNewTxs.push({ ...newTx, id, classId: selectedClassId, amount: amountPerFund, fundId: fId, recordedBy: 'Sistem Split' });
      });
    } else {
      payloads.push({
        id: baseId, class_id: selectedClassId, date: newTx.date, 
        description: newTx.description, amount: newTx.amount, type: newTx.type,
        fund_id: newTx.fundId, category: newTx.category, recorded_by: 'Bendahara'
      });
      localNewTxs.push({ ...newTx, id: baseId, classId: selectedClassId });
    }

    // Update Lokal Dulu Agar Responsif
    setTransactions(prev => [...localNewTxs, ...prev]);

    // Kirim ke Cloud di Background
    try {
      await supabase.from('transactions').insert(payloads);
    } catch (err) {
      setCloudError("Transaksi disimpan lokal, gagal sinkron ke cloud.");
    }
  };

  const stats = useMemo((): SummaryStats => {
    const fundBalances: Record<string, number> = {};
    selectedClass.funds.forEach(f => {
      const base = initialBalances[f.id] || 0;
      const txSum = transactions.filter(t => t.fundId === f.id).reduce((sum, t) => 
        t.type === TransactionType.INCOME ? sum + t.amount : sum - t.amount, 0);
      fundBalances[f.id] = base + txSum;
    });

    return {
      totalIncome: transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0),
      totalExpense: transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0),
      fundBalances,
      totalBalance: Object.values(fundBalances).reduce((a, b) => a + b, 0)
    };
  }, [transactions, initialBalances, selectedClass]);

  if (isLoading && transactions.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-sky-50">
        <div className="text-center">
          <Sun className="text-yellow-400 mx-auto mb-4 animate-spin duration-[3000ms]" size={60} />
          <p className="font-black text-sky-500 uppercase tracking-widest text-xs">Membuka Sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kids-pattern flex overflow-x-hidden font-['Inter']">
      <div className="sun-bg"></div>
      <div className="cloud top-[10%] left-[-100px] w-48 h-12" style={{animationDelay: '0s'}}></div>
      <div className="cloud top-[40%] left-[-150px] w-64 h-16" style={{animationDelay: '15s'}}></div>

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          if (tab === 'admin' && !isAdminAuthenticated) { setIsAuthModalOpen(true); return; }
          setActiveTab(tab);
        }} 
        classes={classes} 
        selectedClassId={selectedClassId} 
        onClassChange={setSelectedClassId} 
      />
      
      <main className="flex-1 md:ml-64 min-w-0 relative z-10">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-white/40 px-8 py-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Kelas {selectedClass.name}
              <Cloud className="text-sky-300 ml-1" size={24} />
            </h2>
          </div>
          <div className="flex items-center gap-3">
            {cloudError && (
               <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 animate-pulse">
                  <WifiOff size={14} />
                  <span className="text-[9px] font-black uppercase tracking-widest">Mode Lokal</span>
               </div>
            )}
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
               <Database size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">{transactions.length} Data</span>
            </div>
            <button onClick={fetchData} className={`p-3 text-slate-400 hover:text-sky-500 hover:bg-white rounded-2xl transition-all shadow-sm ${isSyncing ? 'animate-spin' : ''}`}>
              <RefreshCw size={20} />
            </button>
            <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-200 text-[10px] uppercase tracking-widest transition-all active:scale-95">
              <Plus size={18} /> Catat Kas
            </button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
          {cloudError && activeTab === 'dashboard' && (
            <div className="bg-white/60 backdrop-blur-md border-2 border-amber-100 p-5 rounded-[2.5rem] flex items-center justify-between gap-4 shadow-xl shadow-amber-50/50 group hover:border-amber-300 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><AlertCircle size={20} /></div>
                <div>
                  <p className="font-black text-amber-900 text-[10px] uppercase tracking-widest">Koneksi Database Terputus</p>
                  <p className="text-xs text-amber-700 font-medium">Aplikasi berjalan dalam mode offline. Data Anda aman tersimpan di perangkat ini.</p>
                </div>
              </div>
              <button onClick={fetchData} className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-700">Hubungkan Lagi</button>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              <StatsCards stats={stats} selectedClass={selectedClass} initialBalances={initialBalances} />
              <TransactionTable 
                transactions={transactions.slice(0, 10)} 
                funds={selectedClass.funds} 
                onDelete={(id) => {
                  setTransactions(prev => prev.filter(t => t.id !== id));
                  supabase.from('transactions').delete().eq('id', id);
                }} 
              />
            </>
          )}
          {activeTab === 'transactions' && (
            <TransactionTable 
              transactions={transactions} 
              funds={selectedClass.funds} 
              onDelete={(id) => {
                setTransactions(prev => prev.filter(t => t.id !== id));
                supabase.from('transactions').delete().eq('id', id);
              }} 
            />
          )}
          {activeTab === 'analytics' && <FinancialAnalytics transactions={transactions} />}
          {activeTab === 'ai-assistant' && <AIAssistant transactions={transactions} />}
          {activeTab === 'admin' && (
            <AdminPanel 
              classes={classes} 
              onUpdateClasses={(newClasses) => {
                setClasses(newClasses);
                supabase.from('settings').upsert({key: 'school_classes', value: newClasses});
              }}
              initialBalances={initialBalances}
              onUpdateBalances={(newBals) => {
                setInitialBalances(newBals);
                supabase.from('settings').upsert({key: `balances_${selectedClassId}`, value: newBals});
              }}
              selectedClass={selectedClass}
              onRepair={fetchData}
            />
          )}
        </div>
      </main>

      {/* Admin Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 text-center space-y-6 shadow-2xl border-4 border-sky-100">
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto text-sky-600">
              <Lock size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Pintu Terkunci</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Masukkan Password Admin</p>
            <input 
              type="password" 
              placeholder="••••••••" 
              autoFocus
              className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-sky-400 outline-none font-black text-center" 
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.currentTarget.value === 'admin123') {
                    setIsAdminAuthenticated(true);
                    setIsAuthModalOpen(false);
                    setActiveTab('admin');
                  } else {
                    alert("Password salah, sayang!");
                  }
                }
              }}
            />
            <button onClick={() => setIsAuthModalOpen(false)} className="text-xs font-black text-slate-400 uppercase tracking-widest">Batal</button>
          </div>
        </div>
      )}

      {isFormOpen && <TransactionForm funds={selectedClass.funds} splitRule={selectedClass.splitRule} onAdd={handleAddTransaction} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default App;