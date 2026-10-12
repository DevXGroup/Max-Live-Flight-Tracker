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
