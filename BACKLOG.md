---
project: max-live-flight-tracker
name: Live Flight Tracker
status: live
updated: 2026-11-10
health: healthy
where_we_are: "Flight provider release dfc4301 is promoted and live. Exact-SHA CI, live SWA/WN/UAL lookups, and responsive visual checks passed. See docs/TEST-LEDGER.md."
todos:
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
  - id: vault-aviationstack-key
    priority: P2
    title: "Record the AviationStack key in the canonical vault"
    why: "Production has the owner-authorized server-side AVIATION_STACK_KEY configuration, but the credential was not added to the PowerKit vault during release. Follow the approved vault process for future sync and recovery. Never write or reveal the value in project files."
    owner: max
  - id: decide-project-future
    priority: P3
    title: "Decide whether this stays a standalone free tool or folds into a bigger feature"
    why: "It works and is live, but has no monetization and no stated long-term purpose beyond 'useful side project.' Worth a deliberate call so it doesn't drift into unmaintained-but-public limbo."
    owner: max
completed:
  - id: flight-provider-repair-release
    done: 2026-11-10
    title: "Release the verified replacement flight data contract"
    outcome: "Deployed dfc43013c499ff3faa9860967ce725ee1959fa6a to flight.devxgroup.io. Exact-SHA CI passed. Public SWA1781/WN1781 completed-flight lookups and UAL1759 live map lookup verified; see docs/TEST-LEDGER.md."
    docs: "docs/TEST-LEDGER.md"
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
FlightAware scraping. The replacement is now deployed at `flight.devxgroup.io` from
`dfc43013c499ff3faa9860967ce725ee1959fa6a`. Exact-SHA CI and public SWA1781/WN1781 and
UAL1759 checks passed. Monitoring, a separate key-vault record, a compatible linter-chain
update, and the project-future decision remain open; see `docs/TEST-LEDGER.md`.

## Rejected / not resurrected

None recorded yet.
