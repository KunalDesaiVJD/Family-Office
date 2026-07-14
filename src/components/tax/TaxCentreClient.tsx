"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  MetricCard,
  type BadgeTone,
  type DataTableColumn,
} from "@/components/ui";
import { Icon } from "@/components/icons";
import { ROUTES } from "@/config/routes";
import {
  formatCompactINR,
  formatDate,
  formatNumber,
  formatPreciseINR,
  maskClientCode,
} from "@/lib/format";
import { getFinancialYear } from "@/lib/portfolio/financialYear";
import type {
  ClosedLot,
  GainType,
  HoldingRow,
  NormalizedTrade,
  OpenLot,
  TradeImportBatch,
} from "@/lib/portfolio/types";

interface Props {
  closedLots: ClosedLot[];
  openLots: OpenLot[];
  holdings: HoldingRow[];
  trades: NormalizedTrade[];
  batches: TradeImportBatch[];
  pendingReview: number;
}

const gainTone: Record<GainType, BadgeTone> = {
  STCG: "warning",
  LTCG: "success",
  INTRADAY: "info",
  FNO: "brand",
  UNKNOWN: "neutral",
};

const ALL = "all";

const strong = (v: string) => <span className="font-medium text-ink">{v}</span>;
const muted = (v: string) => <span className="text-muted">{v}</span>;
const num = (v: number) => <span className="tabular-nums text-ink">{formatNumber(v)}</span>;
const money = (v: number) => <span className="tabular-nums text-ink">{formatPreciseINR(v)}</span>;
const signed = (v: number) => (
  <span className={`tabular-nums font-medium ${v >= 0 ? "text-emerald-600" : "text-red-600"}`}>
    {formatPreciseINR(v)}
  </span>
);
const gainBadge = (g: GainType) => <Badge tone={gainTone[g]}>{g}</Badge>;

function uniq(values: (string | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v)))].sort();
}

