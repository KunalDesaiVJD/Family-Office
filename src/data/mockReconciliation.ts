import {
  runContractNoteReconciliationPlaceholder,
  runFundsReconciliation,
  runHoldingReconciliation,
  runTallyBrokerLedgerReconciliationPlaceholder,
  runTradeReconciliation,
  type InternalCashBalance,
  type ReconContext,
  type TradeLike,
} from "@/lib/portfolio/reconciliationEngine";
import type {
  BrokerFunds,
  BrokerHolding,
  ReconciliationException,
  ReconciliationRun,
} from "@/lib/portfolio/types";
import { TENANT_ID } from "./tenant";
import { mockLedger, mockNormalizedTrades } from "./mockPortfolio";
import { MOCK_ACCOUNTS, MOCK_ISINS, UNPRICED_ISIN } from "./mockTrades";

// ---------------------------------------------------------------------------
// MOCK ONLY. Reconciliation inputs and the resulting runs/exceptions for the
// V J Desai Family. The engine runs against deliberately-inconsistent mock
// broker data so the Reconciliation Centre shows realistic exceptions.
// ---------------------------------------------------------------------------

const father = MOCK_ACCOUNTS.father;
const fm3 = MOCK_ACCOUNTS.familyMember3;

/**
 * Broker-reported holdings. Mostly agree with the internal ledger, but RELIANCE
 * (Father) and ICICIBANK (Family Member 3) are off by a couple of shares to
 * demonstrate HOLDING_QUANTITY_MISMATCH.
 */
export const mockBrokerHoldings: BrokerHolding[] = mockLedger.accountHoldings.map((h) => {
  let quantity = h.quantity;
  if (h.brokerAccountId === father.brokerAccountId && h.isin === MOCK_ISINS.RELIANCE) {
    quantity += 2; // broker shows 2 more than the internal ledger
  }
  if (h.brokerAccountId === fm3.brokerAccountId && h.isin === MOCK_ISINS.ICICIBANK) {
    quantity -= 2; // broker shows 2 fewer than the internal ledger
  }
  return {
    tenantId: TENANT_ID,
    brokerAccountId: h.brokerAccountId ?? "",
    clientCode: h.clientCode ?? "",
    accountOwner: h.accountOwner,
    isin: h.isin,
    tradingSymbol: h.tradingSymbol,
    quantity,
  };
});

/** Broker funds snapshot; Father's balance is off vs the internal cash ledger. */
export const mockBrokerFunds: BrokerFunds[] = [
  { tenantId: TENANT_ID, brokerAccountId: father.brokerAccountId, clientCode: father.clientCode, balance: 9_000_000 },
  { tenantId: TENANT_ID, brokerAccountId: MOCK_ACCOUNTS.self.brokerAccountId, clientCode: MOCK_ACCOUNTS.self.clientCode, balance: 6_500_000 },
  { tenantId: TENANT_ID, brokerAccountId: fm3.brokerAccountId, clientCode: fm3.clientCode, balance: 1_800_000 },
];

const mockInternalCash: InternalCashBalance[] = [
  { brokerAccountId: father.brokerAccountId, clientCode: father.clientCode, balance: 8_950_000 },
  { brokerAccountId: MOCK_ACCOUNTS.self.brokerAccountId, clientCode: MOCK_ACCOUNTS.self.clientCode, balance: 6_500_000 },
  { brokerAccountId: fm3.brokerAccountId, clientCode: fm3.clientCode, balance: 1_800_000 },
];

// Broker/API trade book: the imported trades, plus one trade that was never
// imported (SUNPHARMA — MISSING_TRADE) and one price that differs from the
// import (ICICIBANK sell — TRADE_VALUE_MISMATCH).
const mockApiTradeBook: TradeLike[] = [
  ...mockNormalizedTrades.map((t) => (t.tradeId === "TRD-M2" ? { ...t, price: 1185 } : t)),
  {
    tenantId: TENANT_ID,
    brokerAccountId: father.brokerAccountId,
    clientCode: father.clientCode,
    accountOwner: father.accountOwner,
    tradeId: "TRD-F-API-9",
    orderId: "ORD-F-API-9",
    tradingSymbol: "SUNPHARMA",
    isin: MOCK_ISINS.SUNPHARMA,
    quantity: 50,
    price: 1050,
  },
];

