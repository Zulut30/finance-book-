
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE'
}

export type Language = 'ru' | 'en' | 'pl';

export enum Currency {
  PLN = 'PLN', // Złoty
  USD = 'USD', // Dollar
  EUR = 'EUR', // Euro
  GBP = 'GBP', // Pound
  CHF = 'CHF', // Franc
  NOK = 'NOK', // Norwegian Krone
  SEK = 'SEK', // Swedish Krona
  DKK = 'DKK', // Danish Krone
  JPY = 'JPY', // Yen
  CNY = 'CNY', // Yuan
  BYN = 'BYN', // Belarusian Ruble
  RUB = 'RUB', // Ruble
  TRY = 'TRY', // Lira
  UAH = 'UAH', // Hryvnia
  KZT = 'KZT'  // Tenge
}

// Helper for display symbols
export const CurrencySymbols: Record<Currency, string> = {
  [Currency.PLN]: 'zł',
  [Currency.USD]: '$',
  [Currency.EUR]: '€',
  [Currency.GBP]: '£',
  [Currency.CHF]: 'Fr',
  [Currency.NOK]: 'kr',
  [Currency.SEK]: 'kr',
  [Currency.DKK]: 'kr',
  [Currency.JPY]: '¥',
  [Currency.CNY]: '¥',
  [Currency.BYN]: 'Br',
  [Currency.RUB]: '₽',
  [Currency.TRY]: '₺',
  [Currency.UAH]: '₴',
  [Currency.KZT]: '₸'
};

export const CurrencyFlags: Record<Currency, string> = {
  [Currency.PLN]: '🇵🇱',
  [Currency.USD]: '🇺🇸',
  [Currency.EUR]: '🇪🇺',
  [Currency.GBP]: '🇬🇧',
  [Currency.CHF]: '🇨🇭',
  [Currency.NOK]: '🇳🇴',
  [Currency.SEK]: '🇸🇪',
  [Currency.DKK]: '🇩🇰',
  [Currency.JPY]: '🇯🇵',
  [Currency.CNY]: '🇨🇳',
  [Currency.BYN]: '🇧🇾',
  [Currency.RUB]: '🇷🇺',
  [Currency.TRY]: '🇹🇷',
  [Currency.UAH]: '🇺🇦',
  [Currency.KZT]: '🇰🇿'
};

export interface Transaction {
  id: string;
  title: string;
  amount: number; // Stored in PLN
  originalAmount?: number; // Stored in input currency
  originalCurrency?: Currency; // The currency used for input
  type: TransactionType;
  category: string;
  date: string; // ISO string
}

export interface Subscription {
  id: string;
  name: string;
  price: number; // Assumed PLN for simplicity or base currency
  billingDate: number; // Day of month (1-31)
  isActive: boolean;
  color: string;
  notify?: boolean; // Notification enabled
}

export interface Wish {
  id: string;
  title: string;
  price: number;
  url?: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export type TabView = 'dashboard' | 'transactions' | 'add' | 'subscriptions' | 'wishlist' | 'converter';

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          onClick: (cb: () => void) => void;
          offClick: (cb: () => void) => void;
        };
        showPopup: (params: { title?: string; message: string; buttons?: any[] }, callback?: (buttonId: string) => void) => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        isExpanded: boolean;
        isVersionAtLeast: (version: string) => boolean;
        viewportHeight: number;
        initDataUnsafe: any;
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
      }
    }
  }
}
