# Live Flight Tracker, in one page

> Deeper docs: `BACKLOG.md` for what's next, `README.md` for how to run it, `FEATURES.md` for
> the full feature list as it stood at last major update.

## What this is

A web app where you type in a flight number (like "BA36") and see that flight tracked live
on an interactive map: its current position, speed, altitude, heading, and a countdown to
arrival. It pulls real aircraft position data from the OpenSky Network and route/schedule
data from AviationStack, Amadeus, and a FlightAware scraping fallback, then stitches it
together with a local airport-coordinate database.

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

## Where things stand (2026-09-02)

**Live and actively maintained: deployed at `flight.devxgroup.io` (verified 200 response),
last commit 2026-08-25, working tree clean.** The app has been through several rounds of
real bug fixes (CORS, rate limiting, timezone math, geodesic map paths, credential exposure)
rather than sitting untouched. `.env.local` holds live API keys and is correctly gitignored
(not tracked in git).

## What happens next, in order

1. Confirm the FlightAware key/scraper usage is not metered or rate-limited in a way that
   could produce a surprise bill (see `BACKLOG.md`).
2. Decide whether this stays a free public tool indefinitely or gets folded into a bigger
   DevX aviation feature.
3. If it stays public long-term, add basic uptime/error monitoring since it currently has
   none.
4. See `BACKLOG.md` for the full open item list.

## Map

| Question | File |
|---|---|
| What's next / open items | `BACKLOG.md` |
| How to run it locally | `README.md` |
| Full feature list (as of last major update) | `FEATURES.md` |
| Main page / search UI | `src/app/page.tsx` |
| Flight data fetching + fallback chain | `src/lib/api.ts` |
| OpenSky live position API | `src/lib/opensky.ts` |
| FlightAware scraping fallback | `src/lib/flightaware.ts` |
| Airport coordinate database | `src/lib/airports.ts` |
| API route (server-side, keeps keys off the client) | `src/app/api/flight/route.ts` |
