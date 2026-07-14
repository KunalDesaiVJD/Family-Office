# Deployment Guide — Family Wealth OS

This document explains how to deploy the **Family Wealth OS** frontend to
[Vercel](https://vercel.com). The app is a Next.js 15 (App Router) project that
currently runs on **mock data only** — no database, no authentication, and no
real broker/API connections. There is no Bank Balance module and no AI Desk
module in the current version.

> **Bottom line:** this app requires **zero environment variables** to build and
> run. You can import it into Vercel and deploy with no configuration.

---

## 1. Architecture & hosting model

- **Frontend (this repo)** → hosted on **Vercel** (Next.js serverless/edge).
- **Future connector backend** (broker/Tally integrations) → will be hosted
  **separately** (e.g. a container/VM) if a **static outbound IP** is required by
  a broker API. That backend is **out of scope** for this deployment.
- The frontend talks to that future backend over HTTPS via a server-only base URL
  (`BROKER_CONNECTOR_BASE_URL`, etc.) — never directly from the browser, and never
  with embedded credentials.

---

## 2. Prerequisites

- A **GitHub** account with this repository pushed:
  `https://github.com/KunalDesaiVJD/Family-Office`
- A **Vercel** account (free "Hobby" tier is sufficient for previews/production).
- Node.js **≥ 18.18** locally (the repo pins `engines.node` and `.nvmrc` → `22`).

Verify locally before deploying:

```bash
npm install
npm run lint    # ESLint — must pass
npm run build   # Production build — must pass
```

---

## 3. Connect GitHub to Vercel

1. Sign in to Vercel and go to **Add New… → Project**.
2. Click **Continue with GitHub** and authorize the Vercel GitHub App.
3. Grant access to the **`KunalDesaiVJD/Family-Office`** repository
   (either "All repositories" or select just this one).

---

## 4. Import the project

1. In Vercel, find **`Family-Office`** in the import list and click **Import**.
2. **Framework Preset:** Vercel auto-detects **Next.js** — leave it as detected.
3. **Root Directory:** `./` (repo root — leave default).
4. Click **Deploy**. That's it — no overrides needed.

---

## 5. Build & output settings (all auto-detected)

You do **not** need to change any of these — Vercel's Next.js preset sets them:

| Setting | Value |
|---|---|
| Framework Preset | **Next.js** |
| Install Command | `npm install` (uses committed `package-lock.json`) |
| Build Command | `next build` |
| Output Directory | `.next` (managed by Vercel; do **not** set to `out`) |
| Node.js Version | **22.x** (from `.nvmrc` / `engines.node`) |

There is **no `vercel.json`** in this repo — and none is needed. The default
Next.js preset handles routing, the `(app)` route group, the `/` → `/dashboard`
redirect, and static prerendering of all pages. Do **not** add
`output: 'export'` to `next.config.mjs` — static export would break the
top-level `redirect()`.

---

## 6. Environment variables

**None are required for this build.** The app reads no `process.env` values at
runtime — leave Vercel's Environment Variables empty and it will build and run.

When integrations are added later, use **Project → Settings → Environment
Variables** and follow the split documented in [`.env.example`](.env.example):

- **Public (safe):** only values prefixed `NEXT_PUBLIC_` — e.g. app name, default
  tenant slug. These are **inlined into the browser bundle and visible to anyone**.
- **Server-only (secret):** database URLs, `AUTH_SECRET`, connector base URLs,
  `ANTHROPIC_API_KEY`, etc. **Never** prefix these with `NEXT_PUBLIC_`.

Set each variable for the environments you need: **Production**, **Preview**, and
**Development**.

### Why real API secrets must NOT go in frontend public variables

- Any variable prefixed **`NEXT_PUBLIC_`** is **compiled into the JavaScript that
  ships to every visitor's browser**. It is trivially readable via DevTools or by
  viewing the bundle — it is **not** a secret.
- Therefore **broker API keys, TOTP secrets, `AUTH_SECRET` and database URLs must
  never be `NEXT_PUBLIC_`.** Doing so leaks them to the public and would let
  anyone impersonate the app or drain quotas.
- Secrets belong **only** on the server: read them in Server Components / Route
  Handlers / a separate backend, keep them as **unprefixed** (server-only) Vercel
  env vars, and expose functionality through your own server endpoints.
- Real broker credentials should live in a **dedicated secrets vault** behind
  the connector backend — not in env vars and never in the frontend.

---

## 7. Preview deployments

Vercel automatically creates a **Preview deployment** for every push to a
non-production branch and every pull request:

- Push a branch (e.g. `feature/ui-shell`) → Vercel builds a unique preview URL.
- Open a PR → Vercel comments the preview link on the PR.
- Each preview is isolated and uses the **Preview** scoped env vars (none needed
  here).

Use previews to review changes before promoting to production.

---

## 8. Production deployment

The **Production Branch** (Project → Settings → Git) defaults to the repo's
**default branch**. Two options:

- **Option A (recommended):** merge your work into **`main`** and set `main` as the
  Production Branch. Every push to `main` then deploys to production.
  ```bash
  git checkout -b main            # if main doesn't exist yet
  git merge feature/ui-shell
  git push -u origin main
  # then in Vercel: Settings → Git → Production Branch = main
  ```
- **Option B (quick):** set the Production Branch to **`feature/ui-shell`** so the
  current branch deploys to production directly.

You can also **promote any preview** to production from the Vercel dashboard
(**Deployments → ⋯ → Promote to Production**).

---

## 9. Custom domain (optional)

Project → **Settings → Domains → Add** a domain (e.g. `app.vjdesai.com`) and
follow Vercel's DNS instructions (CNAME/A record). HTTPS is provisioned
automatically.

---

## 10. Rollback

Every deployment is immutable. To roll back: **Deployments →** pick a previous
good deployment **→ ⋯ → Promote to Production**.

---

## 11. Post-deploy smoke check

After the first deploy, verify:

- `/` redirects to `/dashboard`.
- All module routes load (`/family`, `/broker-hub`, `/mutual-funds`,
  `/insurance-vault`, `/tax-centre`, `/tax-centre/imports`, `/reconciliation`,
  `/tally-sync`, `/document-vault`, `/workflow-centre`, `/admin-settings`).
- `/bank-balances` and `/ai-desk` return **404** — both modules are out of scope.
- "Last synced" timestamps show **IST** (the app pins `Asia/Kolkata`, so times are
  correct even though Vercel builds in UTC).
- The browser tab shows the brand favicon.

---

## Notes

- Security: no real credentials, keys, OTPs, or documents are stored in this repo.
  See [`.env.example`](.env.example) for placeholder configuration only.
- Do **not** connect real broker APIs, trading, billing, or a database from the
  frontend — those belong in the separate connector backend.
