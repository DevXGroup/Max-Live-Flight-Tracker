---
project: max-live-flight-tracker
name: Live Flight Tracker
status: live
updated: 2026-09-02
health: needs-testing
todos:
  - id: flightaware-key-audit
    priority: P1
    title: "Confirm the FlightAware scraping fallback can't run up a bill or get blocked"
    why: "src/lib/flightaware.ts scrapes FlightAware directly instead of calling a metered API, so there's no key to leak, but no one has confirmed the scraper is stable against FlightAware's site changing or blocking the IP. If it silently breaks, flight lookups quietly fall back to worse data with no alert."
    where: "src/lib/flightaware.ts"
    owner: max
  - id: add-monitoring
    priority: P2
    title: "Add basic uptime or error monitoring for the live site"
    why: "flight.devxgroup.io is public and returns 200 today, but there is no alerting if OpenSky/AviationStack/Amadeus all fail at once or the deploy breaks. Right now the only way to find out is a manual check."
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

This project used to be flagged dormant and outside version control. That's no longer
accurate: it has a real git history (30+ commits), a clean working tree, and is deployed
live at `flight.devxgroup.io`, which returned a 200 on 2026-09-02. `health` is
`needs-testing` rather than `green` because nothing here was verified beyond "the homepage
loads", actual flight search and the API fallback chain were not exercised in this pass.

## Rejected / not resurrected

None recorded yet.
