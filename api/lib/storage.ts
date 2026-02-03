/**
 * Storage for user subscriptions. Uses Vercel KV if env is set, else in-memory (resets on cold start).
 */

const memory = new Map<string, string>();

// Upstash Redis REST API: POST with body [ "COMMAND", ...args ]
function getKv(): { get: (k: string) => Promise<string | null>; set: (k: string, v: string) => Promise<void>; keys: (pattern: string) => Promise<string[]> } | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  const req = async (cmd: unknown[]) => {
    const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(cmd) });
    if (!res.ok) return null;
    const j = (await res.json()) as { result?: unknown };
    return j.result;
  };
  return {
    async get(k: string) {
      const r = await req(["GET", k]);
      return typeof r === "string" ? r : null;
    },
    async set(k: string, v: string) {
      await req(["SET", k, v]);
    },
    async keys(pattern: string) {
      const r = await req(["KEYS", pattern]);
      return Array.isArray(r) ? r.map(String) : [];
    },
  };
}

const kv = getKv();

export async function getUserSubscriptions(telegramId: number): Promise<{ subscriptions: unknown[]; updatedAt: string } | null> {
  const key = `user:${telegramId}`;
  const raw = kv ? await kv.get(key) : memory.get(key) ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { subscriptions: unknown[]; updatedAt: string };
  } catch {
    return null;
  }
}

export async function setUserSubscriptions(telegramId: number, subscriptions: unknown[]): Promise<void> {
  const key = `user:${telegramId}`;
  const value = JSON.stringify({ subscriptions, updatedAt: new Date().toISOString() });
  if (kv) await kv.set(key, value);
  else memory.set(key, value);
}

export async function getAllUserKeys(): Promise<string[]> {
  if (kv) return kv.keys("user:*");
  return Array.from(memory.keys()).filter((k) => k.startsWith("user:"));
}

export async function getSubscriptionsByKey(key: string): Promise<{ subscriptions: unknown[]; updatedAt: string } | null> {
  const raw = kv ? await kv.get(key) : memory.get(key) ?? null;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { subscriptions: unknown[]; updatedAt: string };
  } catch {
    return null;
  }
}

export function parseTelegramIdFromKey(key: string): number | null {
  if (!key.startsWith("user:")) return null;
  const id = parseInt(key.slice(5), 10);
  return Number.isNaN(id) ? null : id;
}
