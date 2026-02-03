import type { VercelRequest, VercelResponse } from "@vercel/node";

export const config = { runtime: "nodejs" };

const WELCOME_RU =
  "Привет! 👋\n\nЯ бот FinTrack — умный учёт финансов и подписок.\n\nОткрой приложение по кнопке меню ниже, чтобы вести расходы, следить за подписками и получать напоминания об оплате.\n\nРазработано командой Manacost.";
const WELCOME_EN =
  "Hi! 👋\n\nI'm FinTrack bot — smart finance and subscription tracker.\n\nOpen the app from the menu button below to track expenses, manage subscriptions and get payment reminders.\n\nDeveloped by Manacost team.";
const WELCOME_PL =
  "Cześć! 👋\n\nJestem botem FinTrack — inteligentny tracker finansów i subskrypcji.\n\nOtwórz aplikację przyciskiem menu poniżej, aby śledzić wydatki i subskrypcje oraz otrzymywać przypomnienia o płatnościach.\n\nOpracowane przez zespół Manacost.";

function chooseWelcome(lang?: string): string {
  if (!lang) return WELCOME_EN;
  const code = lang.slice(0, 2).toLowerCase();
  if (code === "ru") return WELCOME_RU;
  if (code === "pl") return WELCOME_PL;
  return WELCOME_EN;
}

function parseBody(raw: unknown): { message?: { chat?: { id?: number }; text?: string; from?: { language_code?: string } } } | null {
  if (raw == null) return null;
  if (typeof raw === "object" && "message" in (raw as object)) return raw as { message?: { chat?: { id?: number }; text?: string; from?: { language_code?: string } } };
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === "object" ? (parsed as { message?: { chat?: { id?: number }; text?: string; from?: { language_code?: string } } }) : null;
    } catch {
      return null;
    }
  }
  return null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return res.status(500).json({ error: "TELEGRAM_BOT_TOKEN not set" });
  }
  const body = parseBody(req.body);
  const chatId = body?.message?.chat?.id;
  const text = (body?.message?.text ?? "").trim();
  const lang = body?.message?.from?.language_code;

  if (chatId == null) {
    return res.status(200).send("ok");
  }

  if (text === "/start" || text.startsWith("/start ")) {
    const welcome = chooseWelcome(lang);
    try {
      const sendRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: welcome }),
      });
      if (!sendRes.ok) {
        const errText = await sendRes.text();
        console.error("Telegram sendMessage failed:", sendRes.status, errText);
      }
    } catch (e) {
      console.error("Telegram sendMessage error:", e);
    }
  }

  return res.status(200).send("ok");
}
