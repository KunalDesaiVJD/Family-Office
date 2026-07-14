import type { DocumentCategoryRecord } from "@/types/master";
import type { DocumentCategory } from "@/types/document";
import { TENANT_ID } from "./tenant";
import { vaultDocuments } from "./mockDocuments";

// Visible document categories for the current version. A "Bank statement"
// category is deliberately NOT offered — bank documents are out of scope.

const categories: {
  code: DocumentCategory;
  label: string;
  description: string;
  retentionMonths: number;
}[] = [
  {
    code: "angel_contract_note",
    label: "Angel Contract Note",
    description: "Trade confirmations and contract notes from Angel One.",
    retentionMonths: 96,
  },
  {
    code: "angel_ledger",
    label: "Angel Ledger",
    description: "Broker ledger extracts used for funds reconciliation.",
    retentionMonths: 96,
  },
  {
    code: "angel_trade_report",
    label: "Angel Trade Report",
    description: "Trade book exports feeding the portfolio ledger.",
    retentionMonths: 96,
  },
  {
    code: "angel_holding_report",
    label: "Angel Holding Report",
    description: "Broker holding statements used for holding reconciliation.",
    retentionMonths: 96,
  },
  {
    code: "cas_statement",
    label: "CAS Statement",
    description: "Consolidated account statements across depositories.",
    retentionMonths: 96,
  },
  {
    code: "mutual_fund_statement",
    label: "Mutual Fund Statement",
    description: "Folio-level statements and SIP confirmations.",
    retentionMonths: 96,
  },
  {
    code: "insurance_policy",
    label: "Insurance Policy",
    description: "Policy documents, schedules and renewal notices.",
    retentionMonths: 120,
  },
  {
    code: "tally_export",
    label: "Tally Export",
    description: "Ledger and voucher exports from Tally companies.",
    retentionMonths: 96,
  },
  {
    code: "tax_report",
    label: "Tax Report",
    description: "Form 26AS, capital-gain schedules and filed returns.",
    retentionMonths: 96,
  },
  {
    code: "other",
    label: "Other",
    description: "Deeds, agreements and any document outside the above.",
    retentionMonths: 240,
  },
];

export const documentCategories: DocumentCategoryRecord[] = categories.map((c) => ({
  id: `cat_${c.code}`,
  tenantId: TENANT_ID,
  code: c.code,
  label: c.label,
  description: c.description,
  retentionMonths: c.retentionMonths,
  documentCount: vaultDocuments.filter((d) => d.category === c.code).length,
  status: "active" as const,
}));
