// Investment-accounting domain types. Customer-owned records carry tenantId.
// These types back the FIFO / capital-gain / reconciliation engines and the
// Tax Centre, Trade Import and Reconciliation Centre UIs. Mock data only.

export type TradeSource =
  | "angel_api"
  | "csv_upload"
  | "excel_upload"
  | "contract_note_pdf"
  | "manual_adjustment"
  | "mock";

export type TransactionType = "BUY" | "SELL";

export type ProductType = "DELIVERY" | "INTRADAY" | "MARGIN" | "FNO" | "OTHER";

export type GainType = "STCG" | "LTCG" | "INTRADAY" | "FNO" | "UNKNOWN";

export type ImportStatus =
  | "uploaded"
  | "validating"
  | "validated"
  | "awaiting_review"
  | "imported"
  | "partially_imported"
  | "rejected"
  | "failed";

export type ValidationSeverity = "error" | "warning";

// --- Import -----------------------------------------------------------------

/** A raw trade row as received from any source, before normalisation. */
export interface ImportedTrade {
  tenantId: string;
  familyMemberId: string;
  panId: string;
  brokerAccountId: string;
  dematAccountId?: string;
  clientCode: string;
  accountOwner: string;
  tradeDateTime: string;
  tradeDate?: string;
  orderId: string;
  tradeId: string;
  exchange: string;
  tradingSymbol: string;
  symbolToken?: string;
  isin?: string;
  buySell: string;
  productType?: string;
  quantity: number;
  price: number;
  grossAmount?: number;
  brokerage?: number;
  stt?: number;
  gst?: number;
  stampDuty?: number;
  exchangeCharges?: number;
  sebiCharges?: number;
  otherCharges?: number;
  netAmount?: number;
  settlementNumber?: string;
  contractNoteNumber?: string;
  source: TradeSource;
  importBatchId?: string;
  rawRowReference?: string;
}

export interface TradeValidationError {
  rowReference: string;
  field?: string;
  code: string;
  message: string;
  severity: ValidationSeverity;
}

export interface TradeImportRow {
  rowNumber: number;
  raw: ImportedTrade;
  status: "valid" | "invalid" | "duplicate";
  isDuplicate: boolean;
  errors: TradeValidationError[];
}

export interface TradeImportBatch {
  id: string;
  tenantId: string;
  source: TradeSource;
  fileName?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: ImportStatus;
  familyMemberId?: string;
  familyMemberName?: string;
  brokerAccountId?: string;
  clientCode?: string;
  financialYear?: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateRows: number;
  importedRows: number;
  rejectedRows: number;
  rows?: TradeImportRow[];
}

// --- Normalised trade -------------------------------------------------------

export interface NormalizedTrade {
  id: string;
  tenantId: string;
  familyMemberId: string;
  panId: string;
  brokerAccountId: string;
  clientCode: string;
  accountOwner: string;
  tradeDateTime: string;
  settlementDate?: string;
  exchange: string;
  tradingSymbol: string;
  isin: string;
  transactionType: TransactionType;
  productType: ProductType;
  quantity: number;
  price: number;
  grossAmount: number;
  totalCharges: number;
  netAmount: number;
  brokerage: number;
  stt: number;
  gst: number;
  stampDuty: number;
  exchangeCharges: number;
  sebiCharges: number;
  orderId: string;
  tradeId: string;
  contractNoteNumber?: string;
  source: TradeSource;
  createdAt: string;
  updatedAt: string;
}

// --- Lots -------------------------------------------------------------------

export interface PortfolioLot {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  panId: string;
  familyMemberId: string;
  accountOwner: string;
  isin: string;
  tradingSymbol: string;
  productType: ProductType;
}

export interface OpenLot extends PortfolioLot {
  buyTradeId: string;
  buyDate: string;
  buyPrice: number;
  originalQuantity: number;
  remainingQuantity: number;
  buyCharges: number;
  costValue: number;
}

export interface ClosedLot {
  id: string;
  tenantId: string;
  sellTradeId: string;
  buyTradeId: string;
  isin: string;
  tradingSymbol: string;
  quantitySold: number;
  buyDate: string;
  sellDate: string;
  buyPrice: number;
  sellPrice: number;
  costValue: number;
  sellValue: number;
  allocatedBuyCharges: number;
  allocatedSellCharges: number;
  realisedGainLoss: number;
  holdingDays: number;
  gainType: GainType;
  financialYear: string;
  accountOwner: string;
  clientCode: string;
  panId: string;
  brokerAccountId: string;
  productType: ProductType;
}

/** Raised by the FIFO engine when a sell has no matching open quantity. */
export interface FifoException {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  isin: string;
  tradingSymbol: string;
  sellTradeId: string;
  oversoldQuantity: number;
  message: string;
}

export interface FifoResult {
  openLots: OpenLot[];
  closedLots: ClosedLot[];
  exceptions: FifoException[];
}

