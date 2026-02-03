import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { runtime: "nodejs" };

/**
 * GET /api/status — диагностика без секретов.
 * Показывает, настроены ли TELEGRAM_BOT_TOKEN и Redis; от этого зависят /start и синхронизация.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const hasToken = !!process.env.TELEGRAM_BOT_TOKEN;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  const hasKvEnv = !!(url && token);

  let redisStatus: "missing" | "configured" | "connection_failed" = "missing";
  if (hasKvEnv) {
    try {
      const r = await fetch(url!, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(["PING"]),
      });
      const j = (await r.json()) as { result?: string; error?: string };
      redisStatus = r.ok && (j.result === "PONG" || j.result === "pong") ? "configured" : "connection_failed";
    } catch {
      redisStatus = "connection_failed";
    }
  }

  return res.status(200).json({
    telegramBot: hasToken ? "configured" : "missing TELEGRAM_BOT_TOKEN",
    redis: redisStatus,
    hint_start: hasToken
      ? "Set webhook: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_DOMAIN>/api/webhook"
      : "Add TELEGRAM_BOT_TOKEN in Vercel, then set webhook",
    hint_sync:
      redisStatus === "configured"
        ? "Sync should work when app is opened from Telegram"
        : redisStatus === "connection_failed"
          ? "KV env set but Redis unreachable — check URL and token, redeploy"
          : "Add KV_REST_API_URL and KV_REST_API_TOKEN (Upstash), then redeploy",
  });
}
