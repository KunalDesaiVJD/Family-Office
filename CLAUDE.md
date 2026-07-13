# Family Wealth OS - Claude Code Instructions

## Project Objective

We are building Family Wealth OS, a private family wealth dashboard that must be architected as a future SaaS product.

The first version is for one family only, but all code, data structures, routes, components and naming must remain SaaS-ready.

This product consolidates:
- Demat accounts
- Broker balances
- Mutual funds
- Bank balances
- Tally balances
- Insurance policies
- Documents
- Tax reports
- AI exception summaries
- Future controlled trading

## Current Build Scope

Build only the frontend foundation and mock-data dashboard first.

Do not connect real broker APIs.
Do not implement real trading.
Do not store passwords.
Do not create unsafe credential flows.
Do not add live financial API calls.
Do not add payment billing yet.
Do not hardcode private financial credentials.

## Tech Stack

Use:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- Component-based architecture
- Mock data files for now

Avoid:
- Unnecessary external UI kits
- Heavy animation libraries
- Crypto-style design
- Consumer app look
- Hardcoded single-user logic
- Any real API secret

## UI Theme

Follow the approved Enterprise Blue Green theme.

Theme values:
- Background: #f5f7fb
- Main text: #111827
- Muted text: #667085
- Border: #e5e7eb
- Brand navy: #13284c
- Royal blue: #1e40af
- Bright blue: #2563eb
- Accent green: #10b981
- Danger red: #ef4444
- Warning amber: #f59e0b
- Sidebar top: #08162d
- Sidebar middle: #0d1d39
- Sidebar bottom: #071225
- Sidebar text: #eaf0ff

Visual style:
- Enterprise SaaS dashboard
- Family office command centre
- Bank-grade clarity
- Premium financial UI
- Soft shadows
- Large rounded cards
- Clean tables
- Executive summaries
- No emojis in production UI
- No cartoon elements
- No loud gradients except the approved soft background and sidebar

## SaaS-Ready Rules

Every future data model must support:
- tenant_id
- user roles
- audit logs
- feature flags
- future billing plans
- connector-based integrations

Even though the first tenant is only "V J Desai Family", do not build the app as a hardcoded single-family tool.

Use these concepts:
- Tenant
- Family member
- Legal entity
- PAN
- Broker account
- Demat account
- Mutual fund folio
- Bank account
- Insurance policy
- Tally company
- Document
- Exception
- Approval
- Audit log

## First UI Modules

Create screens for:
- Dashboard
- Family Members
- Broker Hub
- Mutual Funds
- Bank Balances
- Tally Sync
- Insurance Vault
- Tax Centre
- Document Vault
- AI Desk
- Workflow Centre
- Admin Settings

## Component Rules

Create reusable components:
- AppShell
- Sidebar
- Topbar
- PageHeader
- MetricCard
- ModuleCard
- Card
- Badge
- Button
- DataTable
- EmptyState

Keep components clean, typed and reusable.

## Code Quality Rules

Use TypeScript types.
Use clean naming.
Use small components.
Keep mock data separate from UI components.
Avoid duplication.
Run lint and build before final answer.
Explain what files were created or changed after each session.

## Security Rules

Never commit:
- Broker credentials
- API keys
- OTPs
- TOTP secrets
- Bank credentials
- Tally credentials
- Personal documents
- Production secrets

Use `.env.example` only.
