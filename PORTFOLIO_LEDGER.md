# Portfolio Ledger Engine

The portfolio ledger is the investment-accounting backbone of Family Wealth OS.
It turns raw trades (from CSV/Excel imports, contract notes or the future Angel
API) into a FIFO lot ledger with realised and unrealised gains, classified into
STCG / LTCG for internal review.

All calculation code lives in [`src/lib/portfolio/`](src/lib/portfolio) and is
**pure, deterministic and UI-free**. No financial logic lives inside React
components. The engine is covered by unit tests in
[`tests/portfolio/`](tests/portfolio).

> The engine is mock/live-ready: today it runs on mock trades
> ([`src/data/mockTrades.ts`](src/data/mockTrades.ts)); the same functions will
> consume live Angel API trades and imported statements unchanged.

---

## 1. Trade import flow

```
Raw source (CSV / Excel / contract note PDF / Angel API)
        │
        ▼
ImportedTrade[]  ──►  validateImportedTrade()   ─► TradeValidationError[]
        │            detectDuplicates()          ─► duplicate row keys
        ▼
normalizeTrades()  ──►  NormalizedTrade[]  (sorted, numeric, charges computed)
        │
        ▼
buildFifoLots()  ──►  OpenLot[] + ClosedLot[] + FifoException[]
        │
        ▼
buildPortfolioLedger()  ──►  account / PAN / family holdings + gains
```

The Historical Trade Import UI (`/tax-centre/imports`) demonstrates this flow on
four mock batches (success, validation errors, duplicates, awaiting review). File
processing is **not** enabled in this version — the UI, types and service layer
are ready for it.

### Import fields

Each `ImportedTrade` carries: `tenantId`, `familyMemberId`, `panId`,
`brokerAccountId`, `dematAccountId`, `clientCode`, `accountOwner`,
`tradeDateTime`, `tradeDate`, `orderId`, `tradeId`, `exchange`, `tradingSymbol`,
`symbolToken`, `isin`, `buySell`, `productType`, `quantity`, `price`,
`grossAmount`, all charge fields (`brokerage`, `stt`, `gst`, `stampDuty`,
`exchangeCharges`, `sebiCharges`, `otherCharges`), `netAmount`,
`settlementNumber`, `contractNoteNumber`, `source`, `importBatchId` and
`rawRowReference`.

`source` ∈ `angel_api | csv_upload | excel_upload | contract_note_pdf |
manual_adjustment | mock`.

### Validation rules

1. `clientCode` required
2. `tradeDateTime` required
3. `orderId` required
4. `tradeId` required
5. `exchange` required
6. `tradingSymbol` required
7. `isin` strongly preferred (warning if missing)
8. `buySell` must be BUY or SELL
9. `quantity` must be positive
10. `price` must be positive
11. `netAmount` available or calculable (warning otherwise)
12. **Duplicate** = same `tenantId + clientCode + orderId + tradeId +
    tradeDateTime` (`duplicateKey()` / `detectDuplicates()`)

Errors block a row from import; warnings do not.

---

## 2. Normalized trade format

`normalizeTrades()` converts any source into a canonical `NormalizedTrade`:

- `transactionType` is **BUY** or **SELL** (case-insensitive mapping).
- `productType` ∈ `DELIVERY | INTRADAY | MARGIN | FNO | OTHER`.
- `quantity` / `price` coerced to numbers.
- `totalCharges` = sum of all charge buckets.
- `grossAmount` = `quantity × price` when not supplied.
- `netAmount` = BUY: `gross + charges`; SELL: `gross − charges` (when not
  supplied).
- Trades are **sorted ascending by `tradeDateTime`** (then `tradeId`).
- The input array is never mutated.

> Assumption: without an import timestamp the engine uses `tradeDateTime` for
> `createdAt`/`updatedAt` so results stay deterministic.

---

## 3. FIFO method

`buildFifoLots()` groups trades by `tenantId + brokerAccountId + clientCode +
isin + productType` and processes them in time order:

- **BUY** → push a new `OpenLot` (`originalQuantity`, `remainingQuantity`,
  `buyPrice`, `buyCharges`).
- **SELL** → match against the **oldest** open lots first, producing a
  `ClosedLot` per partial match and reducing `remainingQuantity`.
