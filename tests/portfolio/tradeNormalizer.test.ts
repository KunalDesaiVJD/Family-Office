import { describe, it, expect } from "vitest";
import { normalizeTrades, validateImportedTrade } from "@/lib/portfolio/tradeNormalizer";
import { imported } from "./factory";

describe("normalizeTrades", () => {
  it("sorts by tradeDateTime, maps side, computes charges and net amount", () => {
    const trades = normalizeTrades([
      imported({ tradeId: "S1", tradeDateTime: "2025-02-01T09:30:00+05:30", buySell: "sell", quantity: 10, price: 150, brokerage: 5, stt: 3, gst: 2 }),
      imported({ tradeId: "B1", tradeDateTime: "2025-01-01T09:30:00+05:30", buySell: "buy", quantity: 10, price: 100, brokerage: 5, stt: 3, gst: 2 }),
    ]);
    expect(trades[0].tradeId).toBe("B1"); // earlier date first
    expect(trades[0].transactionType).toBe("BUY");
    expect(trades[1].transactionType).toBe("SELL");

    const buy = trades[0];
    expect(buy.totalCharges).toBe(10);
    expect(buy.grossAmount).toBe(1000);
    expect(buy.netAmount).toBe(1010); // buy: gross + charges

    const sell = trades[1];
    expect(sell.netAmount).toBe(1490); // sell: gross - charges
  });
});

describe("validateImportedTrade", () => {
  it("errors on missing required fields and non-positive quantity", () => {
    const errors = validateImportedTrade(
      imported({ tradeId: "", tradeDateTime: "2025-01-01T09:30:00+05:30", buySell: "BUY", quantity: 0, price: 100, rawRowReference: "r1" }),
    );
    const codes = errors.filter((e) => e.severity === "error");
    expect(codes.some((e) => e.field === "tradeId")).toBe(true);
    expect(codes.some((e) => e.field === "quantity")).toBe(true);
  });

  it("warns when isin is missing but does not error", () => {
    const errors = validateImportedTrade(
      imported({ tradeId: "T1", tradeDateTime: "2025-01-01T09:30:00+05:30", buySell: "BUY", quantity: 10, price: 100, isin: undefined }),
    );
    expect(errors.some((e) => e.field === "isin" && e.severity === "warning")).toBe(true);
    expect(errors.some((e) => e.severity === "error")).toBe(false);
  });
});
