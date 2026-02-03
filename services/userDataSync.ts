import type { Transaction, Subscription, Wish } from "../types";

const API_BASE = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";

export function getInitData(): string | undefined {
  return typeof window !== "undefined" && (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData;
}

/** Wait for initData to appear (e.g. Telegram Desktop injects it slightly later). Resolves with initData or undefined after maxAttempts. */
export function waitForInitData(maxAttempts = 6, intervalMs = 400): Promise<string | undefined> {
  return new Promise((resolve) => {
    const check = (attempt: number) => {
      const data = getInitData();
      if (data) {
        resolve(data);
        return;
      }
      if (attempt >= maxAttempts) {
        resolve(undefined);
        return;
      }
      setTimeout(() => check(attempt + 1), intervalMs);
    };
    check(0);
  });
}

export interface UserDataFromServer {
  transactions: Transaction[];
  subscriptions: Subscription[];
  wishes: Wish[];
  updatedAt: string | null;
  language: string | null;
  baseCurrency: string | null;
}

export async function fetchUserData(): Promise<UserDataFromServer | null> {
  const initData = getInitData();
  if (!initData) return null;
  try {
    const res = await fetch(`${API_BASE}/api/data`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      transactions: Array.isArray(data.transactions) ? data.transactions : [],
      subscriptions: Array.isArray(data.subscriptions) ? data.subscriptions : [],
      wishes: Array.isArray(data.wishes) ? data.wishes : [],
      updatedAt: data.updatedAt ?? null,
      language: data.language ?? null,
      baseCurrency: data.baseCurrency ?? null,
    };
  } catch {
    return null;
  }
}

export async function syncUserData(payload: {
  transactions: Transaction[];
  subscriptions: Subscription[];
  wishes: Wish[];
  language?: string;
  baseCurrency?: string;
}): Promise<boolean> {
  const initData = getInitData();
  if (!initData) return false;
  try {
    const res = await fetch(`${API_BASE}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData,
        transactions: payload.transactions,
        subscriptions: payload.subscriptions,
        wishes: payload.wishes,
        language: payload.language,
        baseCurrency: payload.baseCurrency,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
