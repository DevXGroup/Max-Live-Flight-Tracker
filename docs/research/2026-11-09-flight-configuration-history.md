# Live Flight Tracker configuration history

**Checked:** 2026-11-09 (UTC)
**Scope:** Read-only Vercel event, project, deployment, runtime log, and repository history review. No environment values were read or changed.

## Verified findings

- The `devxgroup` team Activity API is accessible through `vercel activity`. The filtered query covered the last 180 days, paged through 235 environment-variable add, edit, or delete events (three pages), and returned no event matching project `max-live-flight-tracker` or its Vercel project ID.
- Vercel's project metadata reports production branch `main`. The latest production deployment instead uses commit `115fc9169`, on the Dependabot branch `dependabot/npm_and_yarn/minor-and-patch-9018ddc3b1`. Its only changed files are `package.json` and `package-lock.json`; the commit message identifies a grouped dependency update. This deployment does not establish an environment-variable change.
- The recent deployment history checked showed READY deployments; no failed deployment was found in the inspected recent set.
- Production runtime logs show Amadeus is skipped because credentials are not configured and the AviationStack fallback has no API key. A separate lookup reached FlightAware, which returned HTTP 402.
- Repository history shows commit `7981093` (August 25, 2026) removed `NEXT_PUBLIC_` fallbacks for Amadeus and AviationStack to avoid exposing credentials in the browser bundle. That code change did not remove the server-side variable names and is not evidence that project variables were deleted.

## What remains unknown

The available records do not identify when or who cleared the production variables. The Activity API query found no matching event in its 180-day window, but this is not a full account audit export. Vercel documents Audit Logs with actor and event metadata as an Enterprise feature; an eligible owner or security-role member can export up to 90 days from Team Settings. No such export was available during this check.

## Independent map tile failure

The local render of the unchanged CARTO tile URL showed API KEY REQUIRED images while
the repaired flight JSON endpoint returned valid SWA1781 data. This is independent of
the missing server flight-provider variables and may explain the user's visible API
message. CARTO's current official basemap page requires a key for raster/vector tiles.
The old code's tile URL included no key. This evidence establishes a currently broken
keyless tile dependency, not who removed a key or the date the provider requirement
changed. The repair uses policy-compliant OpenStreetMap tiles without new credentials.

References: [CARTO basemaps](https://carto.com/basemaps),
[OpenStreetMap tile policy](https://operations.osmfoundation.org/policies/tiles/).

## Evidence and limits

- Vercel event API: three pages, 235 matching event types in the last 180 days; zero flight project matches.
- Vercel project metadata: production branch `main`.
- Vercel deployment metadata and GitHub commit metadata: current production commit is a dependency-only Dependabot update, not a code change to flight API configuration.
- Vercel runtime logs: configuration-missing messages and FlightAware 402 observed. Logs are transient request evidence, not a history of environment-variable edits.
- Official references: [Activity Log](https://vercel.com/docs/activity-log) and [Audit Logs](https://vercel.com/docs/audit-log).
