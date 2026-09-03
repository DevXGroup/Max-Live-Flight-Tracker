# Live Flight Tracker

Look up a flight number and see it tracked live on an interactive map: position, speed,
altitude, heading, and time remaining. Data comes from the OpenSky Network (live position),
AviationStack and Amadeus (route/schedule metadata), and a FlightAware scraping fallback,
combined with a local airport-coordinate database.

Live at `flight.devxgroup.io`.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000 and search a flight number (e.g. "BA36").

```bash
npm run build   # production build
npm run start   # serve the build
npm run lint    # eslint
```

## Config

Copy `.env.example` to `.env.local`. AviationStack and Amadeus keys are optional; OpenSky
needs no key. See `.env.example` for the exact variable names.

## Docs

- `BRIEF.md` — what this is, who it's for, current status
- `BACKLOG.md` — open items and history
- `FEATURES.md` — full feature list as of the last major update
- `CLAUDE.md` / `AGENTS.md` — instructions for AI agents working in this repo
