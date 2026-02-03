import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { Navigation } from './components/Navigation';
import { TabView, Transaction, Subscription, FinancialSummary, TransactionType, Currency, Wish } from './types';
import { Loader2 } from 'lucide-react';
import { LanguageProvider } from './context/LanguageContext';
import { BaseCurrencyProvider, useBaseCurrency } from './context/BaseCurrencyContext';
import { ExchangeRatesProvider } from './context/ExchangeRatesContext';
import { triggerHaptic } from './utils/telegram';
import { fetchUserData, syncUserData } from './services/userDataSync';
import { useLanguage } from './context/LanguageContext';
import { OnboardingScreen } from './components/OnboardingScreen';

// Lazy load heavy components
const Dashboard = React.lazy(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const TransactionList = React.lazy(() => import('./components/TransactionList').then(module => ({ default: module.TransactionList })));
const AddForm = React.lazy(() => import('./components/AddForm').then(module => ({ default: module.AddForm })));
const SubscriptionList = React.lazy(() => import('./components/SubscriptionList').then(module => ({ default: module.SubscriptionList })));
const Wishlist = React.lazy(() => import('./components/Wishlist').then(module => ({ default: module.Wishlist })));
const Converter = React.lazy(() => import('./components/Converter').then(module => ({ default: module.Converter })));

// Mock data for initial state
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', title: 'Супермаркет (Biedronka)', amount: 145.50, type: TransactionType.EXPENSE, category: 'Продукты', date: new Date().toISOString() },
  { id: '2', title: 'Зарплата', amount: 6500, type: TransactionType.INCOME, category: 'Зарплата', date: new Date().toISOString() },
  { id: '3', title: 'Такси Uber', amount: 28.90, type: TransactionType.EXPENSE, category: 'Транспорт', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', title: 'Кофе Starbucks', amount: 22.00, type: TransactionType.EXPENSE, category: 'Кафе', date: new Date(Date.now() - 172800000).toISOString() }
];

const INITIAL_SUBS: Subscription[] = [
  { id: '1', name: 'Netflix', price: 60, billingDate: 15, isActive: true, color: 'from-red-500 to-orange-500', notify: true },
  { id: '2', name: 'Spotify', price: 20, billingDate: 5, isActive: true, color: 'from-green-500 to-emerald-500', notify: false },
  { id: '3', name: 'Спортзал', price: 120, billingDate: 1, isActive: true, color: 'from-blue-500 to-cyan-500', notify: true }
];

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[50vh] animate-pulse">
    <Loader2 size={40} className="text-violet-500 animate-spin mb-4" />
    <p className="text-slate-500 text-sm">Loading...</p>
  </div>
);

const AppFooter: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="text-center py-3 text-slate-500 text-[10px]">
      FinTrack · {t.footer.credits}
    </footer>
  );
};