// Imported trades used for the trade comparison — includes a duplicated
// TRD-F1 to demonstrate DUPLICATE_TRADE.
const duplicated = mockNormalizedTrades.find((t) => t.tradeId === "TRD-F1")!;
const mockImportedForRecon: TradeLike[] = [...mockNormalizedTrades, duplicated];

// Deterministic run contexts (no Date.now — mock timestamps).
const RUN_TIME = "2026-07-13T19:30:00+05:30";
const ctx = (id: string): ReconContext => ({ runId: id, tenantId: TENANT_ID, now: RUN_TIME });

const holdingOutcome = runHoldingReconciliation(
  mockBrokerHoldings,
  mockLedger.accountHoldings,
  ctx("recon_holding_2607"),
);
const tradeOutcome = runTradeReconciliation(
  mockApiTradeBook,
  mockImportedForRecon,
  ctx("recon_trade_2607"),
);
const fundsOutcome = runFundsReconciliation(
  mockBrokerFunds,
  mockInternalCash,
  ctx("recon_funds_2607"),
);
const contractNoteOutcome = runContractNoteReconciliationPlaceholder(
  // Only Family Member 3's June contract note remains unlinked here.
  [
    {
      id: "cnl_2",
      tenantId: TENANT_ID,
      contractNoteNumber: "CN-M-2607",
      brokerAccountId: fm3.brokerAccountId,
      clientCode: fm3.clientCode,
      tradeDate: "2026-07-01",
      status: "pending",
      tradeIds: ["TRD-M2"],
    },
  ],
  ctx("recon_cn_2607"),
);
const tallyOutcome = runTallyBrokerLedgerReconciliationPlaceholder(ctx("recon_tally_2607"));

// A standalone PRICE_MISSING exception for the unpriced ITC holding (Family
// Member 3). No run function produces this — it is surfaced by the ledger.
const priceMissingException: ReconciliationException = {
  id: "recon_price_itc",
  tenantId: TENANT_ID,
  reconciliationRunId: "recon_holding_2607",
  exceptionType: "PRICE_MISSING",
  severity: "Low",
  status: "Waiting for Data",
  entityType: "holding",
  entityId: UNPRICED_ISIN,
  familyMemberId: fm3.familyMemberId,
  accountOwner: fm3.accountOwner,
  brokerAccountId: fm3.brokerAccountId,
  clientCode: fm3.clientCode,
  isin: UNPRICED_ISIN,
  tradingSymbol: "ITC",
  expectedValue: "latest price",
  actualValue: "unavailable",
  differenceType: "missing",
  suggestedReason: "No latest price is available for this ISIN, so unrealised gain cannot be computed.",
  suggestedAction: "Check symbol/ISIN mapping",
  createdAt: RUN_TIME,
  updatedAt: RUN_TIME,
};

// One already-resolved exception so the "Resolved this month" metric is real.
const resolvedExample: ReconciliationException = {
  id: "recon_resolved_1",
  tenantId: TENANT_ID,
  reconciliationRunId: "recon_trade_2606",
  exceptionType: "MISSING_TRADE",
  severity: "Medium",
  status: "Resolved",
  entityType: "trade",
  entityId: "TRD-S-OLD",
  accountOwner: MOCK_ACCOUNTS.self.accountOwner,
  brokerAccountId: MOCK_ACCOUNTS.self.brokerAccountId,
  clientCode: MOCK_ACCOUNTS.self.clientCode,
  tradingSymbol: "INFY",
  expectedValue: "1 trade",
  actualValue: "imported",
  differenceType: "missing",
  suggestedReason: "A June trade was missing from the import and has since been added.",
  suggestedAction: "Import missing trade",
  assignedTo: "Accountant",
  createdAt: "2026-07-05T10:00:00+05:30",
  updatedAt: "2026-07-06T15:00:00+05:30",
  resolvedAt: "2026-07-06T15:00:00+05:30",
  resolutionNote: "Trade re-imported from the corrected Angel statement and matched.",
};

export const mockReconciliationRuns: ReconciliationRun[] = [
  holdingOutcome.run,
  tradeOutcome.run,
  fundsOutcome.run,
  contractNoteOutcome.run,
  tallyOutcome.run,
];

export const mockReconciliationExceptions: ReconciliationException[] = [
  ...holdingOutcome.exceptions,
  ...tradeOutcome.exceptions,
  ...fundsOutcome.exceptions,
  ...contractNoteOutcome.exceptions,
  priceMissingException,
  resolvedExample,
];

/** Most recent reconciliation run timestamp (for empty-state / summary). */
export const mockLastReconciliationAt = RUN_TIME;
