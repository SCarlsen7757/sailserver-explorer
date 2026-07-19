---
name: verify
description: Build, launch, and drive SailServer Explorer to verify changes end-to-end.
---

# Verifying SailServer Explorer

React 19 + Vite SPA, no test framework. Verification is done by driving the app in a real browser.

## Launch

```powershell
npm run dev   # serves http://localhost:5173/sailserver-explorer/ (note the base path)
```

`npm run lint` and `npm run build` catch wiring mistakes but are not verification.

## Drive

No browser extension needed: use Playwright with the system Chrome. Install `playwright-core` in the scratchpad (NOT the repo) and launch with `chromium.launch({ channel: 'chrome', headless: true })`.

Key facts for scripting:

- The SailServer API is a single POST endpoint `https://app.sailserver.com/mod/api.php` with body `{ apikey, cmd, trackid }`. Intercept it with `page.route(...)` and return envelopes `{ statuscode: 200, cmd, data }` (errors: non-200 statuscode + `message`). This lets you exercise every flow without a real API key.
- The app is hash-routed (`#/explore/boat`, `#/tools/csv-export`, …). API key goes in the header form (`.apikey-input` + submit); it is kept in `sessionStorage` under `sailserver-apikey`.
- Panels render only after a key is set (`AppLayout` gates its `<Outlet/>`).
- CSV export downloads need `browser.newContext({ acceptDownloads: true })` + `page.waitForEvent('download')`.
- Track start/stop times are local `"YYYY-MM-DD HH:MM"` strings; track points use `utc "YYYY-MM-DD HH:MM:SS"` + unix `tim`.

A working full-flow script (routes, key gate, export happy path + failure/cancel/empty probes) was used in July 2026; pattern: mock `gettracks`/`gettrack`, fill the two `input[type=date]`, click Export, assert downloaded CSV content and `.export-result` / `.error` / `.empty-state` messages.
