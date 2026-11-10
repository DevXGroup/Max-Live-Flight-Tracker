# Live Flight Tracker

Look up a flight number and see its latest available aircraft observation on an interactive
map. The default source is adsb.lol. Position, speed, altitude, direction and aircraft
details appear when provided. Route references are labeled unconfirmed. Airline schedule,
gate, terminal and arrival estimates appear only when an eligible operational source
actually provides them. Missing values stay unavailable rather than being invented.
The map background uses OpenStreetMap tiles with visible contributor attribution and
normal browser caching; no map API key is needed. Free community services are best effort.

Live at `flight.devxgroup.io`.

## Run it

```bash
npm ci
npm run dev -- --hostname 127.0.0.1
```

Open http://localhost:3000 and search a flight number (e.g. "BA36").

```bash
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint
npm test        # provider/contract regression tests, no credentials needed
```

## Config

The default public adsb.lol lookup needs no key. See `.env.example` for optional server-only
configuration. Do not restore `NEXT_PUBLIC_` credential names. Amadeus Self-Service is
retired and is no longer called. Optional alternate feeds and AviationStack require a
use case permitted by their current terms; no paid account or quota increase is automatic.

Aircraft observation data from [adsb.lol](https://www.adsb.lol/) is available under
[ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/). The route reference dataset is
[Virtual Radar Server standing-data](https://github.com/vradarserver/standing-data), CC0.
The application's source-code licensing is separate from the providers' data licenses.

## Docs

- `BRIEF.md`, what this is, who it's for, current status
- `BACKLOG.md`, open items and history
- `FEATURES.md`, full feature list as of the last major update
- `docs/FLIGHT-DATA-CONTRACT.md`, current field mappings, providers and missing-data behavior
- `docs/TEST-LEDGER.md`, verification and deployment evidence
- `CLAUDE.md` / `AGENTS.md`, instructions for AI agents working in this repo
