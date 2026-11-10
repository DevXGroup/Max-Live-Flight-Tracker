---
oneLiner: "Web app that tracks any flight live on a map by its flight number"
category: website
status: paused
---
# Live Flight Tracker, in one page

> Deeper docs: `BACKLOG.md` for what's next, `README.md` for how to run it, `FEATURES.md` for
> the full feature list as it stood at last major update.

## What this is

A web app where you type in a flight number (like "BA36") and see that flight tracked live
on an interactive map: available position, speed, altitude, direction and trip details.
The repair uses adsb.lol observations and pinned CC0 route references, with an optional
eligible AviationStack schedule source. Missing fields remain unavailable. Reference
routes are unconfirmed and never used to invent a schedule or arrival time.

## Who it is for

Anyone who wants to check a specific flight's live position without digging through a
cluttered commercial flight-tracking site. Built by Max as a DevX Group side project, live
at `flight.devxgroup.io`.

## Why it exists

Existing flight trackers (FlightAware, Flightradar24) are ad-heavy and slow for the simple
case of "where is this one flight right now." This app answers that one question with a
clean map and free data sources, no account or paywall.

## How it makes money

Not a product. No pricing, checkout, or monetization anywhere in the code. It's a free
DevX Group side project.

## Where things stand (2026-11-10)

The replacement is live at `flight.devxgroup.io` from
`dfc43013c499ff3faa9860967ce725ee1959fa6a`. It uses adsb.lol live observations, optional
AviationStack schedule enrichment, and pinned CC0 VRS reference data for unconfirmed
routes and missing airport coordinates. Missing telemetry stays null.

Exact-SHA GitHub Actions run `42808268369` passed install, tests, lint, and build. Vercel
deployment `dpl_jcPSn5UEfG6piVd5UNQautposn6S` is Ready and Promoted. Public checks confirmed
SWA1781 and WN1781 as completed November 9 flights with gate 103 and terminal 1; UAL1759
is Active with a live route from KOA to DEN. KOA coordinates resolve from pinned reference
airport data. Expired ETAs show no Early badge, and old schedule data is not merged with
a fresh live position. These checks do not establish complete coverage for every flight.
See `docs/TEST-LEDGER.md` and screenshot provenance for the evidence.

Production uses server-side `AVIATION_STACK_KEY` and `DATA_SOURCE=hybrid`. No secret value
was written to the repository or the PowerKit vault. No database write, billing-plan
change, or new provider account was made. Follow the credential-vault rule for future key
management.

## What happens next, in order

1. Add basic alerting for provider failures and consider a permission-cleared independent
   fallback. FlyItalyADSB Free requires separate account/key onboarding; no account was
   created and no spend or outbound provider contact was authorized by this repair.
2. Follow Max's credential-vault rule for future key management: the Production value is
   configured through the authorized Vercel path, but no copy was added to the PowerKit
   vault. Record it in the vault through Max's approved process; never print or copy it.
3. Update the linter dependency chain when a compatible minimatch fix is available, then
   decide whether this remains a standalone free tool. See `BACKLOG.md`.

## Map

| Question | File |
|---|---|
| What's next / open items | `BACKLOG.md` |
| How to run it locally | `README.md` |
| Full feature list (as of last major update) | `FEATURES.md` |
| Main page / search UI | `src/app/page.tsx` |
| Client wrapper / provider orchestration | `src/lib/api.ts` / `src/lib/flight-server.ts` |
| Stable provider-to-UI contract | `src/lib/flight-types.ts` / `docs/FLIGHT-DATA-CONTRACT.md` |
| Pinned reference route adapter | `src/lib/flight-route-reference.ts` |
| Airport coordinate database | `src/lib/airports.ts` |
| API route (server-side, keeps keys off the client) | `src/app/api/flight/route.ts` |
