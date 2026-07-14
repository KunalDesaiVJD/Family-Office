import type { DocumentCategoryRecord } from "@/types/master";
import type { DocumentCategory } from "@/types/document";
import { TENANT_ID } from "./tenant";
import { vaultDocuments } from "./mockDocuments";

const inUse: {
  code: DocumentCategory;
  label: string;
  description: string;
  retentionMonths: number;
}[] = [
  {
    code: "statement",
    label: "Account Statements",
    description: "Broker, bank and consolidated account statements.",
    retentionMonths: 96,
  },
  {
    code: "contract_note",
    label: "Contract Notes",
    description: "Trade confirmations and contract notes from brokers.",
    retentionMonths: 96,
  },
  {
    code: "policy",
    label: "Insurance Policies",
    description: "Policy documents, schedules and renewal notices.",
    retentionMonths: 120,
  },
  {
    code: "legal",
    label: "Legal & Incorporation",
    description: "MOA/AOA, deeds, agreements and legal filings.",
    retentionMonths: 240,
  },
  {
    code: "tax",
    label: "Tax Records",
    description: "Form 26AS, computations and filed returns.",
    retentionMonths: 96,
  },
  {
    code: "kyc",
    label: "KYC & Identity",
    description: "PAN, Aadhaar and KYC verification documents.",
    retentionMonths: 120,
  },
];

export const documentCategories: DocumentCategoryRecord[] = [
  ...inUse.map((c) => ({
    id: `cat_${c.code}`,
    tenantId: TENANT_ID,
    code: c.code,
    label: c.label,
    description: c.description,
    retentionMonths: c.retentionMonths,
    documentCount: vaultDocuments.filter((d) => d.category === c.code).length,
    status: "active" as const,
  })),
  {
    id: "cat_board",
    tenantId: TENANT_ID,
    code: "board",
    label: "Board & Governance",
    description: "Board minutes, resolutions and governance records.",
    retentionMonths: 240,
    documentCount: 0,
    status: "draft",
  },
  {
    id: "cat_banking_mandate",
    tenantId: TENANT_ID,
    code: "banking_mandate",
    label: "Banking Mandates",
    description: "Signatory mandates and authorisation letters.",
    retentionMonths: 120,
    documentCount: 4,
    status: "archived",
  },
];
