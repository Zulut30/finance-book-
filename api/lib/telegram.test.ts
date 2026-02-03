import crypto from "crypto";
import { describe, it, expect } from "vitest";
import { validateInitData } from "./telegram";

const BOT_TOKEN = "test-bot-token-123";

function buildValidInitData(userId: number, authDateSeconds?: number): string {
  const authDate = String(authDateSeconds ?? Math.floor(Date.now() / 1000));
  const user = JSON.stringify({ id: userId });
  const params = new URLSearchParams();
  params.set("auth_date", authDate);
  params.set("user", user);
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  params.set("hash", hash);
  return params.toString();
}

describe("validateInitData", () => {
  it("returns null for empty initData", () => {
    expect(validateInitData("", BOT_TOKEN)).toBeNull();
    expect(validateInitData("", "")).toBeNull();
  });

  it("returns null when bot token is empty", () => {
    const valid = buildValidInitData(123);
    expect(validateInitData(valid, "")).toBeNull();
  });

  it("returns null when hash is missing", () => {
    expect(validateInitData("user=%7B%22id%22%3A123%7D&auth_date=123", BOT_TOKEN)).toBeNull();
  });

  it("returns null for wrong hash", () => {
    const valid = buildValidInitData(123);
    const tampered = valid.replace(/hash=[^&]+/, "hash=wrong");
    expect(validateInitData(tampered, BOT_TOKEN)).toBeNull();
  });

  it("returns null for expired auth_date (older than 24h)", () => {
    const oldDate = Math.floor(Date.now() / 1000) - 86401;
    const initData = buildValidInitData(456, oldDate);
    expect(validateInitData(initData, BOT_TOKEN)).toBeNull();
  });

  it("returns null for invalid auth_date", () => {
    const user = JSON.stringify({ id: 789 });
    const params = new URLSearchParams();
    params.set("auth_date", "not-a-number");
    params.set("user", user);
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
    const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    params.set("hash", hash);
    const initData = params.toString();
    expect(validateInitData(initData, BOT_TOKEN)).toBeNull();
  });

  it("returns null when user is missing", () => {
    const params = new URLSearchParams();
    params.set("auth_date", String(Math.floor(Date.now() / 1000)));
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
    const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    params.set("hash", hash);
    expect(validateInitData(params.toString(), BOT_TOKEN)).toBeNull();
  });

  it("returns user id when initData is valid", () => {
    const initData = buildValidInitData(12345);
    const result = validateInitData(initData, BOT_TOKEN);
    expect(result).toEqual({ id: 12345 });
  });

  it("returns null for wrong bot token", () => {
    const initData = buildValidInitData(111);
    expect(validateInitData(initData, "other-bot-token")).toBeNull();
  });
});
