import type { IconName } from "@/components/icons";
import { ROUTES } from "@/config/routes";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Primary navigation. Grouped for enterprise scannability. Paths come from
 * the shared ROUTES constants so there is a single source of truth. */
export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: ROUTES.dashboard, icon: "dashboard" }],
  },
  {
    title: "Wealth",
    items: [
      { label: "Family Members", href: ROUTES.family, icon: "family" },
      { label: "Broker Hub", href: ROUTES.brokerHub, icon: "broker" },
      { label: "Mutual Funds", href: ROUTES.mutualFunds, icon: "funds" },
      { label: "Bank Balances", href: ROUTES.bankBalances, icon: "bank" },
      { label: "Insurance Vault", href: ROUTES.insuranceVault, icon: "insurance" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Trade Import", href: ROUTES.taxImports, icon: "download" },
      { label: "Tax Centre", href: ROUTES.taxCentre, icon: "tax" },
      { label: "Reconciliation Centre", href: ROUTES.reconciliation, icon: "sync" },
      { label: "Tally Sync", href: ROUTES.tallySync, icon: "tally" },
      { label: "Document Vault", href: ROUTES.documentVault, icon: "documents" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI Desk", href: ROUTES.aiDesk, icon: "ai" },
      { label: "Workflow Centre", href: ROUTES.workflowCentre, icon: "workflow" },
    ],
  },
  {
    title: "Master Data",
    items: [
      { label: "Family Members", href: ROUTES.masters.familyMembers, icon: "family" },
      { label: "Legal Entities", href: ROUTES.masters.legalEntities, icon: "shield" },
      { label: "PAN Mapping", href: ROUTES.masters.panMapping, icon: "admin" },
      { label: "Broker Accounts", href: ROUTES.masters.brokerAccounts, icon: "broker" },
      { label: "Demat Accounts", href: ROUTES.masters.dematAccounts, icon: "funds" },
      { label: "Bank Accounts", href: ROUTES.masters.bankAccounts, icon: "bank" },
      { label: "Mutual Fund Folios", href: ROUTES.masters.mutualFundFolios, icon: "funds" },
      { label: "Insurance Policies", href: ROUTES.masters.insurancePolicies, icon: "insurance" },
      { label: "Tally Companies", href: ROUTES.masters.tallyCompanies, icon: "tally" },
      { label: "Document Categories", href: ROUTES.masters.documentCategories, icon: "documents" },
    ],
  },
  {
    title: "System",
    items: [{ label: "Admin Settings", href: ROUTES.adminSettings, icon: "admin" }],
  },
];

export const navItems: NavItem[] = navSections.flatMap((s) => s.items);
