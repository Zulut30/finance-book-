import React, { useMemo } from 'react';
import { Transaction, TransactionType, Currency, CurrencySymbols } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { triggerHaptic, showConfirm, triggerNotification } from '../utils/telegram';
import { 
    ShoppingBag, Coffee, Home, Zap, Monitor, Heart, Globe, Briefcase, 
    Gift, TrendingUp, Car, GraduationCap, Shirt, Smartphone, PawPrint, 
    Plane, Scissors, HeartHandshake, Percent, Key, Laptop, Gamepad2, Download,
    Music, Film, Dumbbell, BookOpen, UtensilsCrossed, Bus, Wifi, Coins,
    Baby, Hammer, Palmtree, Syringe, Ticket, Calendar
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

const getCategoryDetails = (category: string) => {
  const normalized = category.toLowerCase();
  
  // Helper to match partial strings for better flexibility across languages
  const matches = (keys: string[]) => keys.some(k => normalized.includes(k));

  if (matches(['продукт', 'еда', 'магазин', 'groceries', 'food', 'zakupy', 'jedzenie'])) return { icon: ShoppingBag, color: 'bg-orange-500', text: 'text-orange-100' };
  if (matches(['кафе', 'ресторан', 'бар', 'кофе', 'cafe', 'restaurant', 'coffee', 'kawiarnia', 'restauracja'])) return { icon: Coffee, color: 'bg-amber-600', text: 'text-amber-100' };
  if (matches(['фастфуд', 'обед', 'ужин', 'lunch', 'dinner', 'obiad', 'kolacja'])) return { icon: UtensilsCrossed, color: 'bg-yellow-600', text: 'text-yellow-100' };
  if (matches(['жилье', 'дом', 'квартира', 'ремонт', 'housing', 'home', 'rent', 'dom', 'mieszkanie', 'czynsz'])) return { icon: Home, color: 'bg-blue-500', text: 'text-blue-100' };
  if (matches(['инструмент', 'стройка', 'tools', 'repair', 'narzędzia', 'remont'])) return { icon: Hammer, color: 'bg-slate-500', text: 'text-slate-100' };
  if (matches(['транспорт', 'такси', 'uber', 'bolt', 'transport', 'taxi'])) return { icon: Car, color: 'bg-indigo-500', text: 'text-indigo-100' };
  if (matches(['автобус', 'метро', 'трамвай', 'проезд', 'bus', 'subway', 'tram', 'autobus', 'bilety'])) return { icon: Bus, color: 'bg-indigo-400', text: 'text-indigo-100' };
  if (matches(['счет', 'коммунал', 'свет', 'вода', 'bills', 'utilities', 'rachunki', 'woda', 'prąd'])) return { icon: Zap, color: 'bg-yellow-500', text: 'text-yellow-100' };
  if (matches(['интернет', 'связь', 'телефон', 'internet', 'phone', 'wifi', 'telefon'])) return { icon: Wifi, color: 'bg-sky-500', text: 'text-sky-100' };
  if (matches(['развлеч', 'кино', 'театр', 'концерт', 'entertainment', 'cinema', 'theatre', 'rozrywka', 'kino'])) return { icon: Ticket, color: 'bg-purple-500', text: 'text-purple-100' };
  if (matches(['фильм', 'netflix', 'кинопоиск', 'film', 'movie'])) return { icon: Film, color: 'bg-red-600', text: 'text-red-100' };
  if (matches(['музыка', 'spotify', 'yandex', 'music', 'muzyka'])) return { icon: Music, color: 'bg-green-500', text: 'text-green-100' };
  if (matches(['игры', 'steam', 'playstation', 'xbox', 'games', 'gaming', 'gry'])) return { icon: Gamepad2, color: 'bg-indigo-600', text: 'text-indigo-100' };
  if (matches(['здоровье', 'аптека', 'врач', 'health', 'doctor', 'pharmacy', 'zdrowie', 'lekarz', 'apteka'])) return { icon: Heart, color: 'bg-rose-500', text: 'text-rose-100' };
  if (matches(['спорт', 'зал', 'фитнес', 'бассейн', 'sport', 'gym', 'fitness', 'siłownia'])) return { icon: Dumbbell, color: 'bg-cyan-600', text: 'text-cyan-100' };
  if (matches(['лекарств', 'процедур', 'meds', 'leki'])) return { icon: Syringe, color: 'bg-rose-400', text: 'text-rose-100' };
  if (matches(['одежда', 'обувь', 'шопинг', 'clothes', 'clothing', 'shoes', 'ubrania', 'buty'])) return { icon: Shirt, color: 'bg-pink-400', text: 'text-pink-100' };
  if (matches(['техника', 'гаджет', 'электроника', 'tech', 'electronics', 'gadgets', 'sprzęt', 'elektronika'])) return { icon: Smartphone, color: 'bg-zinc-500', text: 'text-zinc-100' };
  if (matches(['образование', 'курсы', 'книги', 'учеба', 'education', 'courses', 'books', 'edukacja', 'kursy', 'książki'])) return { icon: GraduationCap, color: 'bg-sky-600', text: 'text-sky-100' };
  if (matches(['книг', 'библиотека', 'book', 'library', 'biblioteka'])) return { icon: BookOpen, color: 'bg-amber-700', text: 'text-amber-100' };
  if (matches(['питомцы', 'кот', 'собака', 'корм', 'pets', 'cat', 'dog', 'zwierzęta', 'kot', 'pies'])) return { icon: PawPrint, color: 'bg-orange-700', text: 'text-orange-100' };
  if (matches(['путешеств', 'отпуск', 'билеты', 'travel', 'vacation', 'podróże', 'wakacje'])) return { icon: Plane, color: 'bg-cyan-500', text: 'text-cyan-100' };
  if (matches(['отель', 'гостиница', 'море', 'hotel', 'sea'])) return { icon: Palmtree, color: 'bg-teal-400', text: 'text-teal-100' };
  if (matches(['красота', 'салон', 'стрижка', 'beauty', 'salon', 'haircut', 'uroda', 'fryzjer'])) return { icon: Scissors, color: 'bg-fuchsia-400', text: 'text-fuchsia-100' };
  if (matches(['дети', 'ребенок', 'игрушки', 'kids', 'child', 'toys', 'dzieci', 'zabawki'])) return { icon: Baby, color: 'bg-pink-300', text: 'text-pink-100' };
  if (matches(['благотвор', 'помощь', 'charity', 'donation', 'charytatywność', 'pomoc'])) return { icon: HeartHandshake, color: 'bg-red-400', text: 'text-red-100' };
  
  // Income
  if (matches(['зарплата', 'зп', 'аванс', 'salary', 'wages', 'wypłata', 'pensja'])) return { icon: Briefcase, color: 'bg-emerald-500', text: 'text-emerald-100' };
  if (matches(['подарок', 'бонус', 'премия', 'gift', 'bonus', 'prezent', 'premia'])) return { icon: Gift, color: 'bg-pink-500', text: 'text-pink-100' };
  if (matches(['инвестиц', 'акции', 'крипта', 'invest', 'stocks', 'crypto', 'inwestycje', 'giełda'])) return { icon: TrendingUp, color: 'bg-cyan-500', text: 'text-cyan-100' };
  if (matches(['подработка', 'халтура', 'side gig', 'extra', 'fucha'])) return { icon: Zap, color: 'bg-lime-500', text: 'text-lime-100' };
  if (matches(['фриланс', 'проект', 'заказ', 'freelance', 'project', 'projekt', 'zlecenie'])) return { icon: Laptop, color: 'bg-violet-500', text: 'text-violet-100' };
  if (matches(['проценты', 'вклад', 'кешбэк', 'interest', 'cashback', 'odsetki'])) return { icon: Percent, color: 'bg-teal-500', text: 'text-teal-100' };
  if (matches(['аренда', 'сдача', 'rent', 'leasing', 'wynajem'])) return { icon: Key, color: 'bg-blue-400', text: 'text-blue-100' };
  if (matches(['обмен', 'валюта', 'exchange', 'currency', 'wymiana', 'waluta'])) return { icon: Coins, color: 'bg-yellow-400', text: 'text-yellow-100' };

  // Default
  return { icon: Globe, color: 'bg-slate-500', text: 'text-slate-100' };
};

export const TransactionList: React.FC<TransactionListProps> = React.memo(({ transactions, onDelete }) => {
  const { t, language } = useLanguage();

  const handleExportCSV = () => {
    triggerHaptic('light');
    if (transactions.length === 0) return;

    // Localized Headers
    const headers = {
        ru: ['Дата', 'Название', 'Категория', 'Тип', 'Сумма (PLN)', 'Исх. Сумма', 'Валюта'],
        en: ['Date', 'Title', 'Category', 'Type', 'Amount (PLN)', 'Orig. Amount', 'Currency'],
        pl: ['Data', 'Tytuł', 'Kategoria', 'Typ', 'Kwota (PLN)', 'Kwota oryg.', 'Waluta']
    };

    const currentHeaders = headers[language] || headers.ru;
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const csvContent = [
      currentHeaders.join(';'), 
      ...sorted.map(tx => {
        const localeMap: Record<string, string> = { ru: 'ru-RU', en: 'en-US', pl: 'pl-PL' };
        const date = new Date(tx.date).toLocaleDateString(localeMap[language]);
        const title = `"${tx.title.replace(/"/g, '""')}"`;
        const amount = tx.amount.toString().replace('.', ','); 
        const originalAmount = tx.originalAmount ? tx.originalAmount.toString().replace('.', ',') : '';
        
        return [
          date,
          title,
          tx.category,
          tx.type === 'INCOME' ? t.history.income : t.history.expense,
          amount,
          originalAmount,
          tx.originalCurrency || ''
        ].join(';');
      })
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id: string) => {
      triggerHaptic('medium');
      showConfirm(t.history.delete + '?', (confirmed) => {
          if (confirmed) {
              onDelete(id);
              triggerNotification('success');
          }
      });
  };

  // Group transactions by Date
  const groupedTransactions = useMemo(() => {
      const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const groups: Record<string, Transaction[]> = {};
      const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterday = yesterdayDate.toLocaleDateString('en-CA');

      sorted.forEach(t => {
          const tDate = new Date(t.date);
          const dateKey = tDate.toLocaleDateString('en-CA');
          
          let displayLabel = tDate.toLocaleDateString(
              language === 'ru' ? 'ru-RU' : language === 'pl' ? 'pl-PL' : 'en-US', 
              { day: 'numeric', month: 'long', weekday: 'short' }
          );

          if (dateKey === today) {
              displayLabel = language === 'ru' ? 'Сегодня' : language === 'pl' ? 'Dzisiaj' : 'Today';
          } else if (dateKey === yesterday) {
              displayLabel = language === 'ru' ? 'Вчера' : language === 'pl' ? 'Wczoraj' : 'Yesterday';
          }

          if (!groups[displayLabel]) {
              groups[displayLabel] = [];
          }
          groups[displayLabel].push(t);
      });
      return groups;
  }, [transactions, language]);

  return (
    <div className="pb-28 animate-fade-in">
      <div className="flex items-center justify-between mb-6 pt-2">
        <h2 className="text-xl font-bold text-white">{t.history.title}</h2>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={handleExportCSV}
                disabled={transactions.length === 0}
                className="p-2 bg-slate-800 text-slate-400 rounded-lg border border-slate-700 hover:text-white hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
            >
                <Download size={18} />
            </button>
            <span className="text-xs bg-slate-800 text-slate-400 px-3 py-2 rounded-lg border border-slate-700">
                {transactions.length}
            </span>
        </div>
      </div>
      
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
              <Globe size={24} className="opacity-20" />
          </div>
          <p className="font-medium">{t.history.empty}</p>
          <p className="text-xs opacity-60 mt-1">{t.history.emptySub}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([dateLabel, groupT]) => (
            <div key={dateLabel}>
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Calendar size={12} className="text-violet-400" />
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{dateLabel}</h3>
                </div>
                <div className="space-y-2.5">
                    {(groupT as Transaction[]).map((tItem) => {
                        const { icon: Icon, color, text } = getCategoryDetails(tItem.category);
                        const isIncome = tItem.type === TransactionType.INCOME;
                        const hasOriginal = tItem.originalCurrency && tItem.originalCurrency !== Currency.PLN;

                        return (
                            <div 
                            key={tItem.id} 
                            className="glass-card rounded-2xl p-4 flex items-center justify-between group transition-all hover:bg-white/5 active:scale-[0.98] touch-manipulation"
                            onClick={() => triggerHaptic('light')}
                            >
                            <div className="flex items-center space-x-4 overflow-hidden">
                                <div className={`w-12 h-12 rounded-2xl flex shrink-0 items-center justify-center shadow-lg ${color} ${text}`}>
                                    <Icon size={20} />
                                </div>
                                <div className="min-w-0">
                                <h4 className="font-semibold text-white text-sm truncate">{tItem.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/5 whitespace-nowrap">
                                        {tItem.category}
                                    </span>
                                </div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end shrink-0 ml-2">
                                <p className={`font-bold text-base ${
                                isIncome ? 'text-emerald-400' : 'text-white'
                                }`}>
                                {isIncome ? '+' : '-'}{tItem.amount} <span className="text-sm font-normal opacity-70">{CurrencySymbols[Currency.PLN]}</span>
                                </p>
                                {hasOriginal && (
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        ≈ {tItem.originalAmount} {tItem.originalCurrency && CurrencySymbols[tItem.originalCurrency]}
                                    </p>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleDelete(tItem.id); }}
                                    className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded mt-1.5 transition-colors active:bg-rose-500/20"
                                >
                                    {t.history.delete}
                                </button>
                            </div>
                            </div>
                        );
                    })}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});