import type { VercelRequest, VercelResponse } from "@vercel/node";
import { validateInitData } from "./lib/telegram";
import { setUserData, getUserData } from "./lib/storage";

export const config = { runtime: "nodejs" };

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingDate: number;
  isActive: boolean;
  color: string;
  notify?: boolean;
}

interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  originalAmount?: number;
  originalCurrency?: string;
}

interface Wish {
  id: string;
  title: string;
  price: number;
  isCompleted: boolean;
  createdAt: string;
  url?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: "Server: TELEGRAM_BOT_TOKEN not set" });
  }
  const { initData, transactions, subscriptions, wishes, language, baseCurrency } = req.body as {
    initData?: string;
    transactions?: Transaction[];
    subscriptions?: Subscription[];
    wishes?: Wish[];
    language?: string;
    baseCurrency?: string;
  };
  if (!initData) {
    return res.status(400).json({ error: "initData required" });
  }
  const user = validateInitData(initData, botToken);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired initData" });
  }

  const existing = await getUserData(user.id);
  const nextTransactions = Array.isArray(transactions) ? transactions : (existing?.transactions ?? []);
  const nextSubscriptions = Array.isArray(subscriptions) ? subscriptions : (existing?.subscriptions ?? []);
  const nextWishes = Array.isArray(wishes) ? wishes : (existing?.wishes ?? []);
  const nextLanguage = typeof language === "string" ? language : existing?.language;
  const nextBaseCurrency = typeof baseCurrency === "string" ? baseCurrency : existing?.baseCurrency;

  await setUserData(user.id, {
    transactions: nextTransactions,
    subscriptions: nextSubscriptions,
    wishes: nextWishes,
    language: nextLanguage,
    baseCurrency: nextBaseCurrency,
    updatedAt: new Date().toISOString(),
  });
  return res.status(200).json({ ok: true });
}
