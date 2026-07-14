import { describe, it, expect } from "vitest";
import {
  compareBrokerHoldingWithInternalLedger,
  compareTradeBookWithImportedTrades,
  runHoldingReconciliation,
  type ReconContext,
  type TradeLike,
} from "@/lib/portfolio/reconciliationEngine";
import { detectDuplicates, duplicateKey } from "@/lib/portfolio/tradeNormalizer";
import type { BrokerHolding, HoldingRow } from "@/lib/portfolio/types";
import { imported } from "./factory";

const ctx: ReconContext = {
  runId: "run_test",
  tenantId: "tnt_test",
  now: "2026-07-13T10:00:00+05:30",
};

const internal: HoldingRow[] = [
  {
    tenantId: "tnt_test",
    brokerAccountId: "bacc_1",
    clientCode: "CLIENT1",
    isin: "INTEST0001",
    tradingSymbol: "TEST",
    quantity: 100,
    avgCost: 100,
    investedValue: 10_000,
    priceStatus: "priced",
  },
];

describe("broker holding reconciliation", () => {
  const broker: BrokerHolding[] = [
    { tenantId: "tnt_test", brokerAccountId: "bacc_1", clientCode: "CLIENT1", isin: "INTEST0001", tradingSymbol: "TEST", quantity: 90 },
  ];

  it("compares quantity and flags a mismatch", () => {
    const cmp = compareBrokerHoldingWithInternalLedger(broker, internal);
    expect(cmp).toHaveLength(1);
    expect(cmp[0].match).toBe(false);
    expect(cmp[0].brokerQuantity).toBe(90);
    expect(cmp[0].internalQuantity).toBe(100);
    expect(cmp[0].difference).toBe(-10);
  });

  it("creates a HOLDING_QUANTITY_MISMATCH exception", () => {
    const { exceptions, run } = runHoldingReconciliation(broker, internal, ctx);
    expect(exceptions).toHaveLength(1);
    expect(exceptions[0].exceptionType).toBe("HOLDING_QUANTITY_MISMATCH");
    expect(exceptions[0].differenceType).toBe("quantity");
    expect(run.exceptionCount).toBe(1);
  });

  it("no exception when quantities agree", () => {
    const { exceptions } = runHoldingReconciliation(
      [{ ...broker[0], quantity: 100 }],
      internal,
      ctx,
    );
    expect(exceptions).toHaveLength(0);
  });
});

describe("trade book vs imported trades", () => {
  const api: TradeLike[] = [
    { tenantId: "tnt_test", brokerAccountId: "bacc_1", clientCode: "CLIENT1", tradeId: "T1", orderId: "O1", tradingSymbol: "TEST", isin: "INTEST0001", quantity: 10, price: 100 },
    { tenantId: "tnt_test", brokerAccountId: "bacc_1", clientCode: "CLIENT1", tradeId: "T2", orderId: "O2", tradingSymbol: "TEST", isin: "INTEST0001", quantity: 5, price: 120 },
  ];

  it("detects a trade missing from the import", () => {
    const importedTrades = [api[0]]; // T2 not imported
    const { missing } = compareTradeBookWithImportedTrades(api, importedTrades);
    expect(missing).toHaveLength(1);
    expect(missing[0].tradeId).toBe("T2");
  });

  it("detects a value mismatch", () => {
    const importedTrades: TradeLike[] = [api[0], { ...api[1], price: 130 }];
    const { mismatched } = compareTradeBookWithImportedTrades(api, importedTrades);
    expect(mismatched).toHaveLength(1);
    expect(mismatched[0].tradeId).toBe("T2");
  });
});

describe("duplicate trade detection", () => {
  it("same clientCode+orderId+tradeId+tradeDateTime is a duplicate", () => {
    const a = imported({ tradeId: "T1", orderId: "O1", tradeDateTime: "2026-01-01T09:30:00+05:30", buySell: "BUY", quantity: 10, price: 100, rawRowReference: "r1" });
    const b = imported({ tradeId: "T1", orderId: "O1", tradeDateTime: "2026-01-01T09:30:00+05:30", buySell: "BUY", quantity: 10, price: 100, rawRowReference: "r2" });
    expect(duplicateKey(a)).toBe(duplicateKey(b));

    const dupes = detectDuplicates([a, b]);
    expect(dupes.has("r2")).toBe(true);
    expect(dupes.has("r1")).toBe(false);
  });

  it("distinct trades are not duplicates", () => {
    const a = imported({ tradeId: "T1", tradeDateTime: "2026-01-01T09:30:00+05:30", buySell: "BUY", quantity: 10, price: 100, rawRowReference: "r1" });
    const b = imported({ tradeId: "T2", tradeDateTime: "2026-01-02T09:30:00+05:30", buySell: "BUY", quantity: 10, price: 100, rawRowReference: "r2" });
    expect(detectDuplicates([a, b]).size).toBe(0);
  });
});
