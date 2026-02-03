import { Currency } from "../types";

const APP_ID = typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENEXCHANGERATES_APP_ID
  ? String(import.meta.env.VITE_OPENEXCHANGERATES_APP_ID).trim()
  : "";

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour (free tier: daily updates)

// Demo fallback when API is unavailable or no key
const DEMO_TO_PLN: Record<Currency, number> = {
  [Currency.PLN]: 1.0,
  [Currency.USD]: 3.98,
  [Currency.EUR]: 4.32,
  [Currency.GBP]: 5.05,
  [Currency.CHF]: 4.52,
  [Currency.NOK]: 0.36,
  [Currency.SEK]: 0.38,
  [Currency.DKK]: 0.58,
  [Currency.JPY]: 0.027,
  [Currency.CNY]: 0.55,
  [Currency.BYN]: 1.22,
  [Currency.RUB]: 0.043,
  [Currency.TRY]: 0.12,
  [Currency.UAH]: 0.098,
  [Currency.KZT]: 0.0088,
};

const DEMO_EXCHANGE_RATES: Record<Currency, number> = {
  [Currency.PLN]: 1.0,
  [Currency.USD]: 0.25,
  [Currency.EUR]: 0.23,
  [Currency.GBP]: 0.198,
  [Currency.CHF]: 0.22,
  [Currency.NOK]: 2.75,
  [Currency.SEK]: 2.65,
  [Currency.DKK]: 1.74,
  [Currency.JPY]: 37.5,
  [Currency.CNY]: 1.81,
  [Currency.BYN]: 0.82,
  [Currency.RUB]: 23.5,
  [Currency.TRY]: 8.2,
  [Currency.UAH]: 10.1,
  [Currency.KZT]: 112.5,
};

type CachedRates = {
  toPln: Record<Currency, number>;
  exchangeRates: Record<Currency, number>;
  timestamp: number;
};

let cached: CachedRates | null = null;
let fetchPromise: Promise<void> | null = null;

const CURRENCY_CODES = Object.values(Currency) as string[];

function buildRatesFromUsdRates(ratesUsd: Record<string, number>): CachedRates {
  const plnPerUsd = ratesUsd["PLN"];
  if (!plnPerUsd || plnPerUsd <= 0) {
    return { toPln: DEMO_TO_PLN, exchangeRates: DEMO_EXCHANGE_RATES, timestamp: Date.now() };
  }
  const toPln: Record<Currency, number> = { ...DEMO_TO_PLN };
  const exchangeRates: Record<Currency, number> = { ...DEMO_EXCHANGE_RATES };
  for (const code of CURRENCY_CODES) {
    const perUsd = ratesUsd[code];
    if (perUsd != null && perUsd > 0) {
      toPln[code as Currency] = plnPerUsd / perUsd;
      exchangeRates[code as Currency] = perUsd / plnPerUsd;
    }
  }
  return { toPln, exchangeRates, timestamp: Date.now() };
}

function getRates(): CachedRates {
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached;
  }
  return {
    toPln: DEMO_TO_PLN,
    exchangeRates: DEMO_EXCHANGE_RATES,
    timestamp: 0,
  };
}

export function isUsingLiveRates(): boolean {
  return cached != null && Date.now() - cached.timestamp < CACHE_TTL_MS;
}

export async function fetchExchangeRates(onLoaded?: () => void): Promise<void> {
  if (!APP_ID) {
    onLoaded?.();
    return;
  }
  if (fetchPromise) {
    await fetchPromise;
    onLoaded?.();
    return;
  }
  fetchPromise = (async () => {
    try {
      const url = `https://openexchangerates.org/api/latest.json?app_id=${encodeURIComponent(APP_ID)}&symbols=${CURRENCY_CODES.join(",")}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const ratesUsd = data?.rates as Record<string, number> | undefined;
      if (!ratesUsd || typeof ratesUsd !== "object") throw new Error("Invalid response");
      cached = buildRatesFromUsdRates(ratesUsd);
    } catch (e) {
      console.warn("Open Exchange Rates fetch failed, using demo rates:", e);
      cached = null;
    } finally {
      fetchPromise = null;
      onLoaded?.();
    }
  })();
  await fetchPromise;
}

export const convertToPLN = (amount: number, fromCurrency: Currency): number => {
  const { toPln } = getRates();
  const rate = toPln[fromCurrency];
  return parseFloat((amount * rate).toFixed(2));
};

export const convertCurrency = (amount: number, from: Currency, to: Currency): number => {
  if (from === to) return amount;
  const { toPln, exchangeRates } = getRates();
  const inPLN = amount * toPln[from];
  const targetRate = exchangeRates[to];
  return parseFloat((inPLN * targetRate).toFixed(2));
};

export const getRateDisplay = (currency: Currency): string => {
  const { toPln } = getRates();
  if (currency === Currency.PLN) return "1 PLN = 1 PLN";
  return `1 ${currency} ≈ ${toPln[currency]} PLN`;
};

export const getRateSourceInfo = (): string => {
  return isUsingLiveRates() ? "Open Exchange Rates" : "Demo Data (Avg. Market)";
};
