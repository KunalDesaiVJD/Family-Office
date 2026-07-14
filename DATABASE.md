# Database & Auth Foundation — Family Wealth OS

This project ships a **SaaS-ready PostgreSQL schema (Prisma)** and a **mock
authentication foundation**. Both are *foundations only* — the running app
still renders on mock data and does **not** connect to a database. Nothing here
adds real APIs, credentials, or bank sync.

## Contents

- `prisma/schema.prisma` — the multi-tenant schema (25 models).
- `prisma/seed.ts` — V J Desai Family seed data.
- `src/lib/db.ts` — server-only Prisma client singleton.
- `src/auth/*` — roles, mock session, tenant-aware React context, permission helper.
- `src/app/login`, `src/app/access-denied` — auth scaffolds.

---

## 1. Prerequisites

- **PostgreSQL 14+** (local Docker, Supabase, Neon, RDS, etc.).
- Node 18.18+ (already pinned via `.nvmrc`).

## 2. Configure the connection

Copy the template and set your connection string (never commit real values):

```bash
cp .env.example .env.local        # or .env
```

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/family_wealth_os?schema=public"
```

> The URL is read **only** from the environment (`env("DATABASE_URL")` in the
> schema). The mock UI builds and runs with this unset.

## 3. Generate the client

```bash
npm run prisma:generate      # prisma generate
```

This runs automatically on `npm install` (via `postinstall`) and on Vercel
builds — it does **not** require `DATABASE_URL`.

## 4. Create the schema (migrations)

**Local / development** — creates the database tables and a migration history:

```bash
npm run prisma:migrate       # prisma migrate dev  (prompts for a migration name, e.g. "init")
```

**Production / CI** — applies committed migrations without prompting:

```bash
npm run prisma:deploy        # prisma migrate deploy
```

## 5. Seed the V J Desai Family data

```bash
npm run prisma:seed          # prisma db seed  →  tsx prisma/seed.ts
```

Seeds subscription plans, permissions, the six roles, the tenant, users,
family members, entities, PAN profiles, broker/demat accounts, folios,
policies, Tally companies + ledgers, documents, instruments + holding
snapshots, feature flags, a reconciliation run + exceptions, approvals and
audit logs. Re-runnable (uses `skipDuplicates` / `upsert`).

## 6. Inspect (optional)

```bash
npm run prisma:studio        # prisma studio
```

---

## Schema conventions

- **Multi-tenant:** every customer-owned table has `tenantId` with a cascading
  `Tenant` relation and a `@@index([tenantId])`.
- **Timestamps:** every table has `createdAt` + `updatedAt`.
- **Imports:** imported records carry `externalSource` + `externalId`.
- **Status:** status enums are present where the domain has one
  (`connectionStatus`, `status`, `syncState`, `stage`, …).
- **Reference tables** (`SubscriptionPlan`, `Role`, `Permission`, `Instrument`)
  are platform-owned and therefore have **no** `tenantId`.

## Security

- **No secrets stored:** the schema stores **no** passwords, PINs, OTPs or TOTP
  secrets. `User` holds identity only — authentication is delegated to an
  external provider (`externalSource` / `externalId`).
- **No broker credentials:** `BrokerAccount.credentialRef` is an *opaque pointer*
  to an external secrets vault — never the credential itself.
- **No document bodies:** `Document.storageRef` points at encrypted object
  storage; contents are not stored in the DB.
- There is **no BankAccount model** and **no bank sync** by design — the Bank
  Balance module is out of scope for the current version.
- There is **no AI model, provider or prompt table** — the AI Desk module is out
  of scope for the current version.

---

## Authentication foundation (mock)

Real auth is **not** wired up. A development-only mock session
(`src/auth/mockAuth.ts`) signs the app in as **Kunal Desai — Family Admin** so
the UI renders normally.

- **Roles** (`src/auth/roles.ts`, seeded into `Role`): Family Admin, Trader,
  Accountant, Viewer, Reviewer, Developer Support.
- **Tenant-aware context:** `src/auth/AuthContext.tsx` (`AuthProvider` wraps the
  app shell; `useAuth()` exposes `session`, `role`, `roleLabel`, `can()`).
- **Permission helper:** `appRoleCan(role, permission)` (server or client) and
  `useAuth().can(permission)` (client).
- **Scaffolds:** `/login` (mock sign-in) and `/access-denied`.

When wiring a real provider (e.g. Auth.js / Clerk / Cognito), replace
`MOCK_SESSION` with the authenticated session and resolve the user + role from
the database via `src/lib/db.ts`.

---

## Vercel notes

- The build runs `prisma generate` automatically (via `postinstall`) — no
  `DATABASE_URL` needed to build.
- **Migrations are not run during the Vercel build.** Run
  `npm run prisma:deploy` against your database from CI or locally.
- Only set `DATABASE_URL` in Vercel (Project → Settings → Environment Variables)
  once you actually switch live data on. Keep it server-only (never
  `NEXT_PUBLIC_`).
