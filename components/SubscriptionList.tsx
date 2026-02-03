import React, { useState, useEffect, useMemo } from 'react';
import { Subscription, Currency, CurrencySymbols } from '../types';
import { convertCurrency } from '../services/currencyService';
import { useBaseCurrency } from '../context/BaseCurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Plus, Trash2, Zap, Bell, BellOff, Pencil, X, LayoutGrid, List } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { triggerHaptic, triggerNotification, showConfirm, showAlert } from '../utils/telegram';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onAdd: (sub: Subscription) => void;
  onRemove: (id: string) => void;
  onUpdate: (sub: Subscription) => void;
}

const COLORS = [
    'from-red-500 to-orange-500', 
    'from-blue-500 to-cyan-500', 
    'from-green-500 to-emerald-500', 
    'from-purple-500 to-violet-500', 
    'from-pink-500 to-rose-500'
];

export const SubscriptionList: React.FC<SubscriptionListProps> = React.memo(({ subscriptions, onAdd, onRemove, onUpdate }) => {
  const { t, language } = useLanguage();
  const { baseCurrency } = useBaseCurrency();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('1');
  const [notify, setNotify] = useState(true);

  // Helper moved outside or memoized if complex, here it's simple enough to stay or move out.
  // Kept inside for simplicity but needs to be accessible to useEffect
  const getDaysRemaining = (day: number) => {
    const today = new Date().getDate();
    if (day >= today) return day - today;
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    return (daysInMonth - today) + day;
  };

  useEffect(() => {
    const checkNotifications = () => {
        const upcoming = subscriptions.filter(sub => {
            if (!sub.notify) return false;
            // Re-implement simplified logic here to avoid dependency issues with helper function
            const today = new Date().getDate();
            let daysLeft = sub.billingDate >= today ? sub.billingDate - today : (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - today) + sub.billingDate;
            
            return daysLeft <= 3 && daysLeft >= 0;
        });

        if (upcoming.length > 0) {
            // Recalculate days for display inside the map
            const message = `${t.subs.alertMessage}:\n${upcoming.map(s => {
                const today = new Date().getDate();
                let daysLeft = s.billingDate >= today ? s.billingDate - today : (new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() - today) + s.billingDate;
                return `${s.name} (${s.price} zł) - ${daysLeft === 0 ? t.subs.today : `${t.subs.inDays} ${daysLeft}`}`;
            }).join('\n')}`;
            
            showAlert(t.subs.alertTitle, message);
        }
    };
    
    // Check only once on mount or when subs change significantly (length change usually implies add/remove)
    // We intentionally don't want this running on every render or minor update to avoid spamming alerts
    const timer = setTimeout(checkNotifications, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions.length, t]); 

  const resetForm = () => {
      setName('');
      setPrice('');
      setDate('1');
      setNotify(true);
      setEditingId(null);
      setIsFormOpen(false);
  };

  const handleEdit = (sub: Subscription) => {
      triggerHaptic('light');
      setEditingId(sub.id);
      setName(sub.name);
      setPrice(sub.price.toString());
      setDate(sub.billingDate.toString());
      setNotify(!!sub.notify);
      setIsFormOpen(true);
      setViewMode('list'); 
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
      triggerHaptic('medium');
      showConfirm(t.history.delete + '?', (confirmed) => {
          if (confirmed) {
              onRemove(id);
              triggerNotification('success');
          }
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
        triggerNotification('error');
        return;
    }
    
    triggerNotification('success');

    if (editingId) {
        const existingSub = subscriptions.find(s => s.id === editingId);
        if (existingSub) {
            onUpdate({
                ...existingSub,
                name,
                price: parseFloat(price),
                billingDate: parseInt(date),
                notify: notify
            });
        }
    } else {
        onAdd({
            id: uuidv4(),
            name,
            price: parseFloat(price),
            billingDate: parseInt(date),
            isActive: true,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            notify: notify
        });
    }
    
    resetForm();
  };

  const totalMonthly = useMemo(() => subscriptions.reduce((acc, sub) => acc + sub.price, 0), [subscriptions]);

  const renderCalendar = () => {
    const today = new Date().getDate();
    const days = Array.from({ length: 31 }, (_, i) => i + 1);

    // Days localization
    const dayNames = {
      ru: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
      en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
      pl: ['Pn','Wt','Śr','Cz','Pt','So','Nd']
    };
    const currentDays = dayNames[language] || dayNames.ru;

    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-7 gap-2 mb-4">
               {currentDays.map(d => (
                   <div key={d} className="text-center text-[10px] text-slate-500 uppercase font-bold">{d}</div>
               ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
                {days.map(day => {
                    // This filter inside map is okay for 31 items
                    const daySubs = subscriptions.filter(s => s.billingDate === day);
                    const isToday = day === today;
                    
                    return (
                        <div 
                            key={day} 
                            onClick={() => triggerHaptic('light')}
                            className={`aspect-square rounded-xl border flex flex-col items-center justify-start pt-1.5 relative transition-all active:scale-95 ${
                                isToday 
                                ? 'bg-violet-600/20 border-violet-500 shadow-lg shadow-violet-500/20' 
                                : 'bg-slate-800/40 border-white/5 hover:bg-slate-800/80'
                            }`}
                        >
                            <span className={`text-xs font-medium ${isToday ? 'text-violet-300' : 'text-slate-400'}`}>
                                {day}
                            </span>
                            <div className="flex flex-wrap justify-center gap-1 mt-1 px-0.5 w-full">
                                {daySubs.map(sub => (
                                    <div 
                                        key={sub.id} 
                                        className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${sub.color}`}
                                        title={`${sub.name} - ${sub.price} zł`}
                                    />
                                ))}
                            </div>
                            {daySubs.length > 0 && isToday && (
                                <div className="absolute -bottom-1 w-full flex justify-center">
                                    <div className="w-1 h-1 bg-white rounded-full"></div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold text-slate-400 mb-3">{t.subs.upcoming}</h4>
                {subscriptions
                    .sort((a, b) => getDaysRemaining(a.billingDate) - getDaysRemaining(b.billingDate))
                    .slice(0, 3)
                    .map(sub => (
                    <div key={sub.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5" onClick={() => triggerHaptic('light')}>
                        <div className={`w-2 h-8 rounded-full bg-gradient-to-b ${sub.color}`}></div>
                        <div className="flex-1">
                            <div className="font-medium text-white text-sm">{sub.name}</div>
                            <div className="text-xs text-slate-400">{sub.billingDate} {t.subs.day}</div>
                        </div>
                        <div className="text-right">
                             <div className="text-white font-bold">{sub.price} zł</div>
                             <div className="text-[10px] text-emerald-400">
                                 {getDaysRemaining(sub.billingDate) === 0 ? t.subs.today : `${getDaysRemaining(sub.billingDate)} ${t.subs.inDays}`}
                             </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  return (
    <div className="pb-28 animate-fade-in">
      <div className="glass-panel p-5 rounded-3xl mb-6 flex justify-between items-center border border-white/10">
        <div>
            <h2 className="text-lg font-bold text-white mb-1">{t.subs.title}</h2>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                    {totalMonthlyInBase.toLocaleString()} {CurrencySymbols[baseCurrency]}
                </span>
                <span className="text-xs text-slate-400">{t.subs.month}</span>
            </div>
        </div>
        
        <div className="flex gap-2">
            <div className="bg-slate-900/50 p-1 rounded-xl flex border border-white/5">
                <button 
                    type="button"
                    onClick={() => { triggerHaptic('light'); setViewMode('list'); }}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    <List size={20} />
                </button>
                <button 
                    type="button"
                    onClick={() => { triggerHaptic('light'); setViewMode('calendar'); }}
                    className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                >
                    <LayoutGrid size={20} />
                </button>
            </div>
            
            <button 
                type="button"
                onClick={() => {
                    triggerHaptic('light');
                    if (isFormOpen) {
                        resetForm();
                    } else {
                        setIsFormOpen(true);
                        setViewMode('list'); // Force list view when adding
                    }
                }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isFormOpen ? 'bg-slate-700 rotate-45' : 'bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-indigo-500/30'}`}
            >
                <Plus size={24} color="white" />
            </button>
        </div>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="glass-card p-5 rounded-2xl border border-white/10 mb-6 animate-slide-in relative">
            <h3 className="text-sm font-semibold text-white mb-4">
                {editingId ? t.subs.edit : t.subs.new}
            </h3>
            
            <div className="space-y-4">
                <input 
                    type="text" placeholder={t.subs.namePlaceholder} 
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-black/20 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-violet-500 outline-none"
                    autoFocus={!editingId}
                />
                <div className="flex gap-3">
                    <input 
                        type="number" placeholder="Price" 
                        value={price} onChange={e => setPrice(e.target.value)}
                        className="w-1/2 bg-black/20 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-violet-500 outline-none"
                    />
                    <div className="w-1/2 relative">
                        <input 
                            type="number" placeholder="Day" min="1" max="31"
                            value={date} onChange={e => setDate(e.target.value)}
                            className="w-full bg-black/20 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:border-violet-500 outline-none"
                        />
                         <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">{t.subs.day}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-slate-700/50">
                    <button 
                        type="button"
                        onClick={() => { triggerHaptic('light'); setNotify(!notify); }}
                        className={`p-2 rounded-lg transition-colors ${notify ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'bg-slate-700/50 text-slate-400'}`}
                    >
                        {notify ? <Bell size={18} /> : <BellOff size={18} />}
                    </button>
                    <span className="text-sm text-slate-300">{t.subs.notify}</span>
                </div>
                
                <div className="flex gap-3 pt-2">
                    {editingId && (
                        <button 
                            type="button" 
                            onClick={resetForm}
                            className="w-1/3 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center"
                        >
                            <X size={20} />
                        </button>
                    )}
                    <button 
                        type="submit" 
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-semibold transition-colors active:scale-95"
                    >
                        {editingId ? t.add.save : t.nav.add}
                    </button>
                </div>
            </div>
        </form>
      )}

      {viewMode === 'calendar' ? renderCalendar() : (
          <div className="space-y-4">
            {subscriptions.map(sub => {
                const daysLeft = getDaysRemaining(sub.billingDate);
                const isUrgent = daysLeft <= 3;
                
                return (
                    <div key={sub.id} className={`relative overflow-hidden glass-card rounded-2xl p-0 group hover:border-slate-600 transition-colors ${isUrgent && sub.notify ? 'ring-1 ring-rose-500/50' : ''}`}>
                        <div className={`h-1.5 w-full bg-gradient-to-r ${sub.color}`}></div>
                        
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${sub.color} bg-opacity-10 flex items-center justify-center shadow-inner relative`}>
                                    <Zap size={18} className="text-white mix-blend-overlay" />
                                    {isUrgent && sub.notify && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-[#1e293b]"></span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-base flex items-center gap-2">
                                        {sub.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                        <Calendar size={12} />
                                        <span>{sub.billingDate} {t.subs.day}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-right">
                                <div className="font-bold text-white text-lg">{convertCurrency(sub.price, Currency.PLN, baseCurrency).toLocaleString()} <span className="text-xs font-normal opacity-70">{CurrencySymbols[baseCurrency]}</span></div>
                                <div className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
                                    daysLeft <= 3 
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/20' 
                                    : 'bg-slate-700/50 text-slate-400'
                                }`}>
                                    {daysLeft === 0 ? t.subs.today : `${daysLeft} ${t.subs.inDays}`}
                                </div>
                            </div>
                            
                            <div className="absolute right-0 top-0 flex items-center bg-slate-900/95 rounded-bl-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all shadow-xl border-l border-b border-white/5">
                                <button 
                                    type="button"
                                    onClick={() => handleEdit(sub)}
                                    className="p-2.5 text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                    title="Edit"
                                >
                                    <Pencil size={16} />
                                </button>
                                <div className="w-[1px] h-4 bg-slate-700"></div>
                                <button 
                                    type="button"
                                    onClick={() => onUpdate({...sub, notify: !sub.notify})}
                                    className={`p-2.5 transition-all hover:bg-white/5 ${sub.notify ? 'text-fuchsia-400 hover:text-fuchsia-300' : 'text-slate-500 hover:text-slate-300'}`}
                                    title="Notifications"
                                >
                                {sub.notify ? <Bell size={16} /> : <BellOff size={16} />} 
                                </button>
                                <div className="w-[1px] h-4 bg-slate-700"></div>
                                <button 
                                    type="button"
                                    onClick={() => handleDelete(sub.id)}
                                    className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all rounded-bl-xl"
                                    title="Delete"
                                >
                                <Trash2 size={16} /> 
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
            {subscriptions.length === 0 && !isFormOpen && (
                <div className="text-center text-slate-500 py-10 bg-slate-800/20 rounded-2xl border border-dashed border-slate-800">
                    <p>{t.subs.empty}</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
});