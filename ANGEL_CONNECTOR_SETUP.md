# Angel One Connector Setup (Read-Only)

The `AngelOneConnector` (`apps/api/src/connectors/angelOne.ts`) integrates the
**Angel One SmartAPI** in **read-only** mode. **Trading is disabled** — order
placement/modification/cancellation are placeholders that always return
`403 Trading is disabled in this version.`

## Prerequisites

1. An Angel One SmartAPI app (get an **API key** from the SmartAPI dashboard).
2. Your **client code**.
3. A TOTP secret for login — kept in a **secure vault**, NOT in this repo.

## Configure (server-side only)

In `apps/api/.env` (or the host's secret manager):

```
ANGEL_API_BASE_URL=https://apiconnect.angelone.in
ANGEL_API_KEY=<your-smartapi-key>
ANGEL_CLIENT_CODE=<your-client-code>
ANGEL_READ_ONLY_MODE=true
```

When these are unset the connector reports `angelConfigured: false` and read
calls return `503 NOT_CONFIGURED` — the app still builds and runs.

## Authentication flow (no secrets stored)

```
1. A secure vault holds the client code + MPIN + TOTP secret.
2. An authorized server-side process generates a fresh TOTP and calls
   POST /api/v1/broker/session (with X-Internal-Key) — from the backend, never
   the browser.
3. AngelOneConnector.authenticate({ clientCode, password, totp }) exchanges them
   for jwtToken / refreshToken / feedToken. The PIN/OTP/TOTP are used once and
   discarded — never persisted or logged.
4. The short-lived session is cached server-side (sessionStore) keyed by tenant.
5. Read endpoints use that session; refreshSession() renews it; logout() clears it.
```

## Read-only methods

| Method | Angel endpoint |
|---|---|
| `authenticate` | `POST /rest/auth/angelbroking/user/v1/loginByPassword` |
| `refreshSession` | `POST /rest/auth/angelbroking/jwt/v1/generateTokens` |
| `getProfile` | `GET /rest/secure/angelbroking/user/v1/getProfile` |
| `getHoldings` | `GET /rest/secure/angelbroking/portfolio/v1/getAllHolding` |
| `getFunds` | `GET /rest/secure/angelbroking/user/v1/getRMS` |
| `getPositions` | `GET /rest/secure/angelbroking/order/v1/getPosition` |
| `getOrders` | `GET /rest/secure/angelbroking/order/v1/getOrderBook` |
| `getTrades` | `GET /rest/secure/angelbroking/order/v1/getTradeBook` |
| `getSymbolMaster` | public OpenAPI scrip master JSON (no auth) |
| `logout` | `POST /rest/secure/angelbroking/user/v1/logout` |
| `getLedger` | *no SmartAPI read-only endpoint* → returns `501 NOT_SUPPORTED` until a statement source is wired |

## Disabled (always error)

`placeOrder`, `modifyOrder`, `cancelOrder` →
`403 { code: "TRADING_DISABLED", message: "Trading is disabled in this version." }`

Re-enabling trading is a **deliberate future step**: it would require lifting
`ANGEL_READ_ONLY_MODE`, implementing the order methods, and — importantly —
routing every order through the platform's maker-checker **Approval** workflow.

## Security summary

- **No** PIN, OTP or TOTP secret is stored anywhere in the repo or DB.
- **No** broker credentials are committed — API key/client code come from the
  environment; login secrets from a vault at request time.
- The frontend never receives tokens or secrets; it calls the backend, which
  holds the session server-side.
