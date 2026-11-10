---
project: max-live-flight-tracker
name: Live Flight Tracker
status: live
updated: 2026-11-10
health: needs-testing
where_we_are: "Release 0fd7840 is live; exact-SHA CI passes and UAL1759 API returns live data. Hotfix in progress for SWA/WN prior-day history, KOA map coordinates, and expired ETA badges. See docs/TEST-LEDGER.md."
todos:
  - id: flight-provider-repair-release
    priority: P1
    title: "Complete and verify the flight provider release"
    why: "Production release 0fd784019ee12633706cbea77bcc36b663d65fd4 is live, exact-SHA CI passes, and UAL1759 returns active position/schedule data. Three regressions are being fixed locally: completed prior-day SWA/WN records outside the old six-hour window, KOA lacking local map coordinates, and stale ETA showing an Early badge. Verify locally, release the fixes, then confirm UAL/SWA/WN map and status behavior on the public alias."
    where: "docs/TEST-LEDGER.md"
    owner: max
  - id: add-monitoring
    priority: P2
    title: "Add basic uptime or error monitoring for the live site"
    why: "The public site needs a useful provider-error/lookup health alert beyond homepage availability. A green homepage does not prove fresh aircraft observations. Do not add tracking or paid monitoring without a scoped decision."
    owner: max
  - id: independent-free-fallback
    priority: P2
    title: "Evaluate a permission-cleared independent free observation fallback"
    why: "FlyItalyADSB terms allow Free commercial use and server caching, but onboarding needs a separate account/key and current plan/license verification. No account, contact, spend or key change was performed. Default adsb.lol remains best effort; process-local caches are not a distributed quota guarantee."
    where: "docs/research/2026-11-09-perplexity-flight-data.md"
    owner: max
  - id: dev-linter-minimatch-advisory
    priority: P2
    title: "Update the linter chain when a compatible minimatch fix is released"
    why: "After non-forced compatible updates, npm audit reports seven moderate development-only advisories in the TypeScript ESLint/minimatch chain. The patched minimatch major is outside the current upstream dependency range. Production audit is clean. Do not force a toolchain override without testing and a scoped decision."
    where: "package-lock.json"
    owner: max
  - id: decide-project-future
    priority: P3
    title: "Decide whether this stays a standalone free tool or folds into a bigger feature"
    why: "It works and is live, but has no monetization and no stated long-term purpose beyond 'useful side project.' Worth a deliberate call so it doesn't drift into unmaintained-but-public limbo."
    owner: max
completed:
  - id: init-version-control
    done: 2026-08-25
    title: "Put this under version control"
    outcome: "Repo is git-tracked with 30+ commits of real fixes (CORS, rate limiting, timezone math, credential exposure, geodesic paths). Verified via git log and clean working tree."
    docs: "BRIEF.md"
shipped_recently:
  - "Canvas-rendered background dots, animation skipped on mobile for performance."
  - "Dev server now allows LAN origins so mobile devices can hydrate it."
  - "Dropped browser-exposed fallback credentials for the flight API."
  - "Replaced Vercel default favicon with the app's own logo."
  - "Dark-themed map upgrade with curved (geodesic) flight paths."
---

# Live Flight Tracker backlog

Machine-readable state is the front matter above; the dashboard reads that. Prose below is
context for humans and never repeats a to-do.

## Where things stand

The 2026-11-09 audit found the old Amadeus test integration deprecated and unreliable
FlightAware scraping. The replacement maps validated observations into the existing UI,
preserves missing values, labels reference routes and records source age. On 2026-11-10,
Max authorized production configuration and deployment. Commit 0fd7840 is live and
exact-SHA CI passes. UAL1759 returned active data. SWA1781/WN1781 failed to return the
provider's completed prior-day record because the selector used a six-hour history
window. Follow-up also found missing local KOA coordinates and an expired ETA badge.
The local hotfix adds pinned reference-airport coordinates by ICAO and hides expired
arrival badges. These fixes are not yet deployed; see `docs/TEST-LEDGER.md`.

## Rejected / not resurrected

None recorded yet.
