
import React, { useState } from 'react';
import { Bot, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { getFinancialInsights } from '../services/geminiService';
import { Transaction } from '../types';

interface AIAssistantProps {
  transactions: Transaction[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    if (transactions.length === 0) return;
    setLoading(true);
    const result = await getFinancialInsights(transactions);
    setInsight(result || "Gagal mendapatkan analisis.");
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl">
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
              <Bot size={28} />
            </div>
            <h2 className="text-2xl font-bold">AI Konsultan Kas Kelas</h2>
          </div>
          <p className="text-indigo-100 text-lg mb-6 leading-relaxed">
            Dapatkan wawasan cerdas tentang kesehatan keuangan kelasmu. 
            AI kami akan menganalisis tren pengeluaran dan memberikan rekomendasi penghematan.
          </p>
          
          {loading ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="animate-spin" />
              <span className="font-medium">Menganalisis transaksi Anda...</span>
            </div>
          ) : (
            <button
              onClick={generateReport}
              disabled={transactions.length === 0}
              className={`flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:bg-indigo-50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {insight ? <RefreshCw size={20} /> : <Sparkles size={20} />}
              {insight ? 'Perbarui Analisis' : 'Mulai Analisis Sekarang'}
            </button>
          )}
        </div>
        
        <div className="hidden lg:block w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center animate-pulse">
            <Bot size={80} className="text-white/60" />
        </div>
      </div>

      {insight && !loading && (
        <div className="mt-10 bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="prose prose-invert max-w-none text-indigo-50">
            {insight.split('\n').map((line, i) => (
              <p key={i} className="mb-2 leading-relaxed">{line}</p>
            ))}
          </div>
        </div>
      )}

      {transactions.length === 0 && (
        <p className="mt-4 text-xs text-indigo-200/60 italic">*Tambahkan setidaknya satu transaksi untuk memulai analisis.</p>
      )}
    </div>
  );
};

export default AIAssistant;
