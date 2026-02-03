import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  nav: { home: string; history: string; add: string; converter: string; wishlist: string; };
  dashboard: {
    title: string; subtitle: string; balance: string; income: string; expense: string;
    today: string; subscriptions: string; subSubtitle: string; noExpenses: string; noIncome: string;
    chartTitle: string; total: string; others: string; marketRates: string;
  };
  history: { title: string; empty: string; emptySub: string; delete: string; income: string; expense: string; };
  add: {
    title: string; expense: string; income: string; amount: string; desc: string;
    descPlaceholder: string; category: string; save: string;
  };
  subs: {
    title: string; month: string; day: string; notify: string; upcoming: string;
    empty: string; new: string; edit: string; namePlaceholder: string; today: string; inDays: string;
    alertTitle: string; alertMessage: string;
  };
  converter: { title: string; subtitle: string; have: string; get: string; search: string; ratesFor: string; top: string; notFound: string; };
  wishlist: {
    title: string; subtitle: string; total: string; bought: string; empty: string;
    add: string; name: string; price: string; link: string; save: string;
    placeholderName: string; placeholderLink: string; delete: string; share: string;
  };
  categories: {
    // Expense
    food: string; cafe: string; transport: string; housing: string; bills: string;
    health: string; clothes: string; tech: string; games: string; entertainment: string;
    education: string; pets: string; travel: string; beauty: string; charity: string;
    // Income
    salary: string; freelance: string; gift: string; invest: string; rent: string;
    other: string;
  };
}

