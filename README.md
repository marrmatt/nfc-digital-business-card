# NFC Digital Business Card

A mobile-friendly, single-file digital business-card **frontend prototype**. It is not a production service.

## Open the prototype

From the repository root, serve the files with Python:

```sh
python -m http.server 8000
```

Then open [http://localhost:8000/TapSync%20%E2%80%94%20App%20Prototype%20(1).html](http://localhost:8000/TapSync%20%E2%80%94%20App%20Prototype%20(1).html) in a modern browser. Serving it over localhost gives browser storage a predictable origin.

## What this demo does

- Lets you explore the landing page and dashboard with sample data.
- Supports local profile editing, themes, links/services, contact exchange, VCF export, and JSON backup.
- Saves supported edits in this browser's local storage when browser storage is available.

## Explicit prototype limits

- Sign-in/sign-up only opens the demo. **No account is created and no authentication occurs.** Google sign-in and password reset are not connected. Do not enter real passwords or credentials.
- The profile address is a local draft only. There is no public profile route or online publishing, so public-link copy/share and profile QR generation/printing are intentionally unavailable.
- NFC card writing, Google Contacts sync, billing, renewal, backend/database sync, and cross-device sync are not connected.
- Local data may be lost if browser site data is cleared or storage is unavailable/full. A JSON backup can be downloaded; an import/restore flow is not implemented.
- Sample identity/contact details and sample analytics remain in the public prototype source. Review them before presenting the repository or demo more widely.
- Google Fonts and a Cloudflare Web Analytics script make third-party requests. Their runtime/network behavior and privacy suitability have not been browser-tested.

## Source-level regression checks

Requires Node.js; no third-party packages are needed:

```sh
node --test tests/prototype-static.test.mjs
```

These checks parse the embedded HTML/inline JavaScript and assert key preview-only safety guards. They do **not** execute the UI or replace real browser, mobile, accessibility, or network testing.

## Manual smoke-test checklist

- [ ] Open the landing page and enter demo mode using sample credentials only.
- [ ] Confirm Google sign-in and password reset display an explicit not-connected message.
- [ ] Edit profile details, themes, links, and services; refresh and verify local persistence.
- [ ] Confirm the draft address is labelled not published and public QR/share controls are unavailable.
- [ ] Test contact exchange, search/pagination, VCF export, and JSON backup.
- [ ] Check a narrow Android viewport, keyboard/focus behavior, contrast, console errors, and external requests.
