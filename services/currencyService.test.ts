import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { Currency } from "../types";
import {
  convertToPLN,
  convertCurrency,
  getRateDisplay,
  getRateSourceInfo,
  isUsingLiveRates,
  fetchExchangeRates,
} from "./currencyService";

describe("currencyService", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_OPENEXCHANGERATES_APP_ID", "");
  });
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("convertToPLN", () => {
    it("returns same amount for PLN", () => {
      expect(convertToPLN(100, Currency.PLN)).toBe(100);
    });
    it("converts USD to PLN using demo rate", () => {
      const result = convertToPLN(10, Currency.USD);
      expect(result).toBe(39.8); // 10 * 3.98
    });
    it("converts EUR to PLN", () => {
      const result = convertToPLN(1, Currency.EUR);
      expect(result).toBe(4.32);
    });
    it("rounds to 2 decimal places", () => {
      const result = convertToPLN(1, Currency.RUB);
      expect(result).toBe(0.04);
    });
  });

  describe("convertCurrency", () => {
    it("returns same amount when from === to", () => {
      expect(convertCurrency(50, Currency.PLN, Currency.PLN)).toBe(50);
      expect(convertCurrency(100, Currency.USD, Currency.USD)).toBe(100);
    });
    it("converts between different currencies via PLN", () => {
      const result = convertCurrency(10, Currency.USD, Currency.EUR);
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
      expect(Number.isFinite(result)).toBe(true);
    });
    it("handles zero amount", () => {
      expect(convertCurrency(0, Currency.USD, Currency.PLN)).toBe(0);
    });
  });

  describe("getRateDisplay", () => {
    it("returns 1 PLN = 1 PLN for PLN", () => {
      expect(getRateDisplay(Currency.PLN)).toBe("1 PLN = 1 PLN");
    });
    it("returns rate string for other currencies", () => {
      const s = getRateDisplay(Currency.USD);
      expect(s).toMatch(/^1 USD ≈ [\d.]+ PLN$/);
    });
  });

  describe("getRateSourceInfo", () => {
    it("returns Demo Data when no live rates", () => {
      expect(getRateSourceInfo()).toMatch(/Demo|demo/i);
    });
  });

  describe("isUsingLiveRates", () => {
    it("returns false when no API key (demo)", () => {
      expect(isUsingLiveRates()).toBe(false);
    });
  });

  describe("fetchExchangeRates", () => {
    it("resolves without throwing when no API key", async () => {
      await expect(fetchExchangeRates()).resolves.toBeUndefined();
    });
    it("calls onLoaded callback when provided", async () => {
      const onLoaded = vi.fn();
      await fetchExchangeRates(onLoaded);
      expect(onLoaded).toHaveBeenCalled();
    });
  });

  describe("performance", () => {
    it("convertCurrency completes 10000 iterations in under 500ms", () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        convertCurrency(100, Currency.USD, Currency.EUR);
        convertCurrency(50, Currency.PLN, Currency.RUB);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(500);
    });
    it("convertToPLN completes 10000 iterations in under 200ms", () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        convertToPLN(100, Currency.EUR);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(200);
    });
  });
});
