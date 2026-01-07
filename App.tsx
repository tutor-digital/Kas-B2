
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import FinancialAnalytics from './components/FinancialAnalytics';
import AIAssistant from './components/AIAssistant';
import AdminPanel from './components/AdminPanel';
import { Transaction, TransactionType, SummaryStats, SchoolClass, Category, Fund } from './types';
import { Plus, Wallet, Check, Loader2, AlertCircle, RefreshCw, Sun, Cloud, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hmkgweuqhoppmxpovwkb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta2d3ZXVxaG9wcG14cG92d2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTA3NTMsImV4cCI6MjA4MzI2Njc1M30.Ypqk5TYHqK54u4UESs8KIU4eb2mMRKoWeDWdVXRBTKk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DEFAULT_FUNDS: Fund[] = [
  { id: 'anak', name: 'Kas Anak', color: 'indigo', isMain: true },
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
  const [error, setError] = useState<string | null>(null);
  
  const [classes, setClasses] = useState<SchoolClass[]>([DEFAULT_CLASS]);
  const [selectedClassId, setSelectedClassId] = useState('b2');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalances, setInitialBalances] = useState<Record<string, number>>({});
  
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const selectedClass = useMemo(() => 
    classes.find(c => c.id === selectedClassId) || classes[0], 
  [classes, selectedClassId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Classes Configuration
      const { data: classData } = await supabase.from('settings').select('value').eq('key', 'school_classes').maybeSingle();
      if (classData) setClasses(classData.value);

      // Fetch Transactions for current class
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('class_id', selectedClassId)
        .order('date', { ascending: false });
      
      setTransactions((txData || []).map(d => ({
        id: d.id, classId: d.class_id, date: d.date, description: d.description,
        amount: Number(d.amount), type: d.type as TransactionType,
        fundId: d.fund_id, category: d.category as Category, recordedBy: d.recorded_by
      })));

      // Fetch Balances
      const { data: balData } = await supabase.from('settings').select('value').eq('key', `balances_${selectedClassId}`).maybeSingle();
      if (balData) setInitialBalances(balData.value);
    } catch (err) { 
      setError("Gagal sinkronisasi cloud."); 
    } finally { 
      setIsLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [selectedClassId]);

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id' | 'classId'>) => {
    try {
      const payloads = [];
      const baseId = Math.random().toString(36).substr(2, 9);
      
      // Split Logic
      if (selectedClass.splitRule.enabled && newTx.category === selectedClass.splitRule.category && newTx.type === TransactionType.INCOME) {
        const amountPerFund = newTx.amount * selectedClass.splitRule.ratio;
        selectedClass.splitRule.targetFundIds.forEach((fId, idx) => {
          payloads.push({
            id: `${baseId}-${idx}`, class_id: selectedClassId, date: newTx.date, 
            description: newTx.description, amount: amountPerFund, type: newTx.type,
            fund_id: fId, category: newTx.category, recorded_by: 'Sistem Split'
          });
        });
      } else {
        payloads.push({
          id: baseId, class_id: selectedClassId, date: newTx.date, 
          description: newTx.description, amount: newTx.amount, type: newTx.type,
          fund_id: newTx.fundId, category: newTx.category, recorded_by: 'Bendahara'
        });
      }

      await supabase.from('transactions').insert(payloads);
      fetchData();
    } catch (err) { alert("Gagal catat transaksi."); }
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

  const handleTabChange = (tab: string) => {
    if (tab === 'admin' && !isAdminAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setActiveTab(tab);
  };

  const handleAdminLogin = (pass: string) => {
    if (pass === 'admin123') { // Simple pass for demo
      setIsAdminAuthenticated(true);
      setIsAuthModalOpen(false);
      setActiveTab('admin');
    } else {
      alert("Password salah!");
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-bounce">
          <Sun className="text-amber-400 mx-auto mb-4" size={60} />
          <p className="font-black text-amber-500 uppercase tracking-widest text-xs">Menyiapkan Sekolah...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-kids-pattern flex overflow-x-hidden">
      <div className="blob bg-amber-200 -top-20 -left-20"></div>
      <div className="blob bg-sky-200 bottom-0 -right-20" style={{animationDelay: '-5s'}}></div>

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={handleTabChange} 
        classes={classes} 
        selectedClassId={selectedClassId} 
        onClassChange={setSelectedClassId} 
      />
      
      <main className="flex-1 md:ml-64 min-w-0 relative z-10">
        <header className="sticky top-0 z-40 bg-white/60 backdrop-blur-xl border-b border-white/40 px-8 py-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              Kelas {selectedClass.name} - {activeTab === 'dashboard' ? 'Overview' : activeTab === 'admin' ? 'Admin' : activeTab}
              <Cloud className="text-sky-300 ml-1" size={24} />
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-3 text-slate-400 hover:text-sky-500 hover:bg-white rounded-2xl transition-all shadow-sm"><RefreshCw size={20} /></button>
            <button onClick={() => setIsFormOpen(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-7 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-indigo-200 text-[10px] uppercase tracking-widest transition-all active:scale-95"><Plus size={18} /> Catat Kas</button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
          {activeTab === 'dashboard' && (
            <>
              <StatsCards stats={stats} selectedClass={selectedClass} initialBalances={initialBalances} />
              <TransactionTable transactions={transactions.slice(0, 10)} funds={selectedClass.funds} onDelete={(id) => supabase.from('transactions').delete().eq('id', id).then(() => fetchData())} />
            </>
          )}
          {activeTab === 'transactions' && <TransactionTable transactions={transactions} funds={selectedClass.funds} onDelete={(id) => supabase.from('transactions').delete().eq('id', id).then(() => fetchData())} />}
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
            />
          )}
        </div>
      </main>

      {/* Admin Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-md p-10 text-center space-y-6 shadow-2xl border-4 border-indigo-100">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600">
              <Lock size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Akses Terbatas</h3>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Masukkan Password Admin</p>
            <input 
              type="password" 
              placeholder="••••••••" 
              className="w-full p-5 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-400 outline-none font-black text-center" 
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin(e.currentTarget.value)}
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
