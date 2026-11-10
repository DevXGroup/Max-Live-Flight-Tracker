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

The replacement is pushed to `main` at `0fd784019ee12633706cbea77bcc36b663d65fd4`.
It uses adsb.lol observations, pinned CC0 VRS route references labeled unconfirmed,
explicit nullable schedule fields, source/freshness metadata, and null-safe cards/maps.
Real local hybrid checks confirmed AviationStack schedule details when available; missing
position telemetry remains null.

At Max's explicit release request, Production received server-side `AVIATION_STACK_KEY`
and `DATA_SOURCE=hybrid` configuration. No secret value was written to this repository
or the PowerKit vault. Commit `0fd784019ee12633706cbea77bcc36b663d65fd4` is deployed and
the exact-SHA GitHub Actions workflow passed. A public UAL1759 lookup returned HTTP 200
with an active ADS-B position and schedule data. A current SWA1781/WN1781 lookup returned
404 even though AviationStack had a completed record from the previous day. The selector
had stopped considering completed flights after six hours. A narrow local hotfix now
extends that lookup window to 24 hours, warns when the completed record is older than six
hours, and preserves ambiguity safeguards. The same hotfix adds missing airport coordinates
from the pinned reference airport CSV using the schedule's validated ICAO code, and hides
expired Early/On Time badges. The hotfix has not been deployed yet.
See `docs/TEST-LEDGER.md` for the release and hotfix evidence.

## What happens next, in order

1. Finish local verification and independent review of the history, airport-coordinate
   and expired-estimate hotfixes. Then release them and verify SWA1781/WN1781 completed
   schedule data, UAL1759 map endpoints, expired ETA badge, and missing-position behavior.
2. Follow Max's credential-vault rule for future key management: the Production value
   was restored through the authorized Vercel configuration path, but no copy was added
   to the PowerKit vault. Do not print or copy the value.
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
