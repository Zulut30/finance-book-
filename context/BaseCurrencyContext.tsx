import React, { createContext, useContext, useState } from 'react';
import { Currency } from '../types';

export const BASE_CURRENCIES: Currency[] = [
  Currency.RUB,
  Currency.BYN,
  Currency.PLN,
  Currency.USD,
  Currency.EUR,
];

const STORAGE_KEY = 'fintrack_base_currency';

function getStoredBaseCurrency(): Currency {
  if (typeof window === 'undefined') return Currency.PLN;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && BASE_CURRENCIES.includes(saved as Currency)) return saved as Currency;
  } catch {}
  return Currency.PLN;
}

interface BaseCurrencyContextType {
  baseCurrency: Currency;
  setBaseCurrency: (c: Currency) => void;
}

const BaseCurrencyContext = createContext<BaseCurrencyContextType | undefined>(undefined);

export const BaseCurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [baseCurrency, setBaseCurrencyState] = useState<Currency>(getStoredBaseCurrency);
  const setBaseCurrency = (c: Currency) => {
    setBaseCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEY, c);
    } catch {}
  };
  return (
    <BaseCurrencyContext.Provider value={{ baseCurrency, setBaseCurrency }}>
      {children}
    </BaseCurrencyContext.Provider>
  );
};

export const useBaseCurrency = () => {
  const ctx = useContext(BaseCurrencyContext);
  if (!ctx) throw new Error('useBaseCurrency must be used within BaseCurrencyProvider');
  return ctx;
};
