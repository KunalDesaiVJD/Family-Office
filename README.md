# Family Wealth OS

A private family wealth command centre, architected as a future multi-tenant SaaS product.
This repository currently contains the **frontend foundation** built on mock data only —
no real broker APIs, trading, database, or credential flows are connected.

## Tech Stack

- **Next.js** (App Router)
- **React** + **TypeScript**
- **Tailwind CSS** (custom Enterprise Blue Green theme)
- Component-based architecture with typed, separated mock data

## Getting Started

```bash
npm install
npm run dev      # http://localhost:3000  (redirects to /dashboard)
npm run lint
npm run build
```

## Architecture

```
src/
  app/                 App Router routes
    (app)/             Authenticated shell (Sidebar + Topbar) route group
      dashboard/       Executive command centre
      family/          Family Members
      broker-hub/      Demat & broker connections
      mutual-funds/    Mutual fund folios
      bank-balances/   Bank accounts
      tally-sync/      Tally company reconciliation
      insurance-vault/ Insurance policies
      tax-centre/      Tax reports & filings
      document-vault/  Secure documents
      ai-desk/         AI exception summaries
      workflow-centre/ Approvals & audit
      admin-settings/  Tenant, roles, feature flags
  components/
    layout/            AppShell, Sidebar, Topbar
    ui/                Card, Badge, Button, MetricCard, ModuleCard,
                       PageHeader, DataTable, EmptyState
    icons.tsx          Inline enterprise line icons (no icon dependency)
  data/                Mock data (mockDashboard, mockFamily, ...)
  types/               Domain types (tenant, family, broker, portfolio, ...)
  lib/                 nav config + formatting helpers
```

## SaaS-Ready by Design

Although the first tenant is only **CrownGlobe Family**, every model carries a
`tenantId` and the domain layer models Tenants, Legal Entities, Roles, Feature
Flags, Audit Logs, Approvals, and connector-based integrations — so the same
codebase can onboard additional families/offices without a rewrite.

## Security

No real credentials, keys, OTPs, or documents are stored in this repository.
See `.env.example` for placeholder configuration only.
