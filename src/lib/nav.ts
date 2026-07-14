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
  /** Render as a collapsible group — collapsed unless a child route is active. */
  collapsible?: boolean;
}

/** Primary navigation. Grouped for enterprise scannability. Paths come from
 * the shared ROUTES constants so there is a single source of truth.
 *
 * Bank Balances and AI Desk are deliberately NOT in the navigation — both are
 * out of scope for the current V J Desai Family version. */
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
      { label: "Workflow Centre", href: ROUTES.workflowCentre, icon: "workflow" },
    ],
  },
  {
    title: "Master Data",
    collapsible: true,
    items: [
      { label: "Family Members", href: ROUTES.masters.familyMembers, icon: "family" },
      { label: "Legal Entities", href: ROUTES.masters.legalEntities, icon: "shield" },
      { label: "PAN Mapping", href: ROUTES.masters.panMapping, icon: "admin" },
      { label: "Broker Accounts", href: ROUTES.masters.brokerAccounts, icon: "broker" },
      { label: "Demat Accounts", href: ROUTES.masters.dematAccounts, icon: "funds" },
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
