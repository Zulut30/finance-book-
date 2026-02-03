import crypto from "crypto";

/**
 * Validate Telegram Mini App initData (see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app).
 * Returns parsed user id if valid, otherwise null.
 */
export function validateInitData(initData: string, botToken: string): { id: number } | null {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (computedHash !== hash) return null;
  const authDate = params.get("auth_date");
  if (authDate != null && authDate !== "") {
    const parsed = parseInt(authDate, 10);
    const age = Math.floor(Date.now() / 1000) - parsed;
    if (Number.isNaN(age) || age < 0 || age > 86400) return null; // invalid or older than 24h
  }
  const userStr = params.get("user");
  if (!userStr) return null;
  try {
    const user = JSON.parse(userStr) as { id?: number };
    if (typeof user?.id !== "number") return null;
    return { id: user.id };
  } catch {
    return null;
  }
}
