# Day 1 — Prototype Hardening Audit

**Date:** 2026-11-05  
**Repository:** [marrmatt/nfc-digital-business-card](https://github.com/marrmatt/nfc-digital-business-card)  
**Inspected baseline:** `main` at `8a4495712e2430f52487edb6a412b8f99a65368d`  
**Working branch:** `prototype-hardening/day-1-audit-2026-11-05`

## Scope and safety

- Inspected the default branch, complete Git tree, README, prototype source, branch list, pull-request list, and reported commit statuses.
- No application code was changed. This report is the only Day 1 repository change, and it is on the working branch—not `main`.
- No deployment, merge, backend, database, or destructive operation was performed.

## Repository baseline

- The root tree contains only `README.md` (81 bytes) and `TapSync — App Prototype (1).html` (3,060,251 bytes according to GitHub file metadata).
- No repository instruction file (such as `AGENTS.md`), package manifest, test configuration, lint/build script, or `.github/workflows` directory is present in the inspected tree. The `.github` directory lookup returned 404.
- The README describes the project as a mobile-friendly digital business-card profile demo.
- The HTML file is a single-file shell containing two JSON-escaped HTML documents (landing page and dashboard), which the shell loads into two iframes through `srcdoc`. This makes the current prototype easy to carry as one file but difficult to review and maintain safely.
- The repository is public. GitHub reported `main` as unprotected, no open pull requests, and no status checks for the inspected main commit.
- Existing branch at inspection time: `main` and `verify-github-write-access-2026-11-04`. The dedicated Day 1 working branch was created from `main`.

## Feature inventory observed in source

### Landing page
- Marketing sections for features, how it works, sample cards, pricing, testimonials, and calls to action.
- Sign-in/sign-up form with basic client-side name, email, password-length, and password-match checks.
- Password visibility toggles and a Google sign-in button.

### Dashboard and profile prototype
- Dashboard navigation with sections for profile, design/theme, links/social, services, contacts, share/QR, preview, and settings.
- Profile fields, profile-photo selection, service CRUD with optional images, social-link toggles/edit/reorder, theme/accent/layout controls, and design undo.
- Contact-exchange form, local contact list/search/pagination, VCF export, QR generation/download/print, clipboard/native share, and local JSON backup download.
- English/Amharic language option and local browser persistence.
- The interface itself states that changes stay in this browser and that NFC, online publishing, billing, and Google sync require a connected backend.

## Baseline checks performed

- **Repository tree and entrypoints:** inspected via GitHub's tree and contents APIs.
- **Inline JavaScript syntax:** all 7 embedded inline script blocks (shell, landing page, and dashboard) passed a JavaScript syntax parse check. This only parses the code; it does not execute the application or prove that interactions work. The externally loaded Cloudflare script was not parsed.
- **Automated test/build/lint:** unavailable from the repository as currently structured; no manifest or test/build configuration was found.
- **Browser/mobile/accessibility/network testing:** not run in this inspection environment. No runtime pass is claimed.
- **CI:** no workflow files were present in the inspected tree and GitHub returned no status checks for the inspected main commit.

## Prioritized findings

### P1 — Resolve before presenting this as a live, customer-ready card

1. **Profile/share URL is a placeholder.** The default profile URL is `yourbrand.et/natnael`, and the sign-up demo derives similar `yourbrand.et/<first-name>` values. QR, share, and contact-card links use this value. The interface explicitly says online publishing is not connected. Until a real reachable domain and profile route exist, these links must be treated as preview-only.
2. **Authentication is simulated, not implemented.** The landing form performs client-side validation and sends a message to the shell to open the dashboard; it does not authenticate against a server. The Google button opens the same demo flow, and the forgot-password handler only prevents the default click. Do not use real passwords or describe these controls as production authentication.
3. **Check hard-coded demo identity data.** The public source contains realistic-looking personal contact, location, and social-profile defaults. Confirm these are intentionally public demo values; replace any private or inaccurate values before wider sharing.

### P2 — Address during hardening

4. **No repeatable automated quality gate.** There are no tests, build/lint scripts, or CI workflow in the repository, and `main` is not protected. Add lightweight verification and use the working branch for changes; do not merge automatically.
5. **Large, tightly coupled single-file structure.** The prototype HTML is about 3.06 MB and contains the landing page and dashboard as escaped HTML strings. The dashboard runtime also declares helpers/state functions such as `safeUrl`, `isPhone`, `load`, and `persist` more than once in the same scope; later declarations override earlier ones. This increases review and regression risk. Avoid a broad rewrite during the initial bug-fix pass.
6. **Local-only persistence and contacts.** Profile edits and exchanged contacts are stored in browser `localStorage`; there is no server sync. Clearing browser storage or changing devices can lose this state. A JSON backup download exists, but no restore/import path was found in the inspected UI.
7. **Third-party requests need a privacy decision.** The landing page loads Google Fonts, and the dashboard includes a Cloudflare Web Analytics beacon. Review whether those external requests are appropriate for the intended demo and production privacy expectations.
8. **Runtime behavior remains unverified.** Mobile layout, keyboard/focus behavior, color contrast, QR decoding, download/print behavior, browser back/forward navigation, storage failure handling, and form edge cases still need actual browser checks.
9. **Demo actions should be unmistakable.** Google sign-in, forgot-password, Google Contacts sync, billing/renewal, NFC, and online publishing are stubs or explicitly disconnected. Keep the prototype labels clear so users do not mistake these for working services.

### P3 — Documentation polish

10. Expand the README with how to open the prototype, its local-only behavior, known limitations, and the exact manual smoke-test checklist. Clarify licensing before redistributing the prototype or its bundled assets.

## Day 2 verification targets

1. Open the prototype in a real browser, prioritizing Android-sized screens; record console/runtime errors instead of assuming success.
2. Smoke-test sign-up/sign-in demo, all navigation routes and browser back/forward, profile edits, photo upload, link edit/toggle/reorder/delete, service add/edit/delete/reorder, contact exchange, search/pagination, VCF export, QR encode/decode/download/print, share/copy, and JSON backup.
3. Test invalid inputs and boundary values, especially email/phone fields, long text, malformed stored data, storage unavailable/full, and large or invalid images.
4. Review every dynamic `innerHTML` rendering path with adversarial text and URLs; retain escaping and protocol validation.
5. Make only small, reversible, clearly justified fixes on this branch. Do not add backend services or deploy.

## Day 1 conclusion

The repository is an interactive front-end prototype, not a production-ready service. Source-level JavaScript syntax is parseable, but there is no automated test/build pipeline and no browser runtime verification yet. The most important product-readiness blockers are the placeholder public URL, simulated authentication, and confirmation that hard-coded demo identity data is safe to publish.
