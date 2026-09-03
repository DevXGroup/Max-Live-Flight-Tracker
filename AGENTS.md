# Live Flight Tracker

A Next.js app that tracks a single flight live on an interactive map.

Read in this order: `BRIEF.md`, `BACKLOG.md`, `CLAUDE.md`.

## Commands

- `npm run dev`, local dev server
- `npm run build`, production build
- `npm run lint`, ESLint (no separate test suite exists)

## Rules that actually bite

- Never expose an API key to the client. All third-party flight data calls go through the
  server route at `src/app/api/flight/route.ts`, not directly from components.
- `.env.local` holds real keys and is gitignored. Never print its contents or commit it.
- This project has no pricing or checkout code. Don't add any without an explicit ask.