- **Sell exceeds available quantity** → a `FifoException` (oversold) is raised
  instead of going negative — surfaced later as a reconciliation exception.

Every partial match is traceable (`sellTradeId` → `buyTradeId`).

### Open lots

An `OpenLot` is a buy lot with quantity still held: `buyTradeId`, `buyDate`,
`buyPrice`, `originalQuantity`, `remainingQuantity`, `buyCharges`, `costValue`
(`remainingQuantity × buyPrice`).

### Closed lots

A `ClosedLot` records a matched buy→sell slice:

`sellTradeId`, `buyTradeId`, `isin`, `tradingSymbol`, `quantitySold`, `buyDate`,
`sellDate`, `buyPrice`, `sellPrice`, `costValue`, `sellValue`,
`allocatedBuyCharges`, `allocatedSellCharges`, `realisedGainLoss`,
`holdingDays`, `gainType`, `financialYear`, `accountOwner`, `clientCode`,
`panId`, `brokerAccountId`, `productType`.

- `allocatedBuyCharges` = `buyCharges × (quantitySold / originalQuantity)`
- `allocatedSellCharges` = `sellCharges × (quantitySold / sellQuantity)`
- `realisedGainLoss` = `sellValue − costValue − allocatedBuyCharges −
  allocatedSellCharges`
- `holdingDays` = calendar days between buy and sell (timezone-safe instant
  difference)

---

## 4. STCG / LTCG classification

`classifyGain(productType, holdingDays, config)`:

- `DELIVERY`: `holdingDays > ltcgThresholdDays` → **LTCG**, else **STCG**.
- `INTRADAY` → **INTRADAY**, `FNO` → **FNO** (tracked separately — not STCG/LTCG).
- otherwise **UNKNOWN**.

The threshold is **configurable** (`DEFAULT_CAPITAL_GAIN_CONFIG.ltcgThresholdDays
= 365`) because tax rules change. `classifyCapitalGain()` re-classifies existing
closed lots with an updated config.

`getFinancialYear(date)` resolves the Indian FY (1 April – 31 March), e.g.
`FY 2026-27`. The boundary is resolved in the **Asia/Kolkata** calendar so the FY
is identical regardless of the host timezone (local IST vs. Vercel UTC).

---

## 5. Consolidated ledger

`buildPortfolioLedger(trades, prices)` returns:

- `accountHoldings` — per broker account + client + ISIN
- `panHoldings` — per PAN + ISIN
- `familyHoldings` — consolidated per ISIN
- `openLots`, `closedLots`
- `realisedGain` (`CapitalGainResult`: total, STCG, LTCG, intraday, F&O, charges)
- `unrealisedGain` (`total`, `pricedCount`, `pendingCount`)

`calculateUnrealisedGain()` values open lots at the latest price from a
`PriceMap` keyed by ISIN. **If a price is missing the holding is flagged
`priceStatus: "pending"`** and excluded from the unrealised total (see the ITC
example in the mock data).

---

## 6. Assumptions & known limitations

- **Not tax advice.** Outputs are calculation support only and require CA
  verification.
- Corporate actions (splits, bonuses, mergers) are **not** modelled yet — they
  will surface as oversold FIFO exceptions.
- Grandfathering (31 Jan 2018 fair value for LTCG) is **not** applied.
- Intraday and F&O gains are tracked but not run through STCG/LTCG logic.
- Prices are a static mock `PriceMap`; live prices arrive with the market-data
  connector.
- One masked client code maps to one broker account in the mock; multi-demat
  nuances are simplified.

---

## Files

| File | Responsibility |
|------|----------------|
| `src/lib/portfolio/types.ts` | All domain types |
| `src/lib/portfolio/tradeNormalizer.ts` | Normalisation, validation, duplicate detection |
| `src/lib/portfolio/fifoEngine.ts` | FIFO lot matching, open quantity |
| `src/lib/portfolio/capitalGains.ts` | STCG/LTCG classification, realised/unrealised gain |
| `src/lib/portfolio/financialYear.ts` | Indian financial year |
| `src/lib/portfolio/holdingsLedger.ts` | Consolidated holdings ledger |
| `src/lib/portfolio/reconciliationEngine.ts` | Reconciliation (see RECONCILIATION_ENGINE.md) |
| `src/lib/portfolio/index.ts` | Barrel export |
