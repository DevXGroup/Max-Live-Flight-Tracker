# Verification ledger

Date: 2026-11-10, America/Los_Angeles. Repair base: `f3c87db1ac748d525c18a01d31844e6d83a08504`.
Evidence below covers the local repair. It does not establish a production release.
Verified repair commit: `0eb57006090371a1a21a0390e722c2554d4a15c9` (core implementation `391903962d4a929500157ac60e150f01a11b67fc`; follow-up changes only warning copy, evidence and documentation). The follow-up
handoff commit changes this ledger only; the tested application source is unchanged.

| Feature | How verified | Depth | Last-verified revision | Result |
|---|---|---|---|---|
| Flight lookup and stable JSON | Node contract, identity, freshness, cache, capacity, normalization, reference route and UI utility tests; local production build; SWA1781 and WN1781 live probes | Unit, integration and live observation | `0eb57006090371a1a21a0390e722c2554d4a15c9` | PASS locally; 30 tests and final build passed |
| Flight cards and map | Browser fixtures for unknown fields, valid zero coordinates, schedule-only, actual arrival, timezones, stale observation, 404, malformed JSON, retained card on failed refresh and blocked tiles | Desktop 1440px, mobile 375px; screenshots visually inspected | `0eb57006090371a1a21a0390e722c2554d4a15c9` | Passed local checks; real SWA1781 tiles loaded without a map key |
| Existing AviationStack key and real hybrid schedule | One direct HTTPS compatibility check and temporary local hybrid SWA/WN lookups, followed by real 375px/1440px renders and visual inspection | Real provider and built app; no request interception | `0eb57006090371a1a21a0390e722c2554d4a15c9` | HTTP 200; Landed, gates, terminal and aircraft details populated; missing telemetry stayed null; production key restoration remains gated |
| ship-gate flight provider repair | Security checklist, secrets/history/browser artifacts, live local port probe, data license and disclosure review, responsive renders, independent subscription review | Five lanes scoped to repair | `0eb57006090371a1a21a0390e722c2554d4a15c9` | PASS for scoped local repair; no open confirmed release finding |
| Vercel configuration and history | Authenticated CLI/API project metadata, variable counts, deployment metadata, runtime logs, paged environment activity | Read-only live control plane | Production inspected independently of local diff | Access works; no login needed; zero flight project variables; no evidence identifying a deletion actor |

## Local verification evidence

- Final combined run: 30 tests passed; `npm run lint` had zero errors and seven warnings; `npm run build`, TypeScript and diff checks passed. Backend independent review passed with zero findings. The final map-control sizing adjustment passed targeted lint and a fresh production build and has a separate focused review.
- Real local production lookup returned HTTP 200 for SWA1781 and WN1781 with the same aircraft, adsb.lol position, and an unconfirmed VRS route. Missing schedule, gates, terminals and ETA stayed null. This proves those observations, not universal coverage.
- Real map rendered OpenStreetMap tiles. Preserved screenshots and provenance are in `assets/screenshots/2026-11-09/`; before screenshots show the separate CARTO API KEY REQUIRED tile failure.
- Browser fixtures passed missing-data and error paths listed in the table. Schedule fixtures are synthetic, not evidence that a free operational provider returned those details.
- Subsequent real AviationStack checks confirmed the existing local key works. Temporary local hybrid mode returned SWA1781/WN1781 schedule-only data and provider-reported Landed, DEN gate C65, SAN terminal 1/gate 103, B38M and N9021F. Desktop/mobile real screenshots are separate from fixtures. This verifies actual compatibility, not plan tier/quota or airline-certified accuracy. The generic missing-position warning was shortened to avoid contradicting a Landed record; all 30 tests, targeted lint, TypeScript and build passed again. No functional logic changed after the final independent reviews.
- The built diagnostic `/api/test` route returned safe JSON 404 / NOT_OBSERVED for its fixed flight lookup, confirming it calls the server lookup directly rather than producing the former relative-fetch 500. The public data-and-privacy page was rendered and visually inspected at 375px and 1440px with no horizontal overflow.
- Malformed/missing/script/traversal-like flight queries returned safe JSON 400. `/.env.local` returned 404. The local server bound 127.0.0.1:3013 and did not answer at the LAN address.
- Gitleaks 8.30.1 full reachable history and current source packet: zero findings. Final 3,436,621-byte staged patch scan completed with zero findings before the repair commit. Exact local credential-value comparisons against the final build's 13 browser artifacts found zero matches for all three local provider secrets; values were never printed.
- Production dependency audit: zero vulnerabilities. Full audit: seven moderate development-only TypeScript ESLint/minimatch advisories, tracked in `BACKLOG.md`; no forced incompatible override.
- The follow-up real-provider evidence/warning-copy staged patch (780,198 bytes) also passed Gitleaks with zero findings. Exact comparison against the rebuilt 13 browser artifacts again found no local credential values.

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

