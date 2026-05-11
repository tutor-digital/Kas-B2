
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import TransactionTable from './components/TransactionTable';
import TransactionForm from './components/TransactionForm';
import FinancialAnalytics from './components/FinancialAnalytics';
import AIAssistant from './components/AIAssistant';
import AdminPanel from './components/AdminPanel';
import CashReport from './components/CashReport';
import PaymentChecklist from './components/PaymentChecklist';
import { Transaction, TransactionType, SummaryStats, SchoolClass, Category, Fund } from './types';
import { Lock, FileText, BarChart3, Settings, ReceiptText, ChevronRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hmkgweuqhoppmxpovwkb.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhta2d3ZXVxaG9wcG14cG92d2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTA3NTMsImV4cCI6MjA4MzI2Njc1M30.Ypqk5TYHqK54u4UESs8KIU4eb2mMRKoWeDWdVXRBTKk';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper untuk generate UUID jika database tidak otomatis membuatnya
const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const DEFAULT_FUNDS: Fund[] = [
  { id: 'anak', name: 'Kas Anak', color: 'sky', isMain: true },
  { id: 'perpisahan', name: 'Kas Perpisahan', color: 'purple', isMain: false }
];

const DEFAULT_CLASS: SchoolClass = {
  id: 'b2',
  name: 'B2',
  isActive: true,
  students: [],
  funds: DEFAULT_FUNDS,
  splitRule: { enabled: true, category: Category.DUES, ratio: 0.5, targetFundIds: ['anak', 'perpisahan'] }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classes, setClasses] = useState<SchoolClass[]>([DEFAULT_CLASS]);
  const [selectedClassId, setSelectedClassId] = useState('b2');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [initialBalances, setInitialBalances] = useState<Record<string, number>>({});
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => localStorage.getItem('kas_admin_session') === 'active');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formType, setFormType] = useState<TransactionType>(TransactionType.INCOME);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const selectedClass = useMemo(() => classes.find(c => c.id === selectedClassId) || classes[0], [classes, selectedClassId]);

  const fetchData = async () => {
    try {
      const { data: txData } = await supabase.from('transactions').select('*').order('date', { ascending: false });
      const { data: settingsData } = await supabase.from('settings').select('*');
      if (settingsData) {
        const savedClasses = settingsData.find(s => s.key === 'school_classes');
        if (savedClasses) setClasses(savedClasses.value);
        const savedBalances = settingsData.find(s => s.key === `balances_${selectedClassId}`);
        if (savedBalances) setInitialBalances(savedBalances.value);
      }
      if (txData) {
        setTransactions(txData.map(d => ({
          id: d.id, classId: d.class_id || 'b2', date: d.date, description: d.description,
          amount: Number(d.amount), type: d.type as TransactionType, fundId: (d.fund_id || 'anak').toLowerCase(),
          category: d.category as Category, recordedBy: d.recorded_by || 'Bendahara',
          studentName: d.student_name, attachmentUrl: d.attachment_url, paymentDate: d.payment_date
        })));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => { fetchData(); }, [selectedClassId]);

  const stats = useMemo((): SummaryStats => {
    const fundBalances: Record<string, number> = {};
    selectedClass.funds.forEach(f => {
      const base = initialBalances[f.id] || 0;
      const txSum = transactions.reduce((sum, t) => {
        const isSplitCategory = selectedClass.splitRule.enabled && t.category === selectedClass.splitRule.category;
        
        if (isSplitCategory) {
          if (selectedClass.splitRule.targetFundIds.includes(f.id)) {
            const splitAmount = t.amount * (selectedClass.splitRule.ratio || 0.5);
            return t.type === TransactionType.INCOME ? sum + splitAmount : sum - splitAmount;
          }
          return sum;
        }

        if (t.fundId === f.id) return t.type === TransactionType.INCOME ? sum + t.amount : sum - t.amount;
        
        // Legacy/Explicit support for 'gabungan' fundId
        if (t.fundId === 'gabungan' && selectedClass.splitRule.targetFundIds.includes(f.id)) {
          const splitAmount = t.amount * (selectedClass.splitRule.ratio || 0.5);
          return t.type === TransactionType.INCOME ? sum + splitAmount : sum - splitAmount;
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
    } else alert("Password salah!");
  };

  const handleOpenForm = (type: TransactionType = TransactionType.INCOME) => {
    setFormType(type);
    setIsFormOpen(true);
  };
  
  const handleAddTransaction = async (tx: Omit<Transaction, 'id' | 'classId'>) => {
    const dbPayload = {
      id: generateUUID(), // Generate UUID di client
      class_id: selectedClassId,
      date: tx.date,
      description: tx.description,
      amount: tx.amount,
      type: tx.type,
      fund_id: tx.fundId,
      category: tx.category,
      recorded_by: tx.recordedBy,
      student_name: tx.studentName,
      attachment_url: tx.attachmentUrl,
      payment_date: tx.paymentDate
    };
    
    const { error } = await supabase.from('transactions').insert([dbPayload]);
    if (error) {
       console.error("Error saving:", error);
       alert("Gagal menyimpan data: " + error.message);
    } else {
       fetchData();
       setIsFormOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="animate-in fade-in duration-500">
             {/* Header Section for Mobile */}
             <Header className="mb-6" />
             
             {/* Stats & Actions */}
             <StatsCards 
                stats={stats} 
                selectedClass={selectedClass} 
                onOpenForm={handleOpenForm}
                onNavigate={setActiveTab}
             />

             {/* Menu Buttons Grid */}
             <div className="mt-8">
               <h3 className="text-white font-bold text-lg mb-4 px-2">Menu Utama</h3>
               <div className="grid grid-cols-1 gap-4">
                 
                 <button onClick={() => setActiveTab('transactions')} className="glass-panel p-4 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                          <ReceiptText size={24} />
                       </div>
                       <div className="text-left">
                          <h4 className="text-white font-bold">Riwayat Transaksi</h4>
                          <p className="text-slate-400 text-xs">Lihat semua uang masuk & keluar</p>
                       </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                       <ChevronRight size={20} />
                    </div>
                 </button>

                 <button onClick={() => setActiveTab('report')} className="glass-panel p-4 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center border border-violet-500/20">
                          <FileText size={24} />
                       </div>
                       <div className="text-left">
                          <h4 className="text-white font-bold">Laporan Kas</h4>
                          <p className="text-slate-400 text-xs">Ringkasan bulanan & per kantong</p>
                       </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                       <ChevronRight size={20} />
                    </div>
                 </button>

                 <button onClick={() => setActiveTab('analytics')} className="glass-panel p-4 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                          <BarChart3 size={24} />
                       </div>
                       <div className="text-left">
                          <h4 className="text-white font-bold">Analisis Grafik</h4>
                          <p className="text-slate-400 text-xs">Visualisasi data keuangan kelas</p>
                       </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                       <ChevronRight size={20} />
                    </div>
                 </button>

                 <button onClick={() => setActiveTab('admin')} className="glass-panel p-4 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-slate-500/20 text-slate-400 flex items-center justify-center border border-slate-500/20">
                          <Settings size={24} />
                       </div>
                       <div className="text-left">
                          <h4 className="text-white font-bold">Pengaturan Admin</h4>
                          <p className="text-slate-400 text-xs">Kelola siswa & reset data</p>
                       </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-white/10 group-hover:text-white transition-all">
                       <ChevronRight size={20} />
                    </div>
                 </button>

               </div>
             </div>

             <div className="mt-8">
               <AIAssistant transactions={transactions} />
             </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="pt-2 animate-in slide-in-from-right duration-300">
             <h2 className="text-xl font-bold mb-4">Semua Transaksi</h2>
             <TransactionTable transactions={transactions} funds={selectedClass.funds} splitRule={selectedClass.splitRule} isAdmin={isAdminAuthenticated} enableFilter onEdit={() => {}} onDelete={() => {}} />
          </div>
        );
      case 'report':
        return <div className="light-mode-content animate-in slide-in-from-right duration-300"><CashReport stats={stats} selectedClass={selectedClass} initialBalances={initialBalances} transactions={transactions} /></div>;
      case 'checklist':
        return <div className="light-mode-content animate-in slide-in-from-right duration-300"><PaymentChecklist students={selectedClass.students} transactions={transactions} /></div>;
      case 'analytics':
        return <div className="light-mode-content animate-in slide-in-from-right duration-300"><FinancialAnalytics transactions={transactions} /></div>;
      case 'ai-assistant':
        return <AIAssistant transactions={transactions} />;
      case 'admin':
        return (
            <div className="light-mode-content animate-in slide-in-from-right duration-300">
                {!isAdminAuthenticated ? (
                    <div className="text-center py-20">
                        <Lock className="mx-auto text-slate-400 mb-4" size={48} />
                        <h3 className="text-slate-600 font-bold">Area Terbatas</h3>
                        <button onClick={() => setIsAuthModalOpen(true)} className="mt-4 px-6 py-2 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors">Masuk Admin</button>
                    </div>
                ) : (
                    <AdminPanel classes={classes} selectedClass={selectedClass} onUpdateClasses={setClasses} initialBalances={initialBalances} onUpdateBalances={setInitialBalances} onRepair={fetchData} dbStatus={{connected: true, error: null}} />
                )}
            </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#110e1b] text-white font-sans overflow-x-hidden pb-24 md:pb-0">
      
      {/* Desktop Sidebar (Hidden on Mobile) */}
      <div className="hidden md:block">
        <Sidebar 
            isOpen={true} activeTab={activeTab} 
            onTabChange={setActiveTab} 
            classes={classes} selectedClassId={selectedClassId} 
            onClassChange={setSelectedClassId} isAdmin={isAdminAuthenticated}
            onLoginRequest={() => setIsAuthModalOpen(true)}
            onLogout={() => { setIsAdminAuthenticated(false); localStorage.removeItem('kas_admin_session'); setActiveTab('dashboard'); }}
        />
      </div>

      {/* Main Content */}
      <main className="md:ml-72 min-h-screen relative p-6 max-w-lg mx-auto md:max-w-4xl">
        {renderContent()}
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} onOpenForm={() => handleOpenForm(TransactionType.INCOME)} />

      {/* Admin Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-[#1e1b2e] border border-white/10 w-full max-w-xs p-8 text-center space-y-6 rounded-[2rem] shadow-2xl">
            <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500 mx-auto border border-violet-500/10">
               <Lock size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Akses Admin</h3>
            </div>
            <input 
              type="password" placeholder="••••" autoFocus 
              className="w-full p-4 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:border-violet-500 text-center text-2xl tracking-[0.5em]"
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e.currentTarget.value); }}
            />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsAuthModalOpen(false)} className="py-3 rounded-xl text-[10px] font-bold text-slate-400 hover:bg-white/5">BATAL</button>
              <button onClick={(e) => handleLogin((e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement).value)} className="py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-[10px]">MASUK</button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <TransactionForm 
          funds={selectedClass.funds} students={selectedClass.students} splitRule={selectedClass.splitRule} 
          defaultType={formType}
          initialData={undefined}
          onAdd={handleAddTransaction}
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
