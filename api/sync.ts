import type { VercelRequest, VercelResponse } from "@vercel/node";
import { validateInitData } from "./lib/telegram";
import { setUserSubscriptions } from "./lib/storage";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: "Server: TELEGRAM_BOT_TOKEN not set" });
  }
  const { initData, subscriptions } = req.body as { initData?: string; subscriptions?: Subscription[] };
  if (!initData || !Array.isArray(subscriptions)) {
    return res.status(400).json({ error: "initData and subscriptions (array) required" });
  }
  const user = validateInitData(initData, botToken);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired initData" });
  }
  const activeOnly = subscriptions.filter((s) => s && s.isActive);
  await setUserSubscriptions(user.id, activeOnly);
  return res.status(200).json({ ok: true });
}
