import { describe, it, expect } from "vitest";
import { classifyGain, calculateRealisedGain } from "@/lib/portfolio/capitalGains";
import { buildFifoLots } from "@/lib/portfolio/fifoEngine";
import { normalizeTrades } from "@/lib/portfolio/tradeNormalizer";
import { imported } from "./factory";

describe("capital gain classification", () => {
  it("delivery ≤ 365 days is STCG, > 365 days is LTCG", () => {
    expect(classifyGain("DELIVERY", 30)).toBe("STCG");
    expect(classifyGain("DELIVERY", 365)).toBe("STCG");
    expect(classifyGain("DELIVERY", 366)).toBe("LTCG");
    expect(classifyGain("DELIVERY", 800)).toBe("LTCG");
  });

  it("intraday and F&O are tracked separately", () => {
    expect(classifyGain("INTRADAY", 0)).toBe("INTRADAY");
    expect(classifyGain("FNO", 400)).toBe("FNO");
  });

  it("threshold is configurable", () => {
    expect(classifyGain("DELIVERY", 200, { ltcgThresholdDays: 180 })).toBe("LTCG");
  });

  it("a full FIFO run classifies a > 12 month holding as LTCG", () => {
    const trades = normalizeTrades([
      imported({ tradeId: "B1", tradeDateTime: "2024-01-10T09:30:00+05:30", buySell: "BUY", quantity: 100, price: 100 }),
      imported({ tradeId: "S1", tradeDateTime: "2025-06-10T09:30:00+05:30", buySell: "SELL", quantity: 100, price: 150 }),
    ]);
    const { closedLots } = buildFifoLots(trades);
    expect(closedLots[0].gainType).toBe("LTCG");
    expect(closedLots[0].holdingDays).toBeGreaterThan(365);

    const result = calculateRealisedGain(closedLots);
    expect(result.ltcg).toBeGreaterThan(0);
    expect(result.stcg).toBe(0);
    expect(result.closedLotCount).toBe(1);
  });
});
