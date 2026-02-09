
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
import { Lock } from 'lucide-react';
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
    } else alert("Password salah!");
  };

  const handleOpenForm = (type: TransactionType = TransactionType.INCOME) => {
    setFormType(type);
    setIsFormOpen(true);
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

             {/* Recent Transactions */}
             <TransactionTable 
                transactions={transactions.slice(0, 5)} 
                funds={selectedClass.funds} 
                isAdmin={isAdminAuthenticated} 
                onEdit={() => {}} onDelete={() => {}}
             />
          </div>
        );
      case 'transactions':
        return (
          <div className="pt-2 animate-in slide-in-from-right duration-300">
             <h2 className="text-xl font-bold mb-4">Semua Transaksi</h2>
             <TransactionTable transactions={transactions} funds={selectedClass.funds} isAdmin={isAdminAuthenticated} enableFilter onEdit={() => {}} onDelete={() => {}} />
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
                        <button onClick={() => setIsAuthModalOpen(true)} className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-xl font-bold">Masuk Admin</button>
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
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans overflow-x-hidden pb-24 md:pb-0">
      
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
          <div className="bg-[#151a23] border border-white/10 w-full max-w-xs p-8 text-center space-y-6 rounded-[2rem] shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/10">
               <Lock size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Akses Admin</h3>
            </div>
            <input 
              type="password" placeholder="••••" autoFocus 
              className="w-full p-4 rounded-xl bg-black/20 border border-white/10 text-white outline-none focus:border-emerald-500 text-center text-2xl tracking-[0.5em]"
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e.currentTarget.value); }}
            />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsAuthModalOpen(false)} className="py-3 rounded-xl text-[10px] font-bold text-slate-400 hover:bg-white/5">BATAL</button>
              <button onClick={(e) => handleLogin((e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement).value)} className="py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[10px]">MASUK</button>
            </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <TransactionForm 
          funds={selectedClass.funds} students={selectedClass.students} splitRule={selectedClass.splitRule} 
          initialData={formType === TransactionType.INCOME ? undefined : { type: TransactionType.EXPENSE } as any}
          onAdd={(tx) => { supabase.from('transactions').insert([{ ...tx, class_id: selectedClassId }]).then(() => { fetchData(); setIsFormOpen(false); }); }} 
          onClose={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
};

export default App;
