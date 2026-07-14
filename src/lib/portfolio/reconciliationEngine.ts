import type {
  BrokerFunds,
  BrokerHolding,
  BrokerHoldingComparison,
  CashLedgerComparison,
  ContractNoteLink,
  HoldingRow,
  ReconciliationException,
  ReconciliationRun,
  ReconSeverity,
  SuggestedAction,
} from "./types";
import { round2 } from "./util";

/** Context supplied by the caller so runs stay deterministic (no Date.now here). */
export interface ReconContext {
  runId: string;
  tenantId: string;
  /** ISO timestamp used for createdAt/updatedAt/run times. */
  now: string;
}

export interface ReconciliationOutcome {
  run: ReconciliationRun;
  exceptions: ReconciliationException[];
}

/** Minimal shape shared by imported and API trades, for comparison. */
export interface TradeLike {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  tradeId: string;
  orderId: string;
  tradingSymbol: string;
  isin?: string;
  quantity: number;
  price: number;
  accountOwner?: string;
}

// --- Pure comparisons -------------------------------------------------------

/**
 * Compares broker-reported holdings against the internal ledger by
 * tenantId + brokerAccountId + clientCode + isin. Returns one comparison per
 * key present on either side (missing side counts as quantity 0). Pure.
 */
export function compareBrokerHoldingWithInternalLedger(
  brokerHoldings: BrokerHolding[],
  internalHoldings: HoldingRow[],
): BrokerHoldingComparison[] {
  const key = (h: { tenantId: string; brokerAccountId?: string; clientCode?: string; isin: string }) =>
    `${h.tenantId}|${h.brokerAccountId ?? ""}|${h.clientCode ?? ""}|${h.isin}`;

  const internalMap = new Map<string, HoldingRow>();
  for (const h of internalHoldings) internalMap.set(key(h), h);
  const brokerMap = new Map<string, BrokerHolding>();
  for (const h of brokerHoldings) brokerMap.set(key(h), h);

  const keys = new Set<string>([...internalMap.keys(), ...brokerMap.keys()]);
  const results: BrokerHoldingComparison[] = [];

  for (const k of keys) {
    const broker = brokerMap.get(k);
    const internal = internalMap.get(k);
    const brokerQuantity = broker?.quantity ?? 0;
    const internalQuantity = internal?.quantity ?? 0;
    const difference = round2(brokerQuantity - internalQuantity);
    results.push({
      tenantId: (broker ?? internal)!.tenantId,
      brokerAccountId: (broker?.brokerAccountId ?? internal?.brokerAccountId) ?? "",
      clientCode: (broker?.clientCode ?? internal?.clientCode) ?? "",
      isin: (broker?.isin ?? internal?.isin) ?? "",
      tradingSymbol: broker?.tradingSymbol ?? internal?.tradingSymbol,
      accountOwner: broker?.accountOwner ?? internal?.accountOwner,
      brokerQuantity,
      internalQuantity,
      expected: brokerQuantity,
      actual: internalQuantity,
      difference,
      match: difference === 0,
    });
  }

  return results.sort((a, b) => (a.isin ?? "").localeCompare(b.isin ?? ""));
}

export interface TradeComparisonResult {
  missing: TradeLike[];
  duplicateTradeIds: string[];
  mismatched: {
    tradeId: string;
    tradingSymbol: string;
    brokerAccountId: string;
    clientCode: string;
    apiQuantity: number;
    importedQuantity: number;
    apiPrice: number;
    importedPrice: number;
  }[];
}

/**
 * Compares a broker/API trade book against imported trades. Detects trades in
 * the broker book that were never imported (missing), trade ids that appear
 * more than once in the imports (duplicate) and quantity/price mismatches. Pure.
 */
export function compareTradeBookWithImportedTrades(
  apiTrades: TradeLike[],
  importedTrades: TradeLike[],
): TradeComparisonResult {
  const importedById = new Map<string, TradeLike>();
  const counts = new Map<string, number>();
  for (const t of importedTrades) {
    importedById.set(t.tradeId, t);
    counts.set(t.tradeId, (counts.get(t.tradeId) ?? 0) + 1);
  }

  const missing = apiTrades.filter((t) => !importedById.has(t.tradeId));

  const duplicateTradeIds = [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([id]) => id)
    .sort();

  const mismatched: TradeComparisonResult["mismatched"] = [];
  for (const api of apiTrades) {
    const imported = importedById.get(api.tradeId);
    if (!imported) continue;
    if (api.quantity !== imported.quantity || api.price !== imported.price) {
      mismatched.push({
        tradeId: api.tradeId,
        tradingSymbol: api.tradingSymbol,
        brokerAccountId: api.brokerAccountId,
        clientCode: api.clientCode,
        apiQuantity: api.quantity,
        importedQuantity: imported.quantity,
        apiPrice: api.price,
        importedPrice: imported.price,
      });
    }
  }

  return { missing, duplicateTradeIds, mismatched };
}

