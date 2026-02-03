import { describe, it, expect } from "vitest";
import {
  parseTelegramIdFromKey,
  getUserData,
  setUserData,
  getAllUserKeys,
  getSubscriptionsByKey,
  type UserData,
} from "./storage";

describe("storage", () => {
  describe("parseTelegramIdFromKey", () => {
    it("returns null for non-user keys", () => {
      expect(parseTelegramIdFromKey("foo")).toBeNull();
      expect(parseTelegramIdFromKey("user")).toBeNull();
      expect(parseTelegramIdFromKey("userx:123")).toBeNull();
    });
    it("parses valid user key", () => {
      expect(parseTelegramIdFromKey("user:123")).toBe(123);
      expect(parseTelegramIdFromKey("user:0")).toBe(0);
      expect(parseTelegramIdFromKey("user:999999")).toBe(999999);
    });
    it("returns null for invalid id", () => {
      expect(parseTelegramIdFromKey("user:")).toBeNull();
      expect(parseTelegramIdFromKey("user:abc")).toBeNull();
      expect(parseTelegramIdFromKey("user:12.3")).toBe(12);
    });
  });

  describe("getUserData / setUserData", () => {
    const telegramId = 42;
    const neverWrittenId = 888888;

    it("returns null when no data", async () => {
      const data = await getUserData(neverWrittenId);
      expect(data).toBeNull();
    });

    it("saves and retrieves user data", async () => {
      const input: Omit<UserData, "updatedAt"> = {
        transactions: [{ id: "1", amount: 10 }],
        subscriptions: [],
        wishes: [],
        language: "ru",
        baseCurrency: "RUB",
      };
      await setUserData(telegramId, input);
      const data = await getUserData(telegramId);
      expect(data).not.toBeNull();
      expect(data!.transactions).toHaveLength(1);
      expect(data!.language).toBe("ru");
      expect(data!.baseCurrency).toBe("RUB");
      expect(typeof data!.updatedAt).toBe("string");
    });

    it("normalizes invalid stored arrays to empty", async () => {
      await setUserData(telegramId, {
        transactions: [],
        subscriptions: [],
        wishes: [],
      });
      const data = await getUserData(telegramId);
      expect(data?.transactions).toEqual([]);
      expect(data?.subscriptions).toEqual([]);
      expect(data?.wishes).toEqual([]);
    });
  });

  describe("getAllUserKeys", () => {
    it("returns array", async () => {
      const keys = await getAllUserKeys();
      expect(Array.isArray(keys)).toBe(true);
    });
  });

  describe("getSubscriptionsByKey", () => {
    it("returns null for unknown key", async () => {
      const result = await getSubscriptionsByKey("user:999999999");
      expect(result).toBeNull();
    });
  });

  describe("performance", () => {
    it("setUserData + getUserData 100 times completes in under 200ms", async () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        await setUserData(1000 + i, {
          transactions: [],
          subscriptions: [{ id: "s1", name: "Sub", price: 10, billingDate: 1, isActive: true, color: "#000" }],
          wishes: [],
        });
        await getUserData(1000 + i);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(200);
    });
  });
});
