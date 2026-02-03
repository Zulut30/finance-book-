/**
 * Storage for user subscriptions.
 * - If KV_REST_API_* env is set: uses Upstash Redis (persistent).
 * - Else: in-memory Map with max size cap to avoid unbounded growth (resets on cold start).
 */
const MAX_MEMORY_KEYS = 5000;
const memory = new Map<string, string>();

function memoryEvictOldest(): void {
  if (memory.size <= MAX_MEMORY_KEYS) return;
  const keysToDelete = Array.from(memory.keys()).slice(0, memory.size - MAX_MEMORY_KEYS);
  keysToDelete.forEach((k) => memory.delete(k));
}

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

export interface UserData {
  transactions: unknown[];
  subscriptions: unknown[];
  wishes: unknown[];
  language?: string;
  baseCurrency?: string;
  updatedAt: string;
}

export async function getUserData(telegramId: number): Promise<UserData | null> {
  const key = `user:${telegramId}`;
  const raw = kv ? await kv.get(key) : memory.get(key) ?? null;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserData;
    if (!parsed || typeof parsed !== "object") return null;
    return {
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [],
      wishes: Array.isArray(parsed.wishes) ? parsed.wishes : [],
      language: typeof parsed.language === "string" ? parsed.language : undefined,
      baseCurrency: typeof parsed.baseCurrency === "string" ? parsed.baseCurrency : undefined,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function setUserData(telegramId: number, data: Omit<UserData, "updatedAt"> & { updatedAt?: string }): Promise<void> {
  const key = `user:${telegramId}`;
  const value = JSON.stringify({ ...data, updatedAt: data.updatedAt ?? new Date().toISOString() });
  if (kv) {
    await kv.set(key, value);
  } else {
    memory.set(key, value);
    memoryEvictOldest();
  }
}

export async function getUserSubscriptions(telegramId: number): Promise<{ subscriptions: unknown[]; updatedAt: string } | null> {
  const data = await getUserData(telegramId);
  return data ? { subscriptions: data.subscriptions, updatedAt: data.updatedAt } : null;
}

export async function setUserSubscriptions(telegramId: number, subscriptions: unknown[]): Promise<void> {
  const data = await getUserData(telegramId);
  await setUserData(telegramId, {
    transactions: data?.transactions ?? [],
    subscriptions,
    wishes: data?.wishes ?? [],
    updatedAt: new Date().toISOString(),
  });
}

export async function getAllUserKeys(): Promise<string[]> {
  if (kv) return kv.keys("user:*");
  return Array.from(memory.keys()).filter((k) => k.startsWith("user:"));
}

export async function getSubscriptionsByKey(key: string): Promise<{ subscriptions: unknown[]; updatedAt: string } | null> {
  const raw = kv ? await kv.get(key) : memory.get(key) ?? null;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserData;
    return parsed ? { subscriptions: Array.isArray(parsed.subscriptions) ? parsed.subscriptions : [], updatedAt: parsed.updatedAt || "" } : null;
  } catch {
    return null;
  }
}

export function parseTelegramIdFromKey(key: string): number | null {
  if (!key.startsWith("user:")) return null;
  const id = parseInt(key.slice(5), 10);
  return Number.isNaN(id) ? null : id;
}