// --- Exception factory ------------------------------------------------------

function baseException(
  ctx: ReconContext,
  fields: Partial<ReconciliationException> & { id: string; exceptionType: ReconciliationException["exceptionType"] },
): ReconciliationException {
  return {
    tenantId: ctx.tenantId,
    reconciliationRunId: ctx.runId,
    severity: "Medium",
    status: "Open",
    entityType: "holding",
    createdAt: ctx.now,
    updatedAt: ctx.now,
    ...fields,
  };
}

function run(
  ctx: ReconContext,
  type: ReconciliationRun["type"],
  exceptions: ReconciliationException[],
  note?: string,
): ReconciliationOutcome {
  return {
    run: {
      id: ctx.runId,
      tenantId: ctx.tenantId,
      type,
      status: "completed",
      startedAt: ctx.now,
      finishedAt: ctx.now,
      exceptionCount: exceptions.length,
      note,
    },
    exceptions,
  };
}

// --- Run functions ----------------------------------------------------------

export function runHoldingReconciliation(
  brokerHoldings: BrokerHolding[],
  internalHoldings: HoldingRow[],
  ctx: ReconContext,
): ReconciliationOutcome {
  const comparisons = compareBrokerHoldingWithInternalLedger(brokerHoldings, internalHoldings);
  const exceptions = comparisons
    .filter((c) => !c.match)
    .map((c, i): ReconciliationException => {
      // Fully missing on one side is more serious than a partial drift.
      const severity: ReconSeverity =
        c.brokerQuantity === 0 || c.internalQuantity === 0 ? "High" : "Medium";
      const action: SuggestedAction = "Check Angel trade book";
      return baseException(ctx, {
        id: `${ctx.runId}-hold-${i + 1}`,
        exceptionType: "HOLDING_QUANTITY_MISMATCH",
        severity,
        entityType: "holding",
        entityId: c.isin,
        brokerAccountId: c.brokerAccountId,
        accountOwner: c.accountOwner,
        clientCode: c.clientCode,
        isin: c.isin,
        tradingSymbol: c.tradingSymbol,
        expectedValue: c.brokerQuantity,
        actualValue: c.internalQuantity,
        difference: c.difference,
        differenceType: "quantity",
        suggestedReason:
          "Broker holding quantity does not match the internal FIFO ledger. A trade may be missing, duplicated or affected by a corporate action.",
        suggestedAction: action,
      });
    });
  return run(ctx, "holding", exceptions);
}

export interface InternalCashBalance {
  brokerAccountId: string;
  clientCode: string;
  balance: number;
}

export function runFundsReconciliation(
  brokerFunds: BrokerFunds[],
  internalBalances: InternalCashBalance[],
  ctx: ReconContext,
): ReconciliationOutcome {
  const internalMap = new Map<string, number>();
  for (const b of internalBalances) internalMap.set(`${b.brokerAccountId}|${b.clientCode}`, b.balance);

  const comparisons: CashLedgerComparison[] = brokerFunds.map((f) => {
    const internalBalance = internalMap.get(`${f.brokerAccountId}|${f.clientCode}`) ?? 0;
    const difference = round2(f.balance - internalBalance);
    return {
      tenantId: f.tenantId,
      brokerAccountId: f.brokerAccountId,
      clientCode: f.clientCode,
      brokerBalance: f.balance,
      internalBalance,
      difference,
      match: difference === 0,
    };
  });

  const exceptions = comparisons
    .filter((c) => !c.match)
    .map((c, i): ReconciliationException =>
      baseException(ctx, {
        id: `${ctx.runId}-funds-${i + 1}`,
        exceptionType: "FUNDS_BALANCE_MISMATCH",
        severity: "High",
        entityType: "funds",
        entityId: c.brokerAccountId,
        brokerAccountId: c.brokerAccountId,
        clientCode: c.clientCode,
        expectedValue: c.brokerBalance,
        actualValue: c.internalBalance,
        difference: c.difference,
        differenceType: "amount",
        suggestedReason:
          "Broker funds balance differs from the internal cash ledger. Pay-in/pay-out or charges may be unrecorded.",
        suggestedAction: "Confirm broker ledger",
      }),
    );
  return run(ctx, "funds", exceptions);
}

export function runTradeReconciliation(
  apiTrades: TradeLike[],
  importedTrades: TradeLike[],
  ctx: ReconContext,
): ReconciliationOutcome {
  const { missing, duplicateTradeIds, mismatched } = compareTradeBookWithImportedTrades(
    apiTrades,
    importedTrades,
  );
  const exceptions: ReconciliationException[] = [];

  missing.forEach((t, i) =>
    exceptions.push(
      baseException(ctx, {
        id: `${ctx.runId}-miss-${i + 1}`,
        exceptionType: "MISSING_TRADE",
        severity: "High",
        entityType: "trade",
        entityId: t.tradeId,
        brokerAccountId: t.brokerAccountId,
        accountOwner: t.accountOwner,
        clientCode: t.clientCode,
        isin: t.isin,
        tradingSymbol: t.tradingSymbol,
        expectedValue: `${t.quantity} @ ${t.price}`,
        actualValue: "not imported",
        differenceType: "missing",
        suggestedReason: "Trade exists in the broker book but was never imported into the ledger.",
        suggestedAction: "Import missing trade",
      }),
    ),
  );

  duplicateTradeIds.forEach((tradeId, i) => {
    const t = importedTrades.find((x) => x.tradeId === tradeId);
    exceptions.push(
      baseException(ctx, {
        id: `${ctx.runId}-dup-${i + 1}`,
        exceptionType: "DUPLICATE_TRADE",
        severity: "Medium",
        entityType: "trade",
        entityId: tradeId,
        brokerAccountId: t?.brokerAccountId,
        clientCode: t?.clientCode,
        isin: t?.isin,
        tradingSymbol: t?.tradingSymbol,
        expectedValue: "1 occurrence",
        actualValue: "2+ occurrences",
        differenceType: "extra",
        suggestedReason: "The same trade id appears more than once in the imported trades.",
        suggestedAction: "Review manual adjustment",
      }),
    );
  });

  mismatched.forEach((m, i) =>
    exceptions.push(
      baseException(ctx, {
        id: `${ctx.runId}-tval-${i + 1}`,
        exceptionType: "TRADE_VALUE_MISMATCH",
        severity: "Medium",
        entityType: "trade",
        entityId: m.tradeId,
        brokerAccountId: m.brokerAccountId,
        clientCode: m.clientCode,
        tradingSymbol: m.tradingSymbol,
        expectedValue: `${m.apiQuantity} @ ${m.apiPrice}`,
        actualValue: `${m.importedQuantity} @ ${m.importedPrice}`,
        differenceType: "value",
        suggestedReason: "Quantity or price of the imported trade differs from the broker book.",
        suggestedAction: "Check Angel trade book",
      }),
    ),
  );

  return run(ctx, "trade", exceptions);
}

/**
 * Placeholder: contract note ↔ trade book reconciliation. Until contract-note
 * PDFs are parsed, unlinked notes are surfaced as "Waiting for Data" exceptions.
 */
export function runContractNoteReconciliationPlaceholder(
  links: ContractNoteLink[],
  ctx: ReconContext,
): ReconciliationOutcome {
  const exceptions = links
    .filter((l) => l.status !== "linked")
    .map((l, i): ReconciliationException =>
      baseException(ctx, {
        id: `${ctx.runId}-cn-${i + 1}`,
        exceptionType: "CONTRACT_NOTE_MISSING",
        severity: "Medium",
        status: "Waiting for Data",
        entityType: "contract_note",
        entityId: l.contractNoteNumber,
        brokerAccountId: l.brokerAccountId,
        clientCode: l.clientCode,
        expectedValue: `${l.tradeIds.length} trade(s)`,
        actualValue: l.status,
        differenceType: "missing",
        suggestedReason:
          "Contract note is not yet linked to a parsed document. PDF parsing is a future capability.",
        suggestedAction: "Review contract note",
      }),
    );
  return run(
    ctx,
    "contract_note",
    exceptions,
    "Placeholder — contract note PDF parsing arrives with the live connector.",
  );
}

/**
 * Placeholder: Tally broker ledger ↔ Angel broker ledger reconciliation.
 * Returns no exceptions until live ledger data is connected.
 */
export function runTallyBrokerLedgerReconciliationPlaceholder(
  ctx: ReconContext,
): ReconciliationOutcome {
  return run(
    ctx,
    "tally_broker_ledger",
    [],
    "Placeholder — awaiting live Tally and Angel broker-ledger data.",
  );
}
