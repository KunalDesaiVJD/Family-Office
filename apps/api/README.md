# @family-wealth-os/api

Backend service for Family Wealth OS. It is the **only** place broker APIs are
called — the browser never talks to Angel One directly. This service is
**read-only** and **trading is disabled**.

```bash
cd apps/api
npm install
cp .env.example .env      # fill locally; never commit real values
npm run dev               # http://localhost:8080/health
npm run lint
npm run build && npm start
```

See [`../../BACKEND_SETUP.md`](../../BACKEND_SETUP.md) and
[`../../ANGEL_CONNECTOR_SETUP.md`](../../ANGEL_CONNECTOR_SETUP.md).
