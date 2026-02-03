import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchExchangeRates } from '../services/currencyService';

interface ExchangeRatesContextValue {
  ratesReady: boolean;
  refreshRates: () => Promise<void>;
}

const ExchangeRatesContext = createContext<ExchangeRatesContextValue>({
  ratesReady: false,
  refreshRates: async () => {},
});

export const useExchangeRates = () => useContext(ExchangeRatesContext);

export const ExchangeRatesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ratesReady, setRatesReady] = useState(false);

  const refreshRates = async () => {
    await fetchExchangeRates(() => setRatesReady(true));
  };

  useEffect(() => {
    fetchExchangeRates(() => setRatesReady(true));
  }, []);

  return (
    <ExchangeRatesContext.Provider value={{ ratesReady, refreshRates }}>
      {children}
    </ExchangeRatesContext.Provider>
  );
};