function Select({
  label,
  value,
  onChange,
  options,
  render,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  render?: (v: string) => string;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand-blue/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/20"
      >
        <option value={ALL}>All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {render ? render(o) : o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function TaxCentreClient({ closedLots, openLots, holdings, trades, batches, pendingReview }: Props) {
  const [fy, setFy] = useState(ALL);
  const [owner, setOwner] = useState(ALL);
  const [pan, setPan] = useState(ALL);
  const [broker, setBroker] = useState(ALL);
  const [client, setClient] = useState(ALL);
  const [symbol, setSymbol] = useState(ALL);
  const [isin, setIsin] = useState(ALL);
  const [gainType, setGainType] = useState(ALL);
  const [source, setSource] = useState(ALL);

  const eq = (v: string, f: string) => f === ALL || v === f;

  const filteredClosed = useMemo(
    () =>
      closedLots.filter(
        (l) =>
          eq(l.financialYear, fy) &&
          eq(l.accountOwner, owner) &&
          eq(l.panId, pan) &&
          eq(l.brokerAccountId, broker) &&
          eq(l.clientCode, client) &&
          eq(l.tradingSymbol, symbol) &&
          eq(l.isin, isin) &&
          eq(l.gainType, gainType),
      ),
    [closedLots, fy, owner, pan, broker, client, symbol, isin, gainType],
  );

  const filteredOpen = useMemo(
    () =>
      openLots.filter(
        (l) =>
          eq(l.accountOwner, owner) &&
          eq(l.panId, pan) &&
          eq(l.brokerAccountId, broker) &&
          eq(l.clientCode, client) &&
          eq(l.tradingSymbol, symbol) &&
          eq(l.isin, isin),
      ),
    [openLots, owner, pan, broker, client, symbol, isin],
  );

  const filteredHoldings = useMemo(
    () =>
      holdings
        .filter(
          (h) =>
            eq(h.accountOwner ?? "", owner) &&
            eq(h.panId ?? "", pan) &&
            eq(h.brokerAccountId ?? "", broker) &&
            eq(h.clientCode ?? "", client) &&
            eq(h.tradingSymbol, symbol) &&
            eq(h.isin, isin),
        )
        .map((h) => ({ ...h, id: `${h.brokerAccountId ?? ""}|${h.clientCode ?? ""}|${h.isin}` })),
    [holdings, owner, pan, broker, client, symbol, isin],
  );

  const filteredTrades = useMemo(
    () =>
      trades.filter(
        (t) =>
          eq(getFinancialYear(t.tradeDateTime).key, fy) &&
          eq(t.accountOwner, owner) &&
          eq(t.panId, pan) &&
          eq(t.brokerAccountId, broker) &&
          eq(t.clientCode, client) &&
          eq(t.tradingSymbol, symbol) &&
          eq(t.isin, isin) &&
          eq(t.source, source),
      ),
    [trades, fy, owner, pan, broker, client, symbol, isin, source],
  );

  // KPIs recomputed over the filtered closed/open sets.
  const kpi = useMemo(() => {
    let realised = 0;
    let stcg = 0;
    let ltcg = 0;
    let charges = 0;
    for (const l of filteredClosed) {
      realised += l.realisedGainLoss;
      charges += l.allocatedBuyCharges + l.allocatedSellCharges;
      if (l.gainType === "STCG") stcg += l.realisedGainLoss;
      else if (l.gainType === "LTCG") ltcg += l.realisedGainLoss;
    }
    const unrealised = filteredHoldings
      .filter((h) => h.priceStatus === "priced")
      .reduce((s, h) => s + (h.unrealisedGain ?? 0), 0);
    return { realised, stcg, ltcg, charges, unrealised };
  }, [filteredClosed, filteredHoldings]);

  // Realised gains summary grouped by FY × gain type.
  const realisedSummary = useMemo(() => {
    const map = new Map<string, { id: string; financialYear: string; gainType: GainType; gain: number; count: number }>();
    for (const l of filteredClosed) {
      const key = `${l.financialYear}|${l.gainType}`;
      const row = map.get(key) ?? { id: key, financialYear: l.financialYear, gainType: l.gainType, gain: 0, count: 0 };
      row.gain += l.realisedGainLoss;
      row.count += 1;
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => a.financialYear.localeCompare(b.financialYear));
  }, [filteredClosed]);

  const opts = useMemo(
    () => ({
      fy: uniq(closedLots.map((l) => l.financialYear)),
      owner: uniq([...closedLots.map((l) => l.accountOwner), ...openLots.map((l) => l.accountOwner)]),
      pan: uniq([...closedLots.map((l) => l.panId), ...openLots.map((l) => l.panId)]),
      broker: uniq([...closedLots.map((l) => l.brokerAccountId), ...openLots.map((l) => l.brokerAccountId)]),
      client: uniq([...closedLots.map((l) => l.clientCode), ...openLots.map((l) => l.clientCode)]),
      symbol: uniq([...closedLots.map((l) => l.tradingSymbol), ...openLots.map((l) => l.tradingSymbol)]),
      isin: uniq([...closedLots.map((l) => l.isin), ...openLots.map((l) => l.isin)]),
      gainType: uniq(closedLots.map((l) => l.gainType)),
      source: uniq(trades.map((t) => t.source)),
    }),
    [closedLots, openLots, trades],
  );

  const hasData = closedLots.length > 0 || openLots.length > 0;

  const realisedCols: DataTableColumn<(typeof realisedSummary)[number]>[] = [
    { key: "financialYear", header: "Financial Year", render: (_v, r) => strong(r.financialYear) },
    { key: "gainType", header: "Gain Type", render: (_v, r) => gainBadge(r.gainType) },
    { key: "count", header: "Lots", align: "right", render: (_v, r) => num(r.count) },
    { key: "gain", header: "Realised Gain / Loss", align: "right", render: (_v, r) => signed(r.gain) },
  ];

  const holdingCols: DataTableColumn<HoldingRow>[] = [
    { key: "accountOwner", header: "Owner", render: (_v, r) => strong(r.accountOwner ?? "—") },
    { key: "tradingSymbol", header: "Symbol", render: (_v, r) => strong(r.tradingSymbol) },
    { key: "isin", header: "ISIN", render: (_v, r) => muted(r.isin) },
    { key: "quantity", header: "Qty", align: "right", render: (_v, r) => num(r.quantity) },
    { key: "avgCost", header: "Avg Cost", align: "right", render: (_v, r) => money(r.avgCost) },
    { key: "investedValue", header: "Invested", align: "right", render: (_v, r) => money(r.investedValue) },
    {
      key: "marketValue",
      header: "Market Value",
      align: "right",
      render: (_v, r) =>
        r.priceStatus === "priced" ? money(r.marketValue ?? 0) : <Badge tone="warning">Price pending</Badge>,
    },
    {
      key: "unrealisedGain",
      header: "Unrealised",
      align: "right",
      render: (_v, r) => (r.priceStatus === "priced" ? signed(r.unrealisedGain ?? 0) : muted("—")),
    },
  ];

  const openCols: DataTableColumn<OpenLot>[] = [
    { key: "accountOwner", header: "Owner", render: (_v, r) => strong(r.accountOwner) },
    { key: "tradingSymbol", header: "Symbol", render: (_v, r) => strong(r.tradingSymbol) },
    { key: "buyDate", header: "Buy Date", render: (_v, r) => muted(formatDate(r.buyDate)) },
    { key: "remainingQuantity", header: "Open Qty", align: "right", render: (_v, r) => num(r.remainingQuantity) },
    { key: "buyPrice", header: "Buy Price", align: "right", render: (_v, r) => money(r.buyPrice) },
    { key: "costValue", header: "Cost Value", align: "right", render: (_v, r) => money(r.costValue) },
    { key: "clientCode", header: "Client", render: (_v, r) => muted(maskClientCode(r.clientCode)) },
  ];

  const closedCols: DataTableColumn<ClosedLot>[] = [
    { key: "accountOwner", header: "Owner", render: (_v, r) => strong(r.accountOwner) },
    { key: "tradingSymbol", header: "Symbol", render: (_v, r) => strong(r.tradingSymbol) },
    { key: "quantitySold", header: "Qty", align: "right", render: (_v, r) => num(r.quantitySold) },
    { key: "buyDate", header: "Buy", render: (_v, r) => muted(formatDate(r.buyDate)) },
    { key: "sellDate", header: "Sell", render: (_v, r) => muted(formatDate(r.sellDate)) },
    { key: "holdingDays", header: "Days", align: "right", render: (_v, r) => num(r.holdingDays) },
    { key: "gainType", header: "Type", render: (_v, r) => gainBadge(r.gainType) },
    { key: "realisedGainLoss", header: "Realised", align: "right", render: (_v, r) => signed(r.realisedGainLoss) },
    { key: "financialYear", header: "FY", render: (_v, r) => muted(r.financialYear) },
  ];

  const tradeCols: DataTableColumn<NormalizedTrade>[] = [
    { key: "tradeDateTime", header: "Date", render: (_v, r) => muted(formatDate(r.tradeDateTime)) },
    { key: "accountOwner", header: "Owner", render: (_v, r) => strong(r.accountOwner) },
    { key: "tradingSymbol", header: "Symbol", render: (_v, r) => strong(r.tradingSymbol) },
    {
      key: "transactionType",
      header: "Side",
      render: (_v, r) => <Badge tone={r.transactionType === "BUY" ? "success" : "danger"}>{r.transactionType}</Badge>,
    },
    { key: "quantity", header: "Qty", align: "right", render: (_v, r) => num(r.quantity) },
    { key: "price", header: "Price", align: "right", render: (_v, r) => money(r.price) },
    { key: "totalCharges", header: "Charges", align: "right", render: (_v, r) => money(r.totalCharges) },
    { key: "source", header: "Source", render: (_v, r) => <Badge tone="neutral">{r.source}</Badge> },
  ];

  const batchCols: DataTableColumn<TradeImportBatch>[] = [
    { key: "fileName", header: "File", render: (_v, r) => strong(r.fileName ?? "—") },
    { key: "familyMemberName", header: "Member", render: (_v, r) => muted(r.familyMemberName ?? "—") },
    { key: "totalRows", header: "Rows", align: "right", render: (_v, r) => num(r.totalRows) },
    { key: "validRows", header: "Valid", align: "right", render: (_v, r) => num(r.validRows) },
    { key: "invalidRows", header: "Invalid", align: "right", render: (_v, r) => num(r.invalidRows) },
    { key: "duplicateRows", header: "Dupes", align: "right", render: (_v, r) => num(r.duplicateRows) },
    { key: "uploadedAt", header: "Uploaded", render: (_v, r) => muted(formatDate(r.uploadedAt)) },
  ];

  if (!hasData) {
    return (
      <Card title="No trades yet" description="Import historical trades or sync Angel to populate the Tax Centre.">
        <EmptyState
          title="No capital-gains data"
          description="Once trades are imported, this centre computes FIFO open/closed lots, realised and unrealised gains and STCG/LTCG classification per PAN."
          icon={<Icon name="tax" size={22} />}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button href={ROUTES.taxImports} leftIcon={<Icon name="download" size={16} />}>
                Import Historical Trades
              </Button>
              <Button variant="outline" href={ROUTES.brokerHub} leftIcon={<Icon name="sync" size={16} />}>
                Sync Angel Trades
              </Button>
              <Button variant="outline" href={ROUTES.reconciliation} leftIcon={<Icon name="alert" size={16} />}>
                Review Exceptions
              </Button>
            </div>
          }
        />
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Realised Gain" value={formatCompactINR(kpi.realised)} tone={kpi.realised >= 0 ? "positive" : "negative"} sublabel="Filtered closed lots" icon={<Icon name="funds" size={18} />} />
        <MetricCard label="STCG" value={formatCompactINR(kpi.stcg)} sublabel="Short-term" icon={<Icon name="broker" size={18} />} />
        <MetricCard label="LTCG" value={formatCompactINR(kpi.ltcg)} tone="positive" sublabel="Long-term" icon={<Icon name="funds" size={18} />} />
        <MetricCard label="Unrealised Gain" value={formatCompactINR(kpi.unrealised)} tone={kpi.unrealised >= 0 ? "positive" : "negative"} sublabel="Priced holdings" icon={<Icon name="sparkle" size={18} />} />
        <MetricCard label="Open Lots" value={formatNumber(filteredOpen.length)} sublabel="Currently held" icon={<Icon name="documents" size={18} />} />
        <MetricCard label="Sold Lots" value={formatNumber(filteredClosed.length)} sublabel="Closed positions" icon={<Icon name="check" size={18} />} />
        <MetricCard label="Total Charges" value={formatCompactINR(kpi.charges)} tone="warning" sublabel="Allocated to lots" icon={<Icon name="tax" size={18} />} />
        <MetricCard label="Trades Pending Review" value={formatNumber(pendingReview)} tone={pendingReview > 0 ? "warning" : "default"} sublabel="Awaiting import review" icon={<Icon name="alert" size={18} />} />
      </div>

      {/* Filters */}
      <Card title="Filters" description="Narrow the schedules by year, entity, account or instrument.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Select label="Financial Year" value={fy} onChange={setFy} options={opts.fy} />
          <Select label="Family Member" value={owner} onChange={setOwner} options={opts.owner} />
          <Select label="PAN" value={pan} onChange={setPan} options={opts.pan} />
          <Select label="Broker Account" value={broker} onChange={setBroker} options={opts.broker} />
          <Select label="Client Code" value={client} onChange={setClient} options={opts.client} render={maskClientCode} />
          <Select label="Symbol" value={symbol} onChange={setSymbol} options={opts.symbol} />
          <Select label="ISIN" value={isin} onChange={setIsin} options={opts.isin} />
          <Select label="Gain Type" value={gainType} onChange={setGainType} options={opts.gainType} />
          <Select label="Source" value={source} onChange={setSource} options={opts.source} />
        </div>
      </Card>

      {/* Professional warnings */}
      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl2 border border-amber-200 bg-amber-50/70 px-4 py-3">
          <span className="mt-0.5 shrink-0 text-amber-600"><Icon name="alert" size={18} /></span>
          <p className="text-sm text-ink">Tax calculations are prepared for internal review and CA verification.</p>
        </div>
        <div className="flex items-start gap-3 rounded-xl2 border border-blue-200 bg-blue-50/70 px-4 py-3">
          <span className="mt-0.5 shrink-0 text-brand-blue"><Icon name="shield" size={18} /></span>
          <p className="text-sm text-ink">Contract note and broker ledger reconciliation should be completed before filing.</p>
        </div>
      </div>

      {/* Export placeholders */}
      <Card title="Reports & Exports" description="Report generation arrives with the reporting service. Buttons are placeholders.">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled leftIcon={<Icon name="download" size={16} />}>CA Excel Export</Button>
          <Button variant="outline" disabled leftIcon={<Icon name="download" size={16} />}>Capital Gain Report PDF</Button>
          <Button variant="outline" disabled leftIcon={<Icon name="download" size={16} />}>Broker-wise Trade Report</Button>
          <Button variant="outline" disabled leftIcon={<Icon name="download" size={16} />}>PAN-wise Report</Button>
        </div>
      </Card>

      {/* Tables */}
      <Card title="Realised Gains" description="Realised gain / loss grouped by financial year and gain type." padded={false}>
        <DataTable columns={realisedCols} rows={realisedSummary} emptyMessage="No realised gains for the current filters." />
      </Card>

      <Card title="Unrealised Holdings" description="Open positions valued at latest price (where available)." padded={false}>
        <DataTable columns={holdingCols} rows={filteredHoldings} emptyMessage="No holdings for the current filters." />
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card title="Open Lots" description="FIFO buy lots still held." padded={false}>
          <DataTable columns={openCols} rows={filteredOpen} rowKey="buyTradeId" emptyMessage="No open lots." />
        </Card>
        <Card title="Closed Lots" description="Matched buy → sell lots with realised gain." padded={false}>
          <DataTable columns={closedCols} rows={filteredClosed} emptyMessage="No closed lots." />
        </Card>
      </div>

      <Card title="Trade History" description="Normalised trade book across all imported sources." padded={false}>
        <DataTable columns={tradeCols} rows={filteredTrades} emptyMessage="No trades for the current filters." />
      </Card>

      <Card title="Import Batches" description="Historical trade imports feeding the ledger." padded={false}>
        <DataTable columns={batchCols} rows={batches} emptyMessage="No import batches." />
      </Card>
    </div>
  );
}
