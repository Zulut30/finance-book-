import React, { useState } from 'react';
import { Transaction, Subscription } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, Bot, Loader2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AiAdvisorProps {
  transactions: Transaction[];
  subscriptions: Subscription[];
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({ transactions, subscriptions }) => {
  const { t, language } = useLanguage();
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions, subscriptions, language);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="pb-28 animate-fade-in flex flex-col h-full min-h-[75vh]">
      <header className="mb-8 pt-2">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-1">
          <Sparkles className="text-fuchsia-400 animate-pulse" /> {t.ai.title}
        </h1>
        <p className="text-slate-400 text-sm">{t.ai.subtitle}</p>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-fuchsia-600/20 blur-[100px] rounded-full pointer-events-none"></div>

        {!advice && !loading && (
          <div className="text-center p-8 glass-card rounded-3xl max-w-sm mx-auto border border-white/10 relative z-10 animate-float">
            <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-fuchsia-900/30">
              <Bot size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t.ai.cardTitle}</h3>
            <p className="text-slate-300 text-sm mb-8 leading-relaxed">
              {t.ai.cardDesc}
            </p>
            <button
              onClick={handleGetAdvice}
              className="group relative w-full overflow-hidden rounded-2xl bg-white p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2E8F0_0%,#500724_50%,#E2E8F0_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-950 px-6 py-4 text-sm font-medium text-white backdrop-blur-3xl transition-all group-hover:bg-slate-900 gap-2">
                {t.ai.button} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-6 relative z-10">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles size={20} className="text-fuchsia-400" />
                </div>
            </div>
            <p className="text-slate-300 text-sm animate-pulse tracking-wide font-medium">{t.ai.processing}</p>
          </div>
        )}

        {advice && !loading && (
          <div className="w-full glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl relative z-10 animate-slide-up">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <div className="p-2 bg-fuchsia-500/20 rounded-lg">
                    <Sparkles size={20} className="text-fuchsia-400" />
                </div>
                <h3 className="font-bold text-white">{t.ai.resultTitle}</h3>
            </div>
            <div className="prose prose-invert prose-sm max-w-none text-slate-200">
              <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
            <button
              onClick={() => setAdvice(null)}
              className="mt-6 w-full py-3.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white text-sm font-semibold transition-colors border border-slate-700"
            >
              {t.ai.back}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
