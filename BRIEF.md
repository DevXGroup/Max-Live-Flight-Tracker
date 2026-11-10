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

## Where things stand (2026-11-09)

The live site has an unreliable legacy lookup and a separate map-tile failure: CARTO's
old keyless tile URL renders API KEY REQUIRED images. Production has no configured flight API
variables, Amadeus Self-Service is deprecated, and FlightAware scraping returned 402.
Available Vercel environment activity records do not identify who cleared keys or whether
they were ever configured. Local credential files were preserved without exposing values.

A replacement is verified locally: adsb.lol observations, pinned CC0 VRS route
references labeled unconfirmed, explicit nullable schedule fields, source/freshness
metadata, and null-safe cards/maps. The UI layout is preserved. No free source was
verified to provide complete worldwide schedules, gates, terminals and telemetry together.
See `docs/FLIGHT-DATA-CONTRACT.md` and `docs/TEST-LEDGER.md` for the final verification
and deployment state. Production has not been changed by this repair yet.

## What happens next, in order

1. Obtain approval before pushing the tested production release. The existing local
   AviationStack key now passes real schedule/UI checks, including SWA1781 as Landed
   with gates and aircraft details. It is absent from production and the canonical
   vault. Max must add the missing vault key per his rule, then approve server-only
   restoration with `DATA_SOURCE=hybrid`. Local checks and independent reviews pass;
   see `docs/TEST-LEDGER.md`. The public alias still serves the old deployment.
2. After an approved push, wait for GitHub Actions on that exact commit and verify the
   Vercel alias serves it, including live and missing-data lookup behavior.
3. Add basic alerting for provider failures and consider a permission-cleared independent
   fallback. FlyItalyADSB Free requires separate account/key onboarding; no account was
   created and no spend or outbound provider contact was authorized by this repair.
4. See `BACKLOG.md` for the remaining product and monitoring decisions.

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
