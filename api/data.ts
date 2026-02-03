import type { VercelRequest, VercelResponse } from "@vercel/node";
import { validateInitData } from "./lib/telegram";
import { getUserData } from "./lib/storage";

export const config = { runtime: "nodejs" };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN not set" });
  }
  const initData = req.method === "POST" ? (req.body?.initData as string) : (req.query?.initData as string);
  if (!initData || typeof initData !== "string") {
    return res.status(400).json({ error: "initData required (POST body or GET query)" });
  }
  const user = validateInitData(initData, botToken);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired initData" });
  }
  const data = await getUserData(user.id);
  if (!data) {
    return res.status(200).json({ transactions: [], subscriptions: [], wishes: [], updatedAt: null, language: null, baseCurrency: null });
  }
  return res.status(200).json({
    transactions: data.transactions,
    subscriptions: data.subscriptions,
    wishes: data.wishes,
    updatedAt: data.updatedAt,
    language: data.language ?? null,
    baseCurrency: data.baseCurrency ?? null,
  });
}
