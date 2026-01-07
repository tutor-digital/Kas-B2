
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import StatsCards from './components/StatsCards';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import FinancialAnalytics from './components/FinancialAnalytics';
import AIAssistant from './components/AIAssistant';
import { Transaction, TransactionType, SummaryStats, FundCategory, Category } from './types';
import { Plus, X, Wallet, Check, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// KONFIGURASI SUPABASE
const SUPABASE_URL = 'https://hmkgweuqhoppmxpovwkb.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta2d3ZXVxaG9wcG14cG92d2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTA3NTMsImV4cCI6MjA4MzI2Njc1M30.Ypqk5TYHqK54u4UESs8KIU4eb2mMRKoWeDWdVXRBTKk';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalance, setInitialBalance] = useState({ anak: 0, perpisahan: 0 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const mapFromSupabase = (data: any): Transaction => ({
    id: data.id,
    date: data.date,
    description: data.description,
    amount: Number(data.amount),
    type: data.type as TransactionType,
    fundCategory: data.fund_category as FundCategory,
    category: data.category as Category,
    recordedBy: data.recorded_by
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (txError) throw txError;
      setTransactions((txData || []).map(mapFromSupabase));

      const { data: setItem, error: setErr } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'initial_balance')
        .maybeSingle();
      
      if (setItem) setInitialBalance(setItem.value);
    } catch (err: any) {
      console.error("Database Error:", err);
      setError("Gagal sinkronisasi dengan Cloud. Periksa koneksi internet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveInitialBalance = async () => {
    setIsSaving(true);
    try {
      const { error: upsertError } = await supabase
        .from('settings')
        .upsert({ key: 'initial_balance', value: initialBalance });
      
      if (upsertError) throw upsertError;
      setIsSettingsOpen(false);
    } catch (err) {
      alert("Gagal menyimpan saldo ke cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const now = new Date().toISOString().split('T')[0];
    const baseId = Math.random().toString(36).substr(2, 9);
    
    try {
      // Tentukan FundCategory: Jika iuran bulanan, set ke GABUNGAN
      const finalFundCategory = (newTx.category === Category.DUES && newTx.type === TransactionType.INCOME)
        ? FundCategory.GABUNGAN
        : newTx.fundCategory;

      const payload = { 
        id: baseId, 
        date: newTx.date || now, 
        recorded_by: 'Bendahara', 
        fund_category: finalFundCategory,
        amount: newTx.amount,
        description: newTx.description,
        type: newTx.type,
        category: newTx.category
      };

      const { error: insError } = await supabase.from('transactions').insert([payload]);
      if (insError) throw insError;
      
      fetchData();
    } catch (err) {
      alert("Gagal mencatat transaksi.");
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Hapus data transaksi ini secara permanen dari cloud?')) return;
    try {
      const { error: delError } = await supabase.from('transactions').delete().eq('id', id);
      if (delError) throw delError;
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (err) {
      alert("Gagal menghapus data.");
    }
  };

  const stats = useMemo((): SummaryStats => {
    const calcFundBalance = (targetFund: FundCategory) => {
      // 1. Transaksi Spesifik Kantong Tersebut (Bukan Gabungan)
      const specificTx = transactions.filter(t => t.fundCategory === targetFund);
      const specificSum = specificTx.reduce((sum, t) => {
        return t.type === TransactionType.INCOME ? sum + t.amount : sum - t.amount;
      }, 0);

      // 2. Transaksi Gabungan (Dihitung 50%)
      const combinedTx = transactions.filter(t => t.fundCategory === FundCategory.GABUNGAN);
      const combinedSum = combinedTx.reduce((sum, t) => {
        const half = t.amount / 2;
        return t.type === TransactionType.INCOME ? sum + half : sum - half;
      }, 0);

      const base = targetFund === FundCategory.ANAK ? initialBalance.anak : initialBalance.perpisahan;
      return base + specificSum + combinedSum;
    };

    const income = transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);

    const balanceAnak = calcFundBalance(FundCategory.ANAK);
    const balancePerpisahan = calcFundBalance(FundCategory.PERPISAHAN);

    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: balanceAnak + balancePerpisahan,
      balanceAnak,
      balancePerpisahan
    };
  }, [transactions, initialBalance]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} />
          <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">Menyinkronkan Database B2...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 md:ml-64 min-w-0">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            {activeTab === 'dashboard' ? 'Overview Kas' : activeTab === 'transactions' ? 'Arsip Kas' : 'Analisis'}
          </h2>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all"><RefreshCw size={18} /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all font-bold text-xs uppercase tracking-widest"><Wallet size={16} /> Atur Saldo</button>
            <button onClick={() => setIsFormOpen(true)} className="bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-black flex items-center gap-2 shadow-lg text-xs uppercase tracking-widest transition-all active:scale-95"><Plus size={16} /> Catat Kas</button>
          </div>
        </header>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          {error && (
            <div className="bg-rose-50 border border-rose-100 p-5 rounded-3xl flex items-start gap-3">
              <AlertCircle className="text-rose-500 mt-1" size={20} />
              <div>
                <p className="font-black text-rose-800 text-xs uppercase tracking-widest">Koneksi Bermasalah</p>
                <p className="text-xs text-rose-600 leading-relaxed mt-1 font-medium">{error}</p>
              </div>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <>
              <StatsCards stats={stats} initialBalances={initialBalance} />
              <TransactionTable transactions={transactions.slice(0, 10)} onDelete={handleDeleteTransaction} />
            </>
          )}
          {activeTab === 'transactions' && <TransactionTable transactions={transactions} onDelete={handleDeleteTransaction} />}
          {activeTab === 'analytics' && <FinancialAnalytics transactions={transactions} />}
          {activeTab === 'ai-assistant' && <AIAssistant transactions={transactions} />}
        </div>
      </main>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 bg-slate-50 border-b flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800">Manajemen Saldo</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Database Online Supabase</p>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Modal Awal Kas Anak</label>
                  <input type="number" value={initialBalance.anak} onChange={(e) => setInitialBalance({...initialBalance, anak: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Modal Awal Kas Perpisahan</label>
                  <input type="number" value={initialBalance.perpisahan} onChange={(e) => setInitialBalance({...initialBalance, perpisahan: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-sm" />
                </div>
              </div>
              <button onClick={handleSaveInitialBalance} disabled={isSaving} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg">
                {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Update Saldo di Cloud
              </button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && <TransactionForm onAdd={handleAddTransaction} onClose={() => setIsFormOpen(false)} />}
    </div>
  );
};

export default App;
