import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getAllUserKeys, getSubscriptionsByKey, parseTelegramIdFromKey } from "../lib/storage";

export const config = { runtime: "nodejs", maxDuration: 60 };

interface Subscription {
  id: string;
  name: string;
  price: number;
  billingDate: number;
  isActive: boolean;
  notify?: boolean;
}

function daysUntilBilling(billingDate: number): number {
  const today = new Date().getDate();
  if (billingDate >= today) return billingDate - today;
  const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  return lastDay - today + billingDate;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN not set" });
  }
  const keys = await getAllUserKeys();
  let sent = 0;
  for (const key of keys) {
    const data = await getSubscriptionsByKey(key);
    if (!data?.subscriptions?.length) continue;
    const telegramId = parseTelegramIdFromKey(key);
    if (telegramId == null) continue;
    const upcoming = (data.subscriptions as Subscription[]).filter((s) => {
      if (!s.isActive || !s.notify) return false;
      const days = daysUntilBilling(s.billingDate);
      return days >= 0 && days <= 3;
    });
    if (upcoming.length === 0) continue;
    const lines = upcoming.map((s) => {
      const days = daysUntilBilling(s.billingDate);
      const when = days === 0 ? "Сегодня" : days === 1 ? "Завтра" : `Через ${days} дн.`;
      return `• ${s.name} — ${s.price} zł (${when})`;
    });
    const text = `🔔 FinTrack: скоро списание подписок\n\n${lines.join("\n")}`;
    try {
      const r = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: telegramId, text }),
      });
      if (r.ok) sent++;
    } catch {
      // skip
    }
  }
  return res.status(200).json({ ok: true, sent });
}
