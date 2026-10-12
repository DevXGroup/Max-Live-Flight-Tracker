# Live Flight Tracker: Claude Project Instructions

Read in this order: `BRIEF.md`, `BACKLOG.md`, `docs/DECISIONS.md` (if it exists), then this
file.

## What this is

Next.js app that tracks a single flight live on a map. See `BRIEF.md` for the full picture.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind v4
- Maps: `react-leaflet` (2D) and `react-globe.gl` / `three` (3D globe)
- Data: OpenSky Network (live position, no key), AviationStack + Amadeus (route/schedule
  metadata, optional keys), FlightAware (scraping fallback, no key)
- `framer-motion` for animation

## Run / build

- `npm run dev`, local dev server
- `npm run build`, production build
- `npm run lint`, ESLint

## Hard rules

- **No API keys in client code.** All third-party calls go through
  `src/app/api/flight/route.ts` server-side. Never add `NEXT_PUBLIC_` in front of a key that
  isn't meant to be public, this was a real bug fixed in commit `7981093`.
- **This is not a Parlin, nutrify, or devx-web asset.** Don't cross-import keys, branding, or
  code from other DevX projects.
- **`.env.local` is gitignored and must stay that way.** Never commit real API keys.
- Deploy target: Vercel, `flight.devxgroup.io`. No pricing, checkout, or payment code belongs
  here, this project is free, not a product.

<!-- BEGIN POWERKIT: VISUAL DOCUMENTATION -->
## Company identity and visual explanations

- The company name is **DevX Group LLC**. Include LLC whenever naming the company.
  Keep domains, package scopes and GitHub identifiers unchanged.
- For architecture, workflows, audits, setup and decisions needing Max's attention,
  use a visual overview plus a separate detailed Markdown companion. Use the shared
  Form Relay office-launch house style and the authentic infinity + company wordmark.
- Read `~/Desktop/CODE/claude-code-powerkit/docs/VISUAL-DOCUMENTATION-STANDARD.md`
  and `~/Desktop/CODE/claude-code-powerkit/skills/clean-diagram/SKILL.md`.
  HTML/CSS, layout, logo assets and companion template live together in that skill.
- Save editable JSON + generated HTML/PNG beside the Markdown, open visuals for Max,
  update docs with core changes, and track unfinished findings in `BACKLOG.md`.
  Regenerate from sources; don't hand-edit output. HTML motion is optional and
  respects reduced-motion; PNG and print stay static.
<!-- END POWERKIT: VISUAL DOCUMENTATION -->
