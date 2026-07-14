import { describe, it, expect } from "vitest";
import { buildFifoLots, calculateOpenQuantity } from "@/lib/portfolio/fifoEngine";
import { normalizeTrades } from "@/lib/portfolio/tradeNormalizer";
import { imported } from "./factory";

describe("FIFO engine", () => {
  it("simple case: buy 100, sell 40 → open quantity 60", () => {
    const trades = normalizeTrades([
      imported({ tradeId: "B1", tradeDateTime: "2025-01-01T09:30:00+05:30", buySell: "BUY", quantity: 100, price: 100 }),
      imported({ tradeId: "S1", tradeDateTime: "2025-02-01T09:30:00+05:30", buySell: "SELL", quantity: 40, price: 150 }),
    ]);
    const { openLots, closedLots } = buildFifoLots(trades);
    const openQty = openLots.reduce((s, l) => s + l.remainingQuantity, 0);
    expect(openQty).toBe(60);
    expect(closedLots).toHaveLength(1);
    expect(closedLots[0].quantitySold).toBe(40);
    expect(calculateOpenQuantity(trades)[0].quantity).toBe(60);
  });

  it("multiple buy lots: buy 100@100, buy 100@120, sell 150 → 100 from lot 1 + 50 from lot 2", () => {
    const trades = normalizeTrades([
      imported({ tradeId: "B1", tradeDateTime: "2025-01-01T09:30:00+05:30", buySell: "BUY", quantity: 100, price: 100 }),
      imported({ tradeId: "B2", tradeDateTime: "2025-02-01T09:30:00+05:30", buySell: "BUY", quantity: 100, price: 120 }),
      imported({ tradeId: "S1", tradeDateTime: "2025-03-01T09:30:00+05:30", buySell: "SELL", quantity: 150, price: 150 }),
    ]);
    const { openLots, closedLots } = buildFifoLots(trades);
    expect(closedLots).toHaveLength(2);
    expect(closedLots[0].buyTradeId).toBe("B1");
    expect(closedLots[0].quantitySold).toBe(100);
    expect(closedLots[1].buyTradeId).toBe("B2");
    expect(closedLots[1].quantitySold).toBe(50);
    expect(openLots).toHaveLength(1);
    expect(openLots[0].remainingQuantity).toBe(50);
    expect(openLots[0].buyPrice).toBe(120);
  });

  it("sell exceeds holding → creates a FIFO exception", () => {
    const trades = normalizeTrades([
      imported({ tradeId: "B1", tradeDateTime: "2025-01-01T09:30:00+05:30", buySell: "BUY", quantity: 100, price: 100 }),
      imported({ tradeId: "S1", tradeDateTime: "2025-02-01T09:30:00+05:30", buySell: "SELL", quantity: 150, price: 150 }),
    ]);
    const { exceptions, closedLots, openLots } = buildFifoLots(trades);
    expect(exceptions).toHaveLength(1);
    expect(exceptions[0].oversoldQuantity).toBe(50);
    expect(closedLots[0].quantitySold).toBe(100);
    expect(openLots).toHaveLength(0);
  });

  it("does not mutate the input trades", () => {
    const input = normalizeTrades([
      imported({ tradeId: "B1", tradeDateTime: "2025-01-01T09:30:00+05:30", buySell: "BUY", quantity: 100, price: 100 }),
      imported({ tradeId: "S1", tradeDateTime: "2025-02-01T09:30:00+05:30", buySell: "SELL", quantity: 40, price: 150 }),
    ]);
    const snapshot = JSON.stringify(input);
    buildFifoLots(input);
    expect(JSON.stringify(input)).toBe(snapshot);
  });
});
