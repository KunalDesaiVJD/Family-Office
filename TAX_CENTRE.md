# Tax Centre

The Tax Centre (`/tax-centre`) presents the output of the portfolio ledger as
capital-gains schedules for **internal review and CA verification**. It performs
no filing and gives no tax advice.

> **Prepared for internal review and CA verification.**
> Contract note and broker ledger reconciliation should be completed before
> filing.

Page: [`src/app/(app)/tax-centre/page.tsx`](src/app/(app)/tax-centre/page.tsx) ·
View: [`src/components/tax/TaxCentreClient.tsx`](src/components/tax/TaxCentreClient.tsx).

---

## What the Tax Centre calculates

It runs the pure FIFO engine
([PORTFOLIO_LEDGER.md](PORTFOLIO_LEDGER.md)) over the imported/mock trades at
render and shows:

**KPI cards** — Total realised gain, STCG, LTCG, Unrealised gain, Open lots,
Sold lots, Total charges, Trades pending review.

**Filters** — Financial year, Family member, PAN, Broker account, Client code
(masked), Symbol, ISIN, Gain type, Source. Filters recompute the KPIs and tables
live.

**Tables**
- Realised gains (grouped by financial year × gain type)
- Unrealised holdings (valued at latest price; "Price pending" when unavailable)
- Open lots (FIFO buy lots still held)
- Closed lots (matched buy→sell with realised gain, holding days, gain type)
- Trade history (normalised trade book)
- Import batches (feeding the ledger)

**Reports & exports** — CA Excel, Capital Gain Report PDF, Broker-wise Trade
Report, PAN-wise Report. These are **placeholders** (disabled) until the
reporting service is built.

All figures are labelled as calculation support requiring CA verification.

---

## What remains for CA verification

- Final tax treatment, set-offs and carry-forward of losses.
- Grandfathering (31 Jan 2018 fair value) for LTCG on listed equity.
- Corporate-action adjustments (splits, bonuses, mergers, buybacks).
- Intraday and F&O treatment (tracked separately, not classified STCG/LTCG here).
- Reconciliation of contract notes and broker ledgers before the return is filed.

The Tax Centre computes; the CA verifies and files.

---

## Data source (mock → live)

Today the centre reads the shared mock ledger
([`src/data/mockPortfolio.ts`](src/data/mockPortfolio.ts)) built from
[`src/data/mockTrades.ts`](src/data/mockTrades.ts). The mock includes both an
LTCG example (RELIANCE held > 12 months) and STCG examples (INFY, ICICIBANK,
part of HDFCBANK), open and closed lots, and a pending-price holding (ITC).

When live Angel trades or imported statements are available, they flow through
the **same** `normalizeTrades → buildFifoLots → buildPortfolioLedger` pipeline —
the Tax Centre UI is unchanged.

---

## How reports will be exported later

Planned once the reporting service lands:

1. **CA Excel export** — per-PAN STCG/LTCG schedules with lot-level detail and
   allocated charges.
2. **Capital Gain Report PDF** — filing-ready summary with disclaimers.
3. **Broker-wise / PAN-wise reports** — grouped closed-lot schedules.

Exports will be generated server-side from the same `PortfolioHoldingLedger`
object, so the numbers on screen and in the export are guaranteed to match.

---

## Compliance

- No real Angel credentials, client codes, PANs, contract notes or bank data.
- Client codes are masked (e.g. `ANG****1234`).
- Trading remains disabled — the Tax Centre is read-only.
- No investment or tax advice is provided.
