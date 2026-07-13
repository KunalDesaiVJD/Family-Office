import type { IconName } from "@/components/icons";

export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Primary navigation. Grouped for enterprise scannability. */
export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: "dashboard" }],
  },
  {
    title: "Wealth",
    items: [
      { label: "Family Members", href: "/family", icon: "family" },
      { label: "Broker Hub", href: "/broker-hub", icon: "broker" },
      { label: "Mutual Funds", href: "/mutual-funds", icon: "funds" },
      { label: "Bank Balances", href: "/bank-balances", icon: "bank" },
      { label: "Insurance Vault", href: "/insurance-vault", icon: "insurance" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Tally Sync", href: "/tally-sync", icon: "tally" },
      { label: "Tax Centre", href: "/tax-centre", icon: "tax" },
      { label: "Document Vault", href: "/document-vault", icon: "documents" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "AI Desk", href: "/ai-desk", icon: "ai" },
      { label: "Workflow Centre", href: "/workflow-centre", icon: "workflow" },
    ],
  },
  {
    title: "System",
    items: [{ label: "Admin Settings", href: "/admin-settings", icon: "admin" }],
  },
];

export const navItems: NavItem[] = navSections.flatMap((s) => s.items);
