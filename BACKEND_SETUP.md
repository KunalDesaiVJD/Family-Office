# Backend Setup — `apps/api`

The backend (`apps/api`) is a small **Express + TypeScript** service. It is the
**only** place broker APIs are called — the browser never talks to Angel One
directly. It is **read-only** and **trading is disabled**.

It is a **standalone package** (its own `package.json`, lint and build) and is
deliberately **not** part of the Next.js frontend build or the Vercel deploy.
Host it separately (a VM/container) — this is also where a **static outbound IP**
lives if a broker requires one.

## Run locally

```bash
cd apps/api
npm install
cp .env.example .env          # fill locally; never commit real values
npm run dev                   # http://localhost:8080
npm run lint
npm run build && npm start
```

Health check:

```bash
curl http://localhost:8080/health
# { "status": "ok", "readOnlyMode": true, "angelConfigured": false, "tradingEnabled": false, ... }
```

## Environment (`apps/api/.env.example`)

| Var | Purpose |
|---|---|
| `PORT` | Server port (default 8080) |
| `NODE_ENV` | `development` / `production` |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated |
| `ANGEL_API_BASE_URL` | Angel SmartAPI base URL |
| `ANGEL_API_KEY` | Angel SmartAPI key (server-only secret) |
| `ANGEL_CLIENT_CODE` | Angel client code |
| `ANGEL_READ_ONLY_MODE` | `true` (default) |
| `INTERNAL_API_KEY` | Guards the internal session endpoint (leave blank to disable) |

The frontend receives **none** of these — only a safe view (`readOnlyMode`,
`angelConfigured`, `tradingEnabled`) via `/health`.

## Architecture

```
src/
  index.ts                entry — load env, build connector + server, listen
  server.ts               Express app (security headers, CORS, json, routes)
  config/env.ts           secure env config (secrets never logged/returned)
  errors.ts               typed AppErrors (incl. TradingDisabledError)
  lib/                    logger, fetch httpClient (timeout + error mapping)
  middleware/             cors (frontend-only), tenant (X-Tenant-Id), rateLimit
                          (placeholder), errorHandler
  connectors/             BrokerConnector interface, AngelOneConnector, sessionStore
  services/               syncLog, auditLog
  routes/                 health, broker (read-only + internal session + logout)
```

## Endpoints

- `GET /health` — status + safe config.
- Tenant-aware (require `X-Tenant-Id` header), rate-limited, under `/api/v1/broker`:
  - `GET /profile` `GET /holdings` `GET /funds` `GET /positions` `GET /orders`
    `GET /trades` `GET /ledger` `GET /symbol-master`
  - `POST /session` — **internal** (requires `X-Internal-Key`); authenticates
    server-side and caches the session. Never called from the browser; never
    returns tokens.
  - `POST /logout` — clears the server-side session.
  - `POST /orders`, `POST /orders/modify`, `POST /orders/cancel` — always return
    `403 Trading is disabled in this version.`

## Request flow (no browser → broker)

```
Browser ──(X-Tenant-Id, user auth)──▶ apps/api ──(server-side session)──▶ Angel One
                                          │
                                          └─ sync log + audit log per call
```

## Deploying separately

Build (`npm run build`) and run `npm start` (Node ≥ 18.18) on a host with a
stable/static outbound IP. Set `FRONTEND_URL` to your Vercel domain
(e.g. `https://familyoffice-ten.vercel.app`) so CORS admits only that origin.
Put `ANGEL_*` and `INTERNAL_API_KEY` in the host's secret manager — never in the
repo.

## Where real credentials go later

- `ANGEL_API_KEY` / `ANGEL_CLIENT_CODE` / `ANGEL_API_BASE_URL` → the **host's
  environment / secret manager** (never committed).
- The broker **login PIN/MPIN, OTP and TOTP secret** are **never stored**. They
  are pulled from a secure vault at request time, passed transiently to
  `authenticate()`, exchanged for short-lived tokens, and discarded. Only the
  session tokens live (server-side, in `sessionStore` — swap for Redis in prod).
