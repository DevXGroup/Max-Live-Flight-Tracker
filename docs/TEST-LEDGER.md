# Verification ledger

Date: 2026-11-09, America/Los_Angeles. Repair base: `f3c87db1ac748d525c18a01d31844e6d83a08504`.
Evidence below covers the local repair. It does not establish a production release.
Verified repair commit: `391903962d4a929500157ac60e150f01a11b67fc`. The follow-up
handoff commit changes this ledger only; the tested application source is unchanged.

| Feature | How verified | Depth | Last-verified revision | Result |
|---|---|---|---|---|
| Flight lookup and stable JSON | Node contract, identity, freshness, cache, capacity, normalization, reference route and UI utility tests; local production build; SWA1781 and WN1781 live probes | Unit, integration and live observation | `391903962d4a929500157ac60e150f01a11b67fc` | PASS locally; 30 tests and final build passed |
| Flight cards and map | Browser fixtures for unknown fields, valid zero coordinates, schedule-only, actual arrival, timezones, stale observation, 404, malformed JSON, retained card on failed refresh and blocked tiles | Desktop 1440px, mobile 375px; screenshots visually inspected | `391903962d4a929500157ac60e150f01a11b67fc` | Passed local checks; real SWA1781 tiles loaded without a map key |
| ship-gate flight provider repair | Security checklist, secrets/history/browser artifacts, live local port probe, data license and disclosure review, responsive renders, independent subscription review | Five lanes scoped to repair | `391903962d4a929500157ac60e150f01a11b67fc` | PASS for scoped local repair; no open confirmed release finding |
| Vercel configuration and history | Authenticated CLI/API project metadata, variable counts, deployment metadata, runtime logs, paged environment activity | Read-only live control plane | Production inspected independently of local diff | Access works; no login needed; zero flight project variables; no evidence identifying a deletion actor |

## Local verification evidence

- Final combined run: 30 tests passed; `npm run lint` had zero errors and seven warnings; `npm run build`, TypeScript and diff checks passed. Backend independent review passed with zero findings. The final map-control sizing adjustment passed targeted lint and a fresh production build and has a separate focused review.
- Real local production lookup returned HTTP 200 for SWA1781 and WN1781 with the same aircraft, adsb.lol position, and an unconfirmed VRS route. Missing schedule, gates, terminals and ETA stayed null. This proves those observations, not universal coverage.
- Real map rendered OpenStreetMap tiles. Preserved screenshots and provenance are in `assets/screenshots/2026-11-09/`; before screenshots show the separate CARTO API KEY REQUIRED tile failure.
- Browser fixtures passed missing-data and error paths listed in the table. Schedule fixtures are synthetic, not evidence that a free operational provider returned those details.
- The built diagnostic `/api/test` route returned safe JSON 404 / NOT_OBSERVED for its fixed flight lookup, confirming it calls the server lookup directly rather than producing the former relative-fetch 500. The public data-and-privacy page was rendered and visually inspected at 375px and 1440px with no horizontal overflow.
- Malformed/missing/script/traversal-like flight queries returned safe JSON 400. `/.env.local` returned 404. The local server bound 127.0.0.1:3013 and did not answer at the LAN address.
- Gitleaks 8.30.1 full reachable history and current source packet: zero findings. Final 3,436,621-byte staged patch scan completed with zero findings before the repair commit. Exact local credential-value comparisons against the final build's 13 browser artifacts found zero matches for all three local provider secrets; values were never printed.
- Production dependency audit: zero vulnerabilities. Full audit: seven moderate development-only TypeScript ESLint/minimatch advisories, tracked in `BACKLOG.md`; no forced incompatible override.

## Independent review

The older CLI failed before review; the Gemini fallback timed out without findings.
Neither is counted as a pass. The existing stable Codex CLI 0.167.0 completed a read-only
subscription review using the approved model and safeguards. It found four confirmed
issues: service-date selection, missing schedule airport coordinates, live null aircraft
metadata overwriting schedule values, and a server caller of the browser wrapper.
Findings and dispositions are private local artifacts under
`.tmp/crossreview/20261109-220105-review-codex-mlofmk/`.
All four findings were fixed. A further stale-ETA selection corner was confirmed and fixed before the fresh review: a currently active schedule cannot be displaced by a future trip solely because its estimate is in the past. The WN934 regression preserves the active trip and leaves elapsed ETA unavailable. The next read-only review completed under `.tmp/crossreview/20261109-221626-review-codex-a8MxJm/` and confirmed two further issues: a rejected two-letter callsign suffix and post-wait telemetry expiry hiding a valid schedule. Both were fixed, with exact-match and controlled-clock regressions. Optional schedule text is also normalized to bounded strings/null so malformed optional fields cannot discard a valid live result. The fresh final backend review `.tmp/crossreview/20261109-222432-review-codex-yUZQZd/` passed with zero findings. The final map target-size adjustment passed its focused review with zero findings in `.tmp/crossreview/20261109-222958-review-codex-y3pLet/`. Parent browser measurements confirmed 44px zoom/refresh targets at both viewports; recorded-response replay screenshots are explicitly separate from live probes.

## Scope of the wider API audit

The initial bounded audit covered 11 listed Vercel projects and 21 GitHub repositories,
plus documented service health/account endpoints. Recent inspected Vercel deployments
were ready. Metadata or model-list success does not establish a full user workflow.
Separate service credentials require attention; private findings remain in
`.tmp/api-audit-2026-11-09/API-AUDIT.md` rather than public repository documentation.
That initial artifact describes the old flight implementation and is historical evidence,
not the current runtime contract. No other project's credentials or settings were changed.

## Final gate verdict

| Lane | Ran / skipped (reason) | Findings | Fixed |
|---|---|---|---|
| Security | Ran scoped SEC-01 through SEC-27 review, negative/live probes, dependency and secrets scans | No open blocking repair finding; seven moderate dev-only dependency advisories remain tracked | Production dependency issues fixed; server boundary, safe errors and bounded resources verified |
| Database | Skipped: no database, migration or write in this app | N/A | N/A |
| Legal | Ran source-license, attribution, data-flow and public disclosure review | Provider limits and company-wide contract/transfer verification limits disclosed; no claim of full legal certification | Retired/restricted default sources replaced; sources and privacy notice linked |
| UI | Ran browser fixtures, 375px/1440px renders and visual inspection | Map key-wall and missing-data problems fixed; final controls measured at least 44px | Null-safe UI, retained refresh data, readable attribution and usable map controls |
| Cross-model | Ran independent read-only subscription reviews and a separate final map review | Earlier confirmed findings fixed; final two reviews PASS with zero findings | Six independent defects plus parent-confirmed stale-ETA and optional-string issues fixed |

Final real probes returned SWA1781 and WN1781 HTTP 200 with On Ground and the same
observed aircraft. Later, when recent receiver coverage stopped, a fresh search correctly
returned 404 / NOT_OBSERVED. This is not a cancellation or proof of gate arrival. The
recorded earlier observation was replayed only for the final control sizing check and
visibly labeled stale. No replay or mock was added to the production call chain.

PowerKit is a separate project and its pre-existing dirty tree was preserved. This
project's handoff is recorded here and in BRIEF/BACKLOG instead of editing that tree.

## Release state

No production environment value, deployment or database was changed by this repair.
Vercel's configured production branch is main, so pushing the repair may deploy it.
Obtain Max's production approval after local verification, then push and verify GitHub
Actions for the exact commit and the Vercel public alias. Until then, the public site
continues to serve the old deployment.