const translations: Record<Language, Translations> = {
  ru: {
    nav: { home: 'Главная', history: 'История', add: 'Добавить', converter: 'Конвертер', wishlist: 'Желания' },
    dashboard: {
      title: 'Мой Кошелек', subtitle: 'Обзор Финансов', balance: 'Общий Баланс',
      income: 'Доход', expense: 'Расход', today: 'Сегодня',
      subscriptions: 'Подписки', subSubtitle: 'активных', noExpenses: 'Нет расходов в этом месяце', noIncome: 'Нет доходов в этом месяце',
      chartTitle: 'Статистика', total: 'Всего', others: 'др.', marketRates: 'Курсы к Доллару'
    },
    history: { title: 'История Операций', empty: 'Нет транзакций', emptySub: 'Добавьте первую, чтобы начать!', delete: 'Удалить', income: 'Доход', expense: 'Расход' },
    add: {
      title: 'Новая Операция', expense: 'Расход', income: 'Доход', amount: 'Сумма и Валюта',
      desc: 'Описание', descPlaceholder: 'напр. Продукты', category: 'Категория', save: 'Сохранить'
    },
    subs: {
      title: 'Подписки', month: '/ мес', day: 'число', notify: 'Уведомлять за 3 дня',
      upcoming: 'Ближайшие оплаты', empty: 'Нет активных подписок', new: 'Новая Подписка',
      edit: 'Редактировать подписку', namePlaceholder: 'Название (напр. Netflix)',
      today: 'Сегодня!', inDays: 'дн.', alertTitle: '🔔 Напоминание', alertMessage: 'Скоро оплата'
    },
    converter: { title: 'Конвертер Валют', subtitle: 'Мировые курсы валют', have: 'У меня есть', get: 'Я получу', search: 'Поиск...', ratesFor: 'Курсы для', top: 'Топ', notFound: 'Валюта не найдена' },
    wishlist: {
      title: 'Список Желаний', subtitle: 'Мои цели и мечты', total: 'Итого нужно', bought: 'Куплено',
      empty: 'Список желаний пуст', add: 'Добавить Желание', name: 'Название', price: 'Цена (PLN)', link: 'Ссылка на товар',
      save: 'Сохранить', placeholderName: 'напр. Новый iPhone', placeholderLink: 'https://...', delete: 'Удалить', share: 'Поделиться'
    },
    categories: {
      food: 'Продукты', cafe: 'Кафе', transport: 'Транспорт', housing: 'Жилье', bills: 'Счета',
      health: 'Здоровье', clothes: 'Одежда', tech: 'Техника', games: 'Игры', entertainment: 'Развлечения',
      education: 'Образование', pets: 'Питомцы', travel: 'Путешествия', beauty: 'Красота', charity: 'Благотворительность',
      salary: 'Зарплата', freelance: 'Фриланс', gift: 'Подарок', invest: 'Инвестиции', rent: 'Аренда', other: 'Другое'
    }
  },
  en: {
    nav: { home: 'Home', history: 'History', add: 'Add', converter: 'Converter', wishlist: 'Wishes' },
    dashboard: {
      title: 'My Wallet', subtitle: 'Financial Overview', balance: 'Total Balance',
      income: 'Income', expense: 'Expense', today: 'Today',
      subscriptions: 'Subscriptions', subSubtitle: 'active', noExpenses: 'No expenses this month', noIncome: 'No income this month',
      chartTitle: 'Statistics', total: 'Total', others: 'others', marketRates: 'Rates to USD'
    },
    history: { title: 'Transaction History', empty: 'No transactions', emptySub: 'Add your first one to start!', delete: 'Delete', income: 'Income', expense: 'Expense' },
    add: {
      title: 'New Operation', expense: 'Expense', income: 'Income', amount: 'Amount & Currency',
      desc: 'Description', descPlaceholder: 'e.g. Groceries', category: 'Category', save: 'Save'
    },
    subs: {
      title: 'Subscriptions', month: '/ mo', day: 'day', notify: 'Notify 3 days prior',
      upcoming: 'Upcoming payments', empty: 'No active subscriptions', new: 'New Subscription',
      edit: 'Edit Subscription', namePlaceholder: 'Name (e.g. Netflix)',
      today: 'Today!', inDays: 'days', alertTitle: '🔔 Reminder', alertMessage: 'Payment coming up'
    },
    converter: { title: 'Currency Converter', subtitle: 'World exchange rates', have: 'I have', get: 'I get', search: 'Search...', ratesFor: 'Rates for', top: 'Top', notFound: 'Currency not found' },
    wishlist: {
      title: 'My Wishlist', subtitle: 'Dreams and goals', total: 'Total needed', bought: 'Purchased',
      empty: 'Your wishlist is empty', add: 'Add Wish', name: 'Title', price: 'Price (PLN)', link: 'Product Link',
      save: 'Save Wish', placeholderName: 'e.g. New iPhone', placeholderLink: 'https://...', delete: 'Delete', share: 'Share'
    },
    categories: {
      food: 'Groceries', cafe: 'Cafe', transport: 'Transport', housing: 'Housing', bills: 'Bills',
      health: 'Health', clothes: 'Clothes', tech: 'Tech', games: 'Games', entertainment: 'Fun',
      education: 'Education', pets: 'Pets', travel: 'Travel', beauty: 'Beauty', charity: 'Charity',
      salary: 'Salary', freelance: 'Freelance', gift: 'Gift', invest: 'Investments', rent: 'Rent', other: 'Other'
    }
  },
  pl: {
    nav: { home: 'Pulpit', history: 'Historia', add: 'Dodaj', converter: 'Waluty', wishlist: 'Życzenia' },
    dashboard: {
      title: 'Mój Portfel', subtitle: 'Przegląd Finansów', balance: 'Saldo Całkowite',
      income: 'Przychód', expense: 'Wydatki', today: 'Dzisiaj',
      subscriptions: 'Subskrypcje', subSubtitle: 'aktywne', noExpenses: 'Brak wydatków w tym miesiącu', noIncome: 'Brak przychodów w tym miesiącu',
      chartTitle: 'Statystyka', total: 'Razem', others: 'inne', marketRates: 'Kursy do USD'
    },
    history: { title: 'Historia Transakcji', empty: 'Brak transakcji', emptySub: 'Dodaj pierwszą, aby zacząć!', delete: 'Usuń', income: 'Przychód', expense: 'Wydatek' },
    add: {
      title: 'Nowa Operacja', expense: 'Wydatek', income: 'Przychód', amount: 'Kwota i Waluta',
      desc: 'Opis', descPlaceholder: 'np. Zakupy', category: 'Kategoria', save: 'Zapisz'
    },
    subs: {
      title: 'Subskrypcje', month: '/ mies.', day: 'dzień', notify: 'Powiadom 3 dni przed',
      upcoming: 'Nadchodzące płatności', empty: 'Brak aktywnych subskrypcji', new: 'Nowa Subskrypcja',
      edit: 'Edytuj Subskrypcję', namePlaceholder: 'Nazwa (np. Netflix)',
      today: 'Dziś!', inDays: 'dni', alertTitle: '🔔 Przypomnienie', alertMessage: 'Nadchodzi płatność'
    },
    converter: { title: 'Przelicznik Walut', subtitle: 'Kursy światowe', have: 'Mam', get: 'Otrzymam', search: 'Szukaj...', ratesFor: 'Kursy dla', top: 'Top', notFound: 'Nie znaleziono waluty' },
    wishlist: {
      title: 'Lista Życzeń', subtitle: 'Moje cele i marzenia', total: 'Razem potrzeba', bought: 'Kupione',
      empty: 'Lista życzeń jest pusta', add: 'Dodaj Życzenie', name: 'Nazwa', price: 'Cena (PLN)', link: 'Link do produktu',
      save: 'Zapisz', placeholderName: 'np. Nowy iPhone', placeholderLink: 'https://...', delete: 'Usuń', share: 'Udostępnij'
    },
    categories: {
      food: 'Zakupy', cafe: 'Kawiarnia', transport: 'Transport', housing: 'Mieszkanie', bills: 'Rachunki',
      health: 'Zdrowie', clothes: 'Ubrania', tech: 'Sprzęt', games: 'Gry', entertainment: 'Rozrywka',
      education: 'Edukacja', pets: 'Zwierzęta', travel: 'Podróże', beauty: 'Uroda', charity: 'Charytatywność',
      salary: 'Wypłata', freelance: 'Freelance', gift: 'Prezent', invest: 'Inwestycje', rent: 'Wynajem', other: 'Inne'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ru');

  useEffect(() => {
    // Detect language from Telegram or Browser
    let detectedLang: string = 'ru';
    
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
      detectedLang = window.Telegram.WebApp.initDataUnsafe.user.language_code;
    } else {
      detectedLang = navigator.language.split('-')[0];
    }

    if (detectedLang === 'pl') setLanguage('pl');
    else if (detectedLang === 'en') setLanguage('en');
    else setLanguage('ru'); // Default to Russian if not EN or PL
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};