Max explicitly authorized the production API configuration and deployment on 2026-11-10.
Release commit `dfc43013c499ff3faa9860967ce725ee1959fa6a` is live at `flight.devxgroup.io`.
Vercel deployment `dpl_jcPSn5UEfG6piVd5UNQautposn6S` is Ready and Promoted; its Git source
metadata points to the exact SHA. GitHub Actions run `42808268369` passed install, tests,
lint and build for that full SHA. Production uses server-side `AVIATION_STACK_KEY` and
`DATA_SOURCE=hybrid`. No value was printed, committed or written to the PowerKit vault.
No database write, billing-plan change or provider account creation occurred.

Public API checks through the alias:

- SWA1781 returned HTTP 200 / Landed, service date November 9, gate 103, terminal 1.
  Browser view showed two airport markers, one path, no plane marker or rotation, and the
  completed-flight notice.
- WN1781 returned HTTP 200 / Landed through the same alias.
- UAL1759 returned HTTP 200 / Active with ADS-B and AviationStack sources, KOA coordinates
  `19.7388, -156.046005`, Denver coordinates from the local airport catalog, two airport
  markers plus the plane, one route path, heading 63.02 degrees, and matching popup rotation.
  The expired ETA showed no Early badge.

The 24-hour completed-flight fallback applies only when no fresh position is available.
Fresh airborne telemetry suppresses a historical completed schedule, and also suppresses
a current-date schedule that reports Landed. Stale history remains available schedule-only;
the app does not claim complete airline or worldwide feed coverage. Pinned VRS standing
data is CC0; AviationStack supplies operational schedule data.

The local key was not found in the canonical vault during the prior names-only audit. Its
Production configuration was owner-authorized for this release, but no copy was added to
the vault. Follow the credential-vault rule for future sync and recovery; do not print or
copy the value. Monitoring and verification of the Vercel log-drain configuration remain
open; no log-drain endpoint was available to verify.

## 2026-11-10 rerun on the pushed checkout

- `npm test`: 30 passed, 0 failed.
- `npm run lint`: 0 errors; 7 warnings (one `<img>` warning in `src/app/page.tsx`, six
  hook dependency warnings in `src/components/GlobeMap.tsx`).
- `npm run build`: passed with Next.js 16.4.6; dynamic API routes were built.
- `npm audit --omit=dev`: zero production vulnerabilities.
- `git diff --check`: passed; no local changes were made during the verification run.

The final local regression suite passed 34 tests. It covers the fixed-clock 24-hour history
window, schedule-only fallback, current-service priority, duplicate history rejection,
fresh-position precedence over historical/conflicting completed schedules, PHKO coordinate
lookup, unknown-airport nulls, and expired ETA behavior. `npm run lint` completed with zero
errors and seven existing warnings; `npm run build` passed on Next.js 16.4.6;
`npm audit --omit=dev` found zero production vulnerabilities; `git diff --check` passed.

The final scoped independent review passed with zero findings at
`.tmp/crossreview/20261110-033007-review-codex-97iA8p/`. Follow-up reviews found and fixed
a time-dependent history fixture and the historical/live merge conflict; the fresh-position
precedence regression now covers both prior-day and current-date Landed schedule conflicts.
Public UAL map and SWA/WN lookup checks were visually reviewed on desktop and mobile. The
browser viewport audit at 375, 768, 1024 and 1440 pixels found no horizontal overflow or
invalid date/number output. The eight browser JavaScript assets were compared against the
three existing provider secret values with zero matches; values were not printed. Latest
production error-log query returned zero rows. The staged-patch Gitleaks scan had zero
findings. These checks do not establish a verified log-drain endpoint or complete provider
coverage.
