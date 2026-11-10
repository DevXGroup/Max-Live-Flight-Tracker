# Flight provider repair: scoped security review

Date: 2026-11-09, America/Los_Angeles. Base `f3c87db`; local replacement before production release. Scope: browser UI, public read-only lookup route, provider adapters, short-lived memory caches, map tiles and dependency updates. No authentication, payment, database, account, credential or production-setting change.

This is a scoped repair review, not a whole-application certification. Final combined checks and independent review evidence are recorded in `TEST-LEDGER.md`. Fixture tests and live probes are distinguished below. No Supabase component exists in this app, so database advisors and restore checks do not apply.

| Check | Applicability and result | Evidence and limitation |
|---|---|---|
| SEC-01 Authentication | N/A | The lookup is deliberately public and has no private account operation |
| SEC-02 Secrets | Checked | Provider module is server-only; browser wrapper imports the public type. Gitleaks history/current-source scans found no secrets. Exact local credential-value comparison against browser artifacts is recorded in the ledger |
| SEC-03 Database/storage | N/A | No persistent database or shared object store; bounded memory caches only |
| SEC-04 Transport | Checked | Fixed upstream HTTPS URLs; no AviationStack HTTP downgrade. Local development HTTP binds loopback only |
| SEC-05 Passwords | N/A | App has no password storage |
| SEC-06 Input validation | Checked | Server flight grammar/length validation and fixed hosts; malformed/missing/script/traversal-like inputs returned JSON 400 locally |
| SEC-07 Rendering | Source reviewed and fixture-tested | React text rendering, bounded numeric normalization, no new unsafe HTML sink. Map labels and null-data render checks are in the ledger |
| SEC-08 Monitoring | Existing follow-up | Structured safe failures and UI refresh notice; operator alert delivery is not implemented. Canonical backlog `add-monitoring` remains open |
| SEC-09 Admin authorization | N/A | No admin route or privilege model |
| SEC-10 Queries | N/A | No SQL or user-controlled query language; URL parameter values are encoded |
| SEC-11 Configuration | Checked | Public credential prefixes removed from examples; default no-key provider works without secrets. Optional feeds require explicit selection and permitted use. `.env.local` was preserved |
| SEC-12 Resource limits | Checked, per-process only | Unit tests exercise deduplication, max-eight unique in-flight work, bounded success/negative caches and overload rejection. Provider cooldowns and deadlines are implemented. These are not a distributed quota guarantee across Vercel instances |
| SEC-13 CORS | Same-origin design | Browser uses `/api/flight`; no credentialed cross-origin API grant was added. Tiles load as ordinary cross-origin images |
| SEC-14 Browser headers | Unchanged, not a whole-site hardening audit | No new CSP/framing policy was imposed. OSM tiles require ordinary browser Referer/cache behavior. Existing headers are not represented as fully audited |
| SEC-15 Sessions | N/A | No app session cookie or refresh-token handling |
| SEC-16 CSRF | N/A | Public GET lookup has no authenticated state-changing operation |
| SEC-17 Recovery | N/A | No password/account recovery |
| SEC-18 Uploads/imports | N/A to user files | No upload/import endpoint. Fixed trusted reference CSV parsing is size-bounded; route identities, airport coordinates and shape are checked |
| SEC-19 Payments | N/A | No pricing, entitlement or payment feature |
| SEC-20 Debug exposure | Checked at local route boundary | Safe 400/404/503 JSON; no raw upstream body, credential-bearing URL or stack trace is returned. Production deployment verification is a separate gate |
| SEC-21 Dependencies | Production audit clear; dev follow-up | Compatible Next/Sharp/source-map-js and dev patches applied. Seven moderate dev-only ESLint/minimatch advisories remain outside the current upstream compatible range; tracked as `dev-linter-minimatch-advisory`. No forced major override |
| SEC-22 Unused packages | No speculative removal | Existing map/globe/animation dependencies preserved. Historical unsupported adapters remain disconnected rather than silently deleted |
| SEC-23 Files/artifacts | Checked locally | `/.env.local` returns 404. Public browser output is scanned by exact secret-value comparison. No vault files, database dumps or private account records are in the change |
| SEC-24 Git history | Checked | Full reachable Git history scanned by Gitleaks 8.30.1 with redaction, exit 0, zero findings. Current-source packet also zero; final changed-patch scan recorded separately |
| SEC-25 Credential incident response | No new exposure established | No key was rotated, restored, copied into config or revoked. Missing runtime configuration and deprecated services are not proof of credential compromise or deletion by a specific person |
| SEC-26 Threat review | Required before release | Main review traced query-to-provider-to-normalizer-to-UI; independent subscription review and dispositions are recorded in the ledger |
| SEC-27 Regressions/report | Required before release | Real live lookup plus fixture/negative/overload/identity/age checks; final gate table and commit state are in the ledger |

## Data licenses and privacy boundaries

Default aircraft data is attributed to adsb.lol under ODbL. VRS reference data is CC0 and remains visibly reference-only. OSM background tiles carry contributor attribution and normal browser caching, with no bulk download. These are distinct sources, not a newly redistributed persistent combined database. App source-code licensing is separate.

Searches send a flight identifier from this server to the selected flight source; map tile requests go from the browser to the map host. The app does not add passenger information, a device-location request, an analytics SDK or a user account. No source permission, partnership, completeness, universal coverage or service-level guarantee is inferred from an HTTP 200. Optional sources are not activated merely because a key exists elsewhere.

The linked public `/data-and-privacy` notice names the live, reference, optional, map
and hosting services and explains the data flow, brief application caching and privacy
contact. It links the existing DevX policy and verified hosting/map policies. This scoped
change does not claim to verify vendor contracts, infrastructure log retention, Article 27
representation or international-transfer arrangements for the company as a whole.

## Remaining operational limits

No eligible free source was verified to provide every airline schedule field globally. Provider outages and receiver coverage gaps remain possible. Production alerting and an independent permitted fallback remain backlog work. The owner must approve the production release; local tests do not establish that the public alias has updated.