// --- Capital gains ----------------------------------------------------------

export interface CapitalGainConfig {
  /** Holding > this many days is long-term (listed equity delivery). */
  ltcgThresholdDays: number;
}

export interface CapitalGainResult {
  tenantId: string;
  financialYear?: string;
  realisedGain: number;
  stcg: number;
  ltcg: number;
  intraday: number;
  fno: number;
  totalCharges: number;
  closedLotCount: number;
}

export type PriceMap = Record<string, number>;

export interface UnrealisedGainResult {
  total: number;
  pricedCount: number;
  pendingCount: number;
}

// --- Holdings ledger --------------------------------------------------------

export type PriceStatus = "priced" | "pending";

export interface HoldingRow {
  tenantId: string;
  brokerAccountId?: string;
  clientCode?: string;
  panId?: string;
  accountOwner?: string;
  isin: string;
  tradingSymbol: string;
  quantity: number;
  avgCost: number;
  investedValue: number;
  latestPrice?: number;
  marketValue?: number;
  unrealisedGain?: number;
  priceStatus: PriceStatus;
}

export interface PortfolioHoldingLedger {
  tenantId: string;
  accountHoldings: HoldingRow[];
  panHoldings: HoldingRow[];
  familyHoldings: HoldingRow[];
  openLots: OpenLot[];
  closedLots: ClosedLot[];
  realisedGain: CapitalGainResult;
  unrealisedGain: UnrealisedGainResult;
}

// --- Financial year ---------------------------------------------------------

export interface TaxFinancialYear {
  key: string;
  label: string;
  startDate: string;
  endDate: string;
  startYear: number;
  endYear: number;
}

// --- Reconciliation ---------------------------------------------------------

export type ReconciliationType =
  | "holding"
  | "funds"
  | "trade"
  | "contract_note"
  | "tally_broker_ledger";

export type ReconExceptionType =
  | "HOLDING_QUANTITY_MISMATCH"
  | "HOLDING_VALUE_MISMATCH"
  | "MISSING_TRADE"
  | "DUPLICATE_TRADE"
  | "TRADE_VALUE_MISMATCH"
  | "FUNDS_BALANCE_MISMATCH"
  | "CONTRACT_NOTE_MISSING"
  | "LEDGER_ENTRY_MISSING"
  | "SYMBOL_MAPPING_MISSING"
  | "PRICE_MISSING"
  | "UNKNOWN";

export type ReconExceptionStatus =
  | "Open"
  | "In Review"
  | "Waiting for Data"
  | "Resolved"
  | "Ignored";

export type ReconSeverity = "Low" | "Medium" | "High" | "Critical";

export type SuggestedAction =
  | "Import missing trade"
  | "Review contract note"
  | "Check Angel trade book"
  | "Check symbol/ISIN mapping"
  | "Review corporate action"
  | "Review manual adjustment"
  | "Confirm broker ledger"
  | "Assign to accountant"
  | "Mark as ignored with reason";

export type DifferenceType = "quantity" | "value" | "amount" | "missing" | "extra" | "none";

export interface ReconciliationRun {
  id: string;
  tenantId: string;
  type: ReconciliationType;
  status: "completed" | "running" | "failed";
  startedAt: string;
  finishedAt?: string;
  exceptionCount: number;
  note?: string;
}

export interface ReconciliationException {
  id: string;
  tenantId: string;
  reconciliationRunId: string;
  exceptionType: ReconExceptionType;
  severity: ReconSeverity;
  status: ReconExceptionStatus;
  entityType: string;
  entityId?: string;
  familyMemberId?: string;
  accountOwner?: string;
  brokerAccountId?: string;
  clientCode?: string;
  isin?: string;
  tradingSymbol?: string;
  expectedValue?: string | number;
  actualValue?: string | number;
  difference?: number;
  differenceType?: DifferenceType;
  suggestedReason?: string;
  suggestedAction?: SuggestedAction;
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

/** A single comparison result (used to build exceptions). */
export interface ReconciliationItem {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  isin?: string;
  tradingSymbol?: string;
  expected: number;
  actual: number;
  difference: number;
  match: boolean;
}

export interface BrokerHolding {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  accountOwner?: string;
  isin: string;
  tradingSymbol?: string;
  quantity: number;
}

export interface BrokerHoldingComparison extends ReconciliationItem {
  accountOwner?: string;
  brokerQuantity: number;
  internalQuantity: number;
}

export interface BrokerFunds {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  balance: number;
}

export interface CashLedgerComparison {
  tenantId: string;
  brokerAccountId: string;
  clientCode: string;
  brokerBalance: number;
  internalBalance: number;
  difference: number;
  match: boolean;
}

export interface ContractNoteLink {
  id: string;
  tenantId: string;
  contractNoteNumber: string;
  brokerAccountId: string;
  clientCode: string;
  tradeDate: string;
  documentId?: string;
  status: "linked" | "pending" | "missing";
  tradeIds: string[];
}
