
import React, { useState } from 'react';
import { Sparkles, X, Loader2, ArrowRight } from 'lucide-react';
import { getFinancialInsights } from '../services/geminiService';
import { Transaction } from '../types';

interface AIAssistantProps {
  transactions: Transaction[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const generateReport = async () => {
    if (transactions.length === 0) return;
    setLoading(true);
    const result = await getFinancialInsights(transactions);
    setInsight(result || "Gagal mendapatkan analisis.");
    setLoading(false);
  };

  return (
    <div className="relative glass-card bg-indigo-600/20 border-indigo-500/30 rounded-[2.5rem] p-6 mb-10 overflow-hidden animate-in zoom-in-95 duration-500">
      <button onClick={() => setIsVisible(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
        <X size={18} />
      </button>

      <div className="flex gap-4">
        <div className="shrink-0 w-12 h-12 flex items-center justify-center text-amber-400">
          <Sparkles size={28} className="animate-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-sm mb-1">Cek kesehatan kas dengan AI!</h3>
          <p className="text-slate-400 text-xs leading-relaxed mb-4">
            Dapatkan rekomendasi cerdas dan analisis penggunaan uang kas kelas secara otomatis.
          </p>
          
          {insight ? (
            <div className="mt-4 p-4 bg-white/5 rounded-2xl text-[11px] text-slate-200 border border-white/5 leading-relaxed italic">
              {insight.length > 150 ? insight.substring(0, 150) + '...' : insight}
            </div>
          ) : (
            <button 
              onClick={generateReport}
              disabled={loading || transactions.length === 0}
              className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:text-indigo-300 transition-colors"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Mulai Analisis"}
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
