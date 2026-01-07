
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import FinancialAnalytics from './components/FinancialAnalytics';
import AIAssistant from './components/AIAssistant';
import AdminPanel from './components/AdminPanel';
import { Transaction, TransactionType, SummaryStats, SchoolClass, Category, Fund } from './types';
import { Plus, RefreshCw, Cloud, Lock, WifiOff, Wifi, ShieldAlert, Eye, LogIn } from 'lucide-react';
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; error: string | null }>({ connected: true, error: null });
  
  const [classes, setClasses] = useState<SchoolClass[]>(() => {
    const saved = localStorage.getItem('kas_classes_v10');
    return saved ? JSON.parse(saved) : [DEFAULT_CLASS];
  });
  const [selectedClassId, setSelectedClassId] = useState('b2');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kas_transactions_v10');
    return saved ? JSON.parse(saved) : [];
  });
  const [initialBalances, setInitialBalances] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('kas_balances_v10');
    return saved ? JSON.parse(saved) : {};
  });
  
  // ROLE STATE
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => localStorage.getItem('kas_admin_session') === 'active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId) || classes[0], [classes, selectedClassId]);

  useEffect(() => {
    localStorage.setItem('kas_classes_v10', JSON.stringify(classes));
    localStorage.setItem('kas_transactions_v10', JSON.stringify(transactions));
    localStorage.setItem('kas_balances_v10', JSON.stringify(initialBalances));
  }, [classes, transactions, initialBalances]);

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const { data: txData, error: tErr } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      const { data: settingsData, error: sErr } = await supabase.from('settings').select('*');

      if (settingsData) {
        const savedClasses = settingsData.find(s => s.key === 'school_classes');
        if (savedClasses) setClasses(savedClasses.value);
        const savedBalances = settingsData.find(s => s.key === `balances_${selectedClassId}`);
        if (savedBalances) setInitialBalances(savedBalances.value);
      }
      
      if (txData) {
        setTransactions(txData.map(d => ({
          id: d.id, 
          classId: d.class_id || 'b2', 
          date: d.date, 
          description: d.description,
          amount: Number(d.amount), 
          type: d.type as TransactionType,
          fundId: (d.fund_id || 'anak').toLowerCase(),
          category: d.category as Category, 
          recordedBy: d.recorded_by || 'Bendahara'
        })));
        setDbStatus({ connected: true, error: null });
      }
    } catch (err: any) { 
      setDbStatus({ connected: false, error: err.message });
    } finally { 
      setIsSyncing(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedClassId]);

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id' | 'classId'>) => {
    if (!isAdminAuthenticated) return;
    const txId = Math.random().toString(36).substr(2, 9);
    const isSplit = selectedClass.splitRule.enabled && newTx.category === selectedClass.splitRule.category && newTx.type === TransactionType.INCOME;
    
    const payload = {
      id: txId, class_id: selectedClassId, date: newTx.date, description: newTx.description,
      amount: newTx.amount, type: newTx.type, fund_id: isSplit ? 'gabungan' : newTx.fundId,
      fund_category: isSplit ? 'Gabungan' : newTx.fundId.charAt(0).toUpperCase() + newTx.fundId.slice(1),
      category: newTx.category, recorded_by: 'Bendahara'
    };

    setTransactions(prev => [{ ...newTx, id: txId, classId: selectedClassId, fundId: isSplit ? 'gabungan' : newTx.fundId }, ...prev]);
    const { error } = await supabase.from('transactions').insert([payload]);
    if (error) { alert("Gagal Simpan: " + error.message); fetchData(); }
  };

  const stats = useMemo((): SummaryStats => {
    const fundBalances: Record<string, number> = {};
    selectedClass.funds.forEach(f => {
      const base = initialBalances[f.id] || 0;
      const txSum = transactions.reduce((sum, t) => {
        if (t.fundId === f.id) return t.type === TransactionType.INCOME ? sum + t.amount : sum - t.amount;
        if (t.fundId === 'gabungan' && selectedClass.splitRule.targetFundIds.includes(f.id)) {
          return t.type === TransactionType.INCOME ? sum + (t.amount * 0.5) : sum - (t.amount * 0.5);
        }
        return sum;
      }, 0);
      fundBalances[f.id] = base + txSum;
    });
    return {
      totalIncome: transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0),
      totalExpense: transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0),
      fundBalances, totalBalance: Object.values(fundBalances).reduce((a, b) => a + b, 0)
    };
  }, [transactions, initialBalances, selectedClass]);

  const handleLogin = (password: string) => {
    if (password === 'admin123') {
      setIsAdminAuthenticated(true);
      localStorage.setItem('kas_admin_session', 'active');
      setIsAuthModalOpen(false);
      if (pendingTab) { setActiveTab(pendingTab); setPendingTab(null); }
    } else {
      alert("Password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-kids-pattern flex overflow-x-hidden">
      <div className="sun-bg"></div>
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(id) => {
          const restricted = ['analytics', 'ai-assistant', 'admin'];
          if (restricted.includes(id) && !isAdminAuthenticated) { setPendingTab(id); setIsAuthModalOpen(true); }
          else setActiveTab(id);
        }} 
        classes={classes} 
        selectedClassId={selectedClassId} 
        onClassChange={setSelectedClassId}
        isAdmin={isAdminAuthenticated}
        onLoginRequest={() => setIsAuthModalOpen(true)}
        onLogout={() => { setIsAdminAuthenticated(false); localStorage.removeItem('kas_admin_session'); setActiveTab('dashboard'); }}
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
            {!isAdminAuthenticated ? (
              <button 
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200 hover:bg-amber-600 transition-all active:scale-95 animate-pulse"
              >
                <Lock size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Login Bendahara</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <ShieldAlert size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Mode Bendahara</span>
              </div>
            )}
            
            <div className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${dbStatus.connected ? 'bg-sky-50 text-sky-600 border-sky-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
               {dbStatus.connected ? <Wifi size={14} /> : <WifiOff size={14} />}
               <span className="text-[10px] font-black uppercase tracking-widest">{dbStatus.connected ? 'Cloud Aktif' : 'Error'}</span>
            </div>
            
            <button onClick={fetchData} className={`p-3 text-slate-400 hover:text-sky-500 hover:bg-white rounded-2xl transition-all ${isSyncing ? 'animate-spin' : ''}`}>
              <RefreshCw size={20} />
            </button>
            
            {isAdminAuthenticated && (
              <button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-200 text-[10px] uppercase tracking-widest transition-all active:scale-95">
                <Plus size={18} /> Catat Kas
              </button>
            )}
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
          {activeTab === 'dashboard' && (
            <>
              <StatsCards stats={stats} selectedClass={selectedClass} initialBalances={initialBalances} />
              <TransactionTable transactions={transactions.slice(0, 10)} funds={selectedClass.funds} isAdmin={isAdminAuthenticated} onDelete={(id) => {
                  if (confirm('Hapus permanen?')) {
                    setTransactions(prev => prev.filter(t => t.id !== id));
                    supabase.from('transactions').delete().eq('id', id).then(() => {});
                  }
              }} />
            </>
          )}
          {activeTab === 'transactions' && (
            <TransactionTable transactions={transactions} funds={selectedClass.funds} isAdmin={isAdminAuthenticated} onDelete={(id) => {
                if (confirm('Hapus?')) {
                  setTransactions(prev => prev.filter(t => t.id !== id));
                  supabase.from('transactions').delete().eq('id', id).then(() => {});
                }
            }} />
          )}
          {activeTab === 'analytics' && <FinancialAnalytics transactions={transactions} />}
          {activeTab === 'ai-assistant' && <AIAssistant transactions={transactions} />}
          {activeTab === 'admin' && (
            <AdminPanel 
              classes={classes} 
              onUpdateClasses={(newClasses) => { setClasses(newClasses); supabase.from('settings').upsert({key: 'school_classes', value: newClasses}).then(() => {}); }}
              initialBalances={initialBalances}
              onUpdateBalances={(newBals) => { setInitialBalances(newBals); supabase.from('settings').upsert({key: `balances_${selectedClassId}`, value: newBals}).then(() => {}); }}
              selectedClass={selectedClass}
              onRepair={fetchData}
              dbStatus={dbStatus}
            />
          )}
        </div>
      </main>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 text-center space-y-6 shadow-2xl border-4 border-sky-100 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto text-sky-600">
              <Lock size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Login Bendahara</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Masukkan password untuk mulai mencatat (Default: admin123)</p>
            <input 
              type="password" placeholder="••••••••" autoFocus 
              className="w-full p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-sky-400 outline-none font-black text-center text-2xl tracking-[0.5em]" 
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e.currentTarget.value); }} 
            />
            <div className="flex flex-col gap-3">
              <button onClick={(e) => handleLogin((e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement).value)} className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl">Masuk</button>
              <button onClick={() => { setIsAuthModalOpen(false); setPendingTab(null); }} className="text-xs font-black text-slate-400 uppercase tracking-widest py-3">Kembali</button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && <TransactionForm funds={selectedClass.funds} splitRule={selectedClass.splitRule} onAdd={handleAddTransaction} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default App;