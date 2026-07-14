# Reconciliation Engine

The reconciliation engine compares the **internal FIFO ledger** against
**broker-reported data** and surfaces differences as typed exceptions for review
in the Reconciliation Centre (`/reconciliation`).

Scope is **investment data only**. There is **no Bank Balance module and no bank
reconciliation** in this product.

Engine: [`src/lib/portfolio/reconciliationEngine.ts`](src/lib/portfolio/reconciliationEngine.ts).
Mock inputs/outputs: [`src/data/mockReconciliation.ts`](src/data/mockReconciliation.ts).
All functions are pure and deterministic — timestamps and run ids are passed in
via a `ReconContext` so runs never depend on `Date.now()`.

---

## Reconciliation types

| # | Type | Function | Notes |
|---|------|----------|-------|
| 1 | Broker holding vs internal ledger | `runHoldingReconciliation()` | Quantity by `tenantId + brokerAccountId + clientCode + isin` |
| 2 | Broker funds vs internal cash ledger | `runFundsReconciliation()` | Balance by broker account + client |
| 3 | Trade book vs imported trades | `runTradeReconciliation()` | Missing / duplicate / value mismatch |
| 4 | Contract note vs trade book | `runContractNoteReconciliationPlaceholder()` | **Placeholder** — PDF parsing pending |
| 5 | Tally broker ledger vs Angel broker ledger | `runTallyBrokerLedgerReconciliationPlaceholder()` | **Placeholder** — awaiting live data |

Pure comparison helpers back the run functions:

- `compareBrokerHoldingWithInternalLedger(brokerHoldings, internalHoldings)` →
  `BrokerHoldingComparison[]`
- `compareTradeBookWithImportedTrades(apiTrades, importedTrades)` → `{ missing,
  duplicateTradeIds, mismatched }`

---

## Exception types

`HOLDING_QUANTITY_MISMATCH`, `HOLDING_VALUE_MISMATCH`, `MISSING_TRADE`,
`DUPLICATE_TRADE`, `TRADE_VALUE_MISMATCH`, `FUNDS_BALANCE_MISMATCH`,
`CONTRACT_NOTE_MISSING`, `LEDGER_ENTRY_MISSING`, `SYMBOL_MAPPING_MISSING`,
`PRICE_MISSING`, `UNKNOWN`.

Each `ReconciliationException` carries: `id`, `tenantId`, `reconciliationRunId`,
`exceptionType`, `severity`, `status`, `entityType`, `entityId`,
`familyMemberId`, `accountOwner`, `brokerAccountId`, `clientCode`, `isin`,
`tradingSymbol`, `expectedValue`, `actualValue`, `difference`, `differenceType`,
`suggestedReason`, `suggestedAction`, `assignedTo`, `dueDate`, `createdAt`,
`updatedAt`, `resolvedAt`, `resolutionNote`.

## Statuses

`Open` · `In Review` · `Waiting for Data` · `Resolved` · `Ignored`

Placeholder outputs (contract note, price missing) default to **Waiting for
Data**.

## Severity

`Low` · `Medium` · `High` · `Critical`

Heuristics: a holding fully missing on one side is **High**; a partial drift is
**Medium**; missing trades and funds mismatches are **High**; a missing price is
**Low**.

## Suggested actions

`Import missing trade` · `Review contract note` · `Check Angel trade book` ·
`Check symbol/ISIN mapping` · `Review corporate action` · `Review manual
adjustment` · `Confirm broker ledger` · `Assign to accountant` · `Mark as ignored
with reason`

---

## Current placeholders

- **Contract note reconciliation** returns `CONTRACT_NOTE_MISSING` items marked
  *Waiting for Data* for any unlinked note. Actual PDF parsing/matching arrives
  with the document connector.
- **Tally ↔ Angel broker ledger** returns no exceptions and a placeholder note —
  it activates once both ledgers are connected.
- **PRICE_MISSING** is surfaced from the ledger for ISINs with no latest price
  (e.g. the ITC mock holding), not from a run function.

---

## Mock scenario

`src/data/mockReconciliation.ts` deliberately introduces inconsistencies so the
Reconciliation Centre shows real exceptions:

- **Holding mismatch** — broker RELIANCE (Father) +2 and ICICIBANK (Family
  Member 3) −2 vs the internal ledger.
- **Missing trade** — a SUNPHARMA trade present in the broker book but never
  imported.
- **Duplicate trade** — `TRD-F1` appears twice in the imported set.
- **Trade value mismatch** — an ICICIBANK sell priced 1185 (broker) vs 1180
  (import).
- **Funds mismatch** — Father's broker balance differs from the internal cash
  ledger.
- **Contract note missing** — Family Member 3's June note is unlinked.
- **Price missing** — ITC has no latest price.
- One **Resolved** exception seeds the "resolved this month" metric.

---

## Future live Angel API connection

The engine consumes plain arrays (`BrokerHolding[]`, `BrokerFunds[]`,
`TradeLike[]`). When the read-only Angel connector (see
[`ANGEL_CONNECTOR_SETUP.md`](ANGEL_CONNECTOR_SETUP.md)) provides live holdings,
funds and trade book data, the **same run functions** execute unchanged — only
the input source swaps from mock to live. Trading stays disabled throughout;
reconciliation is strictly read-and-compare.
