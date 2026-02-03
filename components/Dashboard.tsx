import React, { useMemo, useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Transaction, TransactionType, FinancialSummary, Currency, Subscription, CurrencySymbols } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { TrendingUp, TrendingDown, Wallet, ArrowRight, ChevronLeft, ChevronRight, Calendar, Globe, Info } from 'lucide-react';
import { triggerHaptic } from '../utils/telegram';
import { Flag } from './Flag';
import { convertCurrency, getRateSourceInfo } from '../services/currencyService';
import { useBaseCurrency } from '../context/BaseCurrencyContext';

interface DashboardProps {
  transactions: Transaction[];
  summary: FinancialSummary; // Global summary (All time)
  subscriptions: Subscription[];
  onViewSubscriptions: () => void;
}

// Custom hook for number animation
const useCountUp = (end: number, duration: number = 1000) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);

  useEffect(() => {
    let startTime: number | null = null;
    const start = countRef.current;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = start + (end - start) * ease;
      setCount(current);
      countRef.current = current;

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);

  return count;
};

const COLORS = ['#8b5cf6', '#d946ef', '#f43f5e', '#ec4899', '#6366f1', '#3b82f6', '#0ea5e9', '#14b8a6'];

export const Dashboard: React.FC<DashboardProps> = React.memo(({ transactions, summary, subscriptions, onViewSubscriptions }) => {
  const { t, language, setLanguage } = useLanguage();
  const { baseCurrency } = useBaseCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chartType, setChartType] = useState<'expense' | 'income'>('expense');

  const balanceInBase = useMemo(() => convertCurrency(summary.balance, Currency.PLN, baseCurrency), [summary.balance, baseCurrency]);
  const animatedBalance = useCountUp(balanceInBase);

  const handlePrevMonth = () => {
    triggerHaptic('light');
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    triggerHaptic('light');
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const isCurrentMonth = useMemo(() => {
    const now = new Date();
    return currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
  }, [currentDate]);

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() === currentDate.getMonth() &&
             tDate.getFullYear() === currentDate.getFullYear();
    });
  }, [transactions, currentDate]);

  const monthlyStats = useMemo(() => {
    const income = monthlyTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
      
    const expense = monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);

    return { income, expense };
  }, [monthlyTransactions]);
  
  const expenseData = useMemo(() => {
    const expenses = monthlyTransactions.filter(t => t.type === TransactionType.EXPENSE);
    const categories: Record<string, number> = {};
    expenses.forEach(t => { categories[t.category] = (categories[t.category] || 0) + t.amount; });
    return Object.keys(categories).map(key => ({ name: key, value: categories[key] })).sort((a, b) => b.value - a.value);
  }, [monthlyTransactions]);

  const incomeData = useMemo(() => {
    const incomes = monthlyTransactions.filter(t => t.type === TransactionType.INCOME);
    const categories: Record<string, number> = {};
    incomes.forEach(t => { categories[t.category] = (categories[t.category] || 0) + t.amount; });
    return Object.keys(categories).map(key => ({ name: key, value: categories[key] })).sort((a, b) => b.value - a.value);
  }, [monthlyTransactions]);
  
  const totalSubs = useMemo(() => subscriptions.reduce((acc, s) => acc + s.price, 0), [subscriptions]);

  const monthlyIncomeInBase = useMemo(() => convertCurrency(monthlyStats.income, Currency.PLN, baseCurrency), [monthlyStats.income, baseCurrency]);
  const monthlyExpenseInBase = useMemo(() => convertCurrency(monthlyStats.expense, Currency.PLN, baseCurrency), [monthlyStats.expense, baseCurrency]);
  const totalSubsInBase = useMemo(() => convertCurrency(totalSubs, Currency.PLN, baseCurrency), [totalSubs, baseCurrency]);

  const marketRates = useMemo(() => {
    const base = Currency.USD;
    const targets = [Currency.PLN, Currency.RUB, Currency.UAH];
    return targets.map(target => ({ target, rate: convertCurrency(1, base, target) }));
  }, []);

  const activeData = chartType === 'expense' ? expenseData : incomeData;
  const activeTotal = chartType === 'expense' ? monthlyStats.expense : monthlyStats.income;

  const formatMonth = (date: Date) => {
    const localeMap = { ru: 'ru-RU', en: 'en-US', pl: 'pl-PL' };
    return date.toLocaleDateString(localeMap[language], { month: 'long', year: 'numeric' });
  };

  const toggleLanguage = () => {
    triggerHaptic('medium');
    if (language === 'ru') setLanguage('en');
    else if (language === 'en') setLanguage('pl');
    else setLanguage('ru');
  };

  return (
    <div className="space-y-5 pb-28 animate-fade-in">
      <header className="flex justify-between items-center mb-1 pt-1">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            {t.dashboard.title}
          </h1>
          <p className="text-slate-500 text-xs font-medium tracking-wide uppercase">{t.dashboard.subtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-2 pr-3 pl-2 py-1.5 rounded-full bg-slate-800 border border-slate-700 active:scale-95 transition-all"
            >
                <Flag lang={language} size={20} />
                <span className="text-xs font-bold text-slate-300 uppercase">{language}</span>
            </button>

            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 p-[1px] shadow-lg">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                    <span className="text-lg">😎</span>
                </div>
            </div>
        </div>
      </header>

      {/* Main Global Balance Card - Responsive Font Size */}
      <div className="relative rounded-3xl p-5 sm:p-6 overflow-hidden shadow-2xl shadow-violet-900/20 group transform transition-transform duration-300 hover:scale-[1.01]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-orange-500 opacity-90 transition-all duration-500 group-hover:brightness-110"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-1">
            <div className="overflow-hidden">
                <p className="text-white/70 text-sm font-medium mb-1">{t.dashboard.balance}</p>
                {/* Responsive font size: 3xl on mobile, 4xl on larger screens */}
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight tabular-nums truncate">
                    {animatedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xl sm:text-2xl opacity-80">{CurrencySymbols[baseCurrency]}</span>
                </h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl shrink-0 ml-2">
                <Wallet className="text-white" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigation & Stats */}
      <div>
          <div className="flex items-center justify-between mb-4 bg-white/5 p-1 rounded-2xl border border-white/5">
            <button type="button" onClick={handlePrevMonth} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white active:scale-90 touch-manipulation">
                <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
                <Calendar size={14} className="text-fuchsia-400" />
                <span className="text-sm font-bold text-white capitalize">{formatMonth(currentDate)}</span>
                {!isCurrentMonth && (
                    <button 
                        type="button"
                        onClick={() => { triggerHaptic('light'); setCurrentDate(new Date()); }} 
                        className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 ml-1 hover:text-white transition-colors"
                    >
                        {t.dashboard.today}
                    </button>
                )}
            </div>
            <button type="button" onClick={handleNextMonth} className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white active:scale-90 touch-manipulation">
                <ChevronRight size={20} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all active:scale-[0.98]">
              <div className="absolute right-0 top-0 p-3 opacity-5">
                  <TrendingUp size={40} />
              </div>
              <div className="flex items-center space-x-2 text-emerald-300 mb-2">
                <div className="p-1.5 bg-emerald-400/20 rounded-lg">
                  <TrendingUp size={14} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{t.dashboard.income}</span>
              </div>
              <p className="font-bold text-lg sm:text-xl text-white truncate">{monthlyIncomeInBase.toLocaleString()} <span className="text-sm">{CurrencySymbols[baseCurrency]}</span></p>
            </div>

            <div className="glass-card rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden transition-all active:scale-[0.98]">
               <div className="absolute right-0 top-0 p-3 opacity-5">
                  <TrendingDown size={40} />
              </div>
              <div className="flex items-center space-x-2 text-rose-300 mb-2">
                <div className="p-1.5 bg-rose-400/20 rounded-lg">
                  <TrendingDown size={14} />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">{t.dashboard.expense}</span>
              </div>
              <p className="font-bold text-lg sm:text-xl text-white truncate">{monthlyExpenseInBase.toLocaleString()} <span className="text-sm">{CurrencySymbols[baseCurrency]}</span></p>
            </div>
          </div>
      </div>
      
      {/* Subscriptions Mini Card */}
      <button 
        type="button"
        onClick={() => { triggerHaptic('light'); onViewSubscriptions(); }}
        className="w-full glass-card p-4 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all hover:bg-white/5"
      >
        <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex shrink-0 items-center justify-center text-indigo-300">
                <ArrowRight size={20} className="-rotate-45" />
            </div>
            <div className="text-left overflow-hidden">
                <div className="text-sm font-bold text-white truncate">{t.dashboard.subscriptions}</div>
                <div className="text-xs text-slate-400 truncate">{subscriptions.length} {t.dashboard.subSubtitle} • {totalSubsInBase.toLocaleString()} {CurrencySymbols[baseCurrency]}{t.subs.month}</div>
            </div>
        </div>
        <ArrowRight size={18} className="text-slate-500 group-hover:text-white transition-colors shrink-0" />
      </button>

      {/* Chart Section */}
      <div className="glass-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className={`w-1 h-6 rounded-full ${chartType === 'expense' ? 'bg-fuchsia-500' : 'bg-emerald-500'} transition-colors duration-300`}></span>
                {t.dashboard.chartTitle}
            </h3>
            
            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
                <button 
                    type="button"
                    onClick={() => { triggerHaptic('light'); setChartType('expense'); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${chartType === 'expense' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {t.dashboard.expense}
                </button>
                <button 
                     type="button"
                     onClick={() => { triggerHaptic('light'); setChartType('income'); }}
                     className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all touch-manipulation ${chartType === 'income' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {t.dashboard.income}
                </button>
            </div>
        </div>
        
        {activeData.length > 0 ? (
          <div className="flex flex-col items-center animate-fade-in">
            <div className="h-56 w-full relative">
                {/* Center text for chart */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-slate-500 text-xs">{t.dashboard.total}</span>
                    <span className="text-white font-bold">{convertCurrency(activeTotal, Currency.PLN, baseCurrency).toLocaleString()} {CurrencySymbols[baseCurrency]}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={activeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                    >
                    {activeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    </Pie>
                    <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        borderColor: 'rgba(255,255,255,0.1)', 
                        color: '#fff', 
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                    }}
                    formatter={(value: number) => [`${convertCurrency(value, Currency.PLN, baseCurrency).toLocaleString()} ${CurrencySymbols[baseCurrency]}`, '']}
                    itemStyle={{ color: '#e2e8f0' }}
                    cursor={false}
                    />
                </PieChart>
                </ResponsiveContainer>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {activeData.slice(0, 4).map((entry, index) => (
                <div key={entry.name} className="flex items-center space-x-2 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: COLORS[index % COLORS.length], boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}80` }}></div>
                  <span className="text-xs text-slate-300 font-medium">{entry.name}</span>
                </div>
              ))}
              {activeData.length > 4 && (
                  <div className="flex items-center space-x-2 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                      <span className="text-xs text-slate-400">+{activeData.length - 4} {t.dashboard.others}</span>
                  </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-48 flex flex-col items-center justify-center text-slate-600 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 animate-pulse">
            <Wallet size={40} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">{chartType === 'expense' ? t.dashboard.noExpenses : t.dashboard.noIncome}</p>
          </div>
        )}
      </div>

      {/* Market Rates */}
      <div className="glass-card rounded-3xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Globe size={16} /> {t.dashboard.marketRates} (1 USD)
            </h3>
            <div className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-900/40 px-2 py-0.5 rounded border border-white/5">
                <Info size={10} />
                <span>{getRateSourceInfo()}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
              {marketRates.map(({ target, rate }) => (
                  <div key={target} className="bg-slate-900/50 p-2.5 rounded-xl border border-white/5 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center gap-1.5 mb-1">
                          <Flag currency={target} size={16} />
                          <span className="text-xs font-bold text-slate-300">{target}</span>
                      </div>
                      <div className="text-sm font-bold text-white tracking-wide">
                          {rate.toFixed(2)}
                      </div>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
});