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


## Day 2 — Changes and verification (2026-11-06)

**Working branch:** `prototype-hardening/day-1-audit-2026-11-05`  
**Main baseline:** `8a4495712e2430f52487edb6a412b8f99a65368d` (left unchanged)

### Code and test commits

- `45332020d88c9a2205c77c69c7f9b7276cb0f972` — made the unpublished profile state explicit; disabled fake public-link/QR/share actions; clarified demo authentication stubs; updated README; added source-level regression tests.
- `6f146a4ef47515690667a590c4f8311736eca068` — allowed the default local draft slug in the address editor while still keeping publishing unavailable.
- `46446fedc23bda514f7f7c7432f04e883e880e28` — simplified the new regression test assertion.

### Files changed

- `TapSync — App Prototype (1).html` — replaced the fake `yourbrand.et` destination with a local draft slug; migrated previously saved placeholder values; made `TapSync.url()` return no public URL until a real public route exists; removed static share destinations; disabled public-link copy/share and QR download/print/modal actions; added an accessible QR unavailable state; made Google sign-in/password reset display explicit not-connected messages; changed auth labels to demo mode; removed the fake “Profile Live”/“Ready to Scan” status and sample tap count presentation; made the draft address editor accept a simple slug or valid domain/path.
- `README.md` — added local run instructions, demo limits, privacy/storage caveats, test command, and manual smoke-test checklist.
- `tests/prototype-static.test.mjs` — added Node built-in tests for embedded-document/inline-script parsing and source-level guardrails.
- `docs/prototype-hardening-audit.md` — this evidence log.

### Verification evidence

- Re-fetched the final committed HTML blob from GitHub: **3,060,094 characters**, blob SHA `9bbc022965bea06a15c6a6c1f380cbcb723ef31e`. Regression-test blob SHA: `3784f797cf856ac21107dd2475703c2298c6ef1e`.
- Parsed all **7 embedded inline JavaScript blocks** from the actual GitHub source in the available JavaScript runtime; no syntax errors were reported.
- Ran **14 in-memory static assertions** against the final fetched source; all passed: no literal placeholder domain remains, no hard-coded share destinations remain, the public URL function returns empty, every URL/share/action selector uses query-all so all matching controls receive the unavailable state, QR actions are guarded, auth stubs are disclosed, the Google handler does not post a fake auth message, draft-slug validation and legacy-value migration are present, strict HTTP(S) URL validation remains, and dynamic link rendering retains escaping.
- Node.js is present in the container (`v22.16.0`), but `node --test tests/prototype-static.test.mjs` was **not run** against a local checkout: the repository could not be downloaded into the container because network/DNS access was unavailable. The committed test suite therefore still needs a real `node --test` run.
- **Not run:** browser/runtime testing, Android viewport testing, QR decode test, actual clipboard/native share/download/print checks, accessibility audit, network/console inspection, build/lint, and end-to-end core journeys. No package/build/lint configuration exists in the inspected repository.

### Remaining risks and exit status

- The app still has no public profile route or online publishing, authentication provider, NFC writing, Google Contacts sync, billing, backend/database, or cross-device sync. The UI now states these limitations instead of pretending public links work.
- Profile/contact state remains browser-local. Clearing site data or storage failure can lose edits; JSON export exists, but restore/import is still absent.
- Realistic-looking sample identity/contact data remains in the public source and should be reviewed before wider promotion. Google Fonts and Cloudflare Web Analytics still make third-party requests; privacy/network behavior has not been tested.
- The roughly 3 MB single-file structure and duplicate helper/state declarations remain; no broad rewrite was attempted.
- **Day 2 status: partial.** The source-level fixes and regression tests are committed, but the Day 2 exit gate remains **not verified** until the test suite runs in a local Node environment and real browser/mobile journeys are exercised. No merge, deployment, or backend/database work was performed.


### Follow-up correction — apply the unavailable state to every matching control

- `f2b74d6c18c6b295a66ed0548feab82197a731e0` — intermediate test-only selector assertion update; the following commit corrected the selector coverage.
- `7b2979aa2bfec63c1aab91f2ff03a826e7fd8b1c` — changed the public URL, share-channel, and public-action loops to query all matching elements, and added regression assertions for that behavior.
- Re-fetched the final branch source and confirmed the guard loops now use query-all selectors for all URL anchors, all share links, and all public action buttons. All 7 inline JavaScript blocks still parse in the available source-analysis runtime, and all 14 source-level assertions pass.
- The test runner and browser limitations above still apply; this follow-up does not change the Day 2 exit status.
