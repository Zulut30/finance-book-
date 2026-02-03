import type { Subscription } from "../types";

const API_BASE = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "";

export async function syncSubscriptionsToServer(subscriptions: Subscription[]): Promise<boolean> {
  const initData = typeof window !== "undefined" && (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData;
  if (!initData) return false;
  try {
    const res = await fetch(`${API_BASE}/api/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData, subscriptions }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