const ONBOARDING_KEY = 'fintrack_onboarding_done';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabView>('dashboard');
  const [onboardingDone, setOnboardingDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  });
  const { language, setLanguage } = useLanguage();
  const { baseCurrency, setBaseCurrency } = useBaseCurrency();

  useEffect(() => {
    // Basic Telegram WebApp initialization
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Ensure the background color matches the app to avoid white flashes
      try {
        tg.setHeaderColor('#020617'); // Match bg-slate-950
        tg.setBackgroundColor('#020617');
      } catch (e) {
        console.log('Telegram theme styling not supported');
      }
    }
  }, []);
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => {
    const saved = localStorage.getItem('subscriptions');
    return saved ? JSON.parse(saved) : INITIAL_SUBS;
  });

  const [wishes, setWishes] = useState<Wish[]>(() => {
    const saved = localStorage.getItem('wishes');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('wishes', JSON.stringify(wishes));
  }, [wishes]);

  // Load data from server when opened in Telegram (same account = sync across devices)
  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) return;
    fetchUserData().then((data) => {
      if (!data) return;
      if (data.language && (data.language === 'ru' || data.language === 'en' || data.language === 'pl')) {
        setLanguage(data.language);
        localStorage.setItem('fintrack_language', data.language);
      }
      if (data.baseCurrency && ['RUB', 'BYN', 'PLN', 'USD', 'EUR'].includes(data.baseCurrency)) {
        setBaseCurrency(data.baseCurrency as import('./types').Currency);
        localStorage.setItem('fintrack_base_currency', data.baseCurrency);
      }
      if (data.updatedAt) {
        setTransactions(data.transactions as Transaction[]);
        setSubscriptions(data.subscriptions as Subscription[]);
        setWishes(data.wishes as Wish[]);
        localStorage.setItem('transactions', JSON.stringify(data.transactions));
        localStorage.setItem('subscriptions', JSON.stringify(data.subscriptions));
        localStorage.setItem('wishes', JSON.stringify(data.wishes));
      }
      if (data.language && data.baseCurrency) {
        localStorage.setItem(ONBOARDING_KEY, '1');
        setOnboardingDone(true);
      }
    }).catch(() => {});
  }, [setLanguage, setBaseCurrency]);

  // Sync all data to server when in Telegram (debounced) so other devices get updates
  useEffect(() => {
    if (!window.Telegram?.WebApp?.initData) return;
    const timer = setTimeout(() => {
      syncUserData({
        transactions,
        subscriptions,
        wishes,
        language,
        baseCurrency,
      }).catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, [transactions, subscriptions, wishes, language, baseCurrency]);

  // Use useCallback to prevent recreating functions on every render
  const addTransaction = useCallback((t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    setActiveTab('dashboard');
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const addSubscription = useCallback((s: Subscription) => {
    setSubscriptions(prev => [...prev, s]);
  }, []);

  const removeSubscription = useCallback((id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  }, []);

  const updateSubscription = useCallback((updatedSub: Subscription) => {
    setSubscriptions(prev => prev.map(s => s.id === updatedSub.id ? updatedSub : s));
  }, []);

  const addWish = useCallback((w: Wish) => {
      setWishes(prev => [w, ...prev]);
  }, []);

  const removeWish = useCallback((id: string) => {
      setWishes(prev => prev.filter(w => w.id !== id));
  }, []);

  const toggleWish = useCallback((id: string) => {
      triggerHaptic('light');
      setWishes(prev => prev.map(w => w.id === id ? { ...w, isCompleted: !w.isCompleted } : w));
  }, []);

  const goToSubs = useCallback(() => setActiveTab('subscriptions'), []);
  const goToDashboard = useCallback(() => setActiveTab('dashboard'), []);

  const summary = useMemo<FinancialSummary>(() => {
    const totalIncome = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  }, [transactions]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} summary={summary} subscriptions={subscriptions} onViewSubscriptions={goToSubs} />;
      case 'transactions':
        return <TransactionList transactions={transactions} onDelete={deleteTransaction} />;
      case 'add':
        return <AddForm onAdd={addTransaction} onClose={goToDashboard} />;
      case 'converter':
        return <Converter />;
      case 'subscriptions':
        return <SubscriptionList subscriptions={subscriptions} onAdd={addSubscription} onRemove={removeSubscription} onUpdate={updateSubscription} />;
      case 'wishlist':
        return <Wishlist wishes={wishes} onAdd={addWish} onRemove={removeWish} onToggle={toggleWish} />;
      default:
        return <Dashboard transactions={transactions} summary={summary} subscriptions={subscriptions} onViewSubscriptions={goToSubs} />;
    }
  };

  if (!onboardingDone) {
    return (
      <div className="fixed top-0 left-0 w-full h-[100dvh] mesh-gradient text-slate-50 font-sans overflow-hidden">
        <main className="max-w-md mx-auto h-full relative shadow-2xl bg-black/40 backdrop-blur-sm flex flex-col">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none z-0" />
          <div className="flex-1 overflow-y-auto z-10 p-5 pt-safe">
            <OnboardingScreen onComplete={() => setOnboardingDone(true)} />
          </div>
        </main>
      </div>
    );
  }

  return (
    // Use h-[100dvh] for mobile browsers to ignore address bar
    <div className="fixed top-0 left-0 w-full h-[100dvh] mesh-gradient text-slate-50 font-sans selection:bg-fuchsia-500 selection:text-white overflow-hidden">
      <main className="max-w-md mx-auto h-full relative shadow-2xl bg-black/40 backdrop-blur-sm flex flex-col">
        
        {/* Ambient Lights - pointer-events-none ensures they don't block clicks */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] rounded-full bg-violet-600/20 blur-[120px] pointer-events-none z-0"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none z-0"></div>

        {/* Scrollable Content Area */}
        {/* overscroll-y-contain prevents the body from shaking when hitting the edge */}
        <div 
            className="flex-1 overflow-y-auto z-10 p-5 scrollbar-hide overscroll-y-contain pt-safe" 
            style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <Suspense fallback={<LoadingFallback />}>
            {renderContent()}
          </Suspense>
          <AppFooter />
        </div>

        {/* Navigation is fixed at the bottom of this container */}
        <div className="pb-safe">
            <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <BaseCurrencyProvider>
        <ExchangeRatesProvider>
          <AppContent />
        </ExchangeRatesProvider>
      </BaseCurrencyProvider>
    </LanguageProvider>
  );
};

export default App;