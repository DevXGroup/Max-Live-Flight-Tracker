# Flight data research through Perplexity

Date: 2026-11-09, America/Los_Angeles. Perplexity research on the signed-in Pro subscription in the connected DevX Chrome profile. The UI reported Finished after 54 seconds and listed 149 sources. The page had no separately selectable Deep Research control; the query requested Deep Research. This record is a condensed answer and independently checked implementation decision, not a verbatim transcript or an uptime benchmark.

Research session: https://www.perplexity.ai/session/b1428c5f-95d3-4399-8eb7-aa220673abd4

## Prompt

Deep Research. As of November 2026, recommend the most reliable genuinely free data architecture for a public Next.js single-flight tracker. It shows a live map/globe, airline and flight number, departure/arrival airports with coordinates/time zones, scheduled/estimated/actual times, status/delay/gate/terminal, aircraft type/registration, altitude/speed/heading, progress and arrival countdown. Current sources: OpenSky, adsb.fi, airplanes.live, optional AviationStack, deprecated Amadeus Self-Service, and a brittle FlightAware website scraper. We must preserve the UI by adapting provider JSON to one stable contract, never invent missing values or call an estimate an official schedule. No spending or new paid plan. Compare adsb.lol, adsb.fi, airplanes.live, adsbdb, OpenSky, AviationStack and any stronger free replacement. Verify Amadeus shutdown from primary sources. Distinguish live ADS-B measurements from historical callsign-to-route metadata and airline schedule feeds. For each option cite official endpoint/docs, exact JSON fields and units, auth, truly free quotas, public/commercial use limits, attribution/license, caching/rate restrictions, geography/ground coverage, freshness, service guarantees, and missing fields. Can adsbdb or routeset provide reliable current flight routes? How detect wrong legs/reused flight numbers and stale positions? Give a recommended free stack, provider-to-UI mapping table, fallback/error/timeouts/cache policy, and honest limits. Use primary sources only with direct URLs and dates. Explicitly identify terms/permission not established. Do not assume one free API returns all schedule and gate data. No marketing language or em dashes.

## Answer and decision

The research recommends an observation-first architecture: adsb.lol for public live telemetry, an optional eligible independent fallback, locally known airport information, and explicitly nullable airline operational fields. No reviewed free source establishes complete worldwide date-specific schedules, gates, delays, cancellations and reliable live aircraft position together. Preserve the application-owned JSON schema through adapters; preserve missing data as null rather than invented values.

adsb.lol publishes its public data under ODbL 1.0. Its current public callsign endpoint returns ADS-B observations without a key. Free service is best effort, with no commercial capacity guarantee. Include attribution and data-license links in the UI and API documentation. Do not claim the code itself is ODbL or combine feeds into a persistent redistributed database without reassessing licensing. Operator contact is recommended for production planning; this session sent no message and requested no account/key.

FlyItalyADSB was identified as a possible independent fallback. Its terms dated 2026-10-27 explicitly permit commercial use on the Free plan and server caching for the product's users. An account and X-Api-Key are required. The research describes 30 requests/minute and 300,000/month, best effort, with rejected over-limit requests rather than automatic overage charges. Terms and plan limits must be verified again during onboarding. No account was created and this provider is not enabled by this repair.

OpenSky, adsb.fi and Airplanes.live have materially different access/reuse conditions. They must not be unconditional fallbacks just because a URL returns JSON. AviationStack's free tier is small and personal/noncommercial; it remains an explicitly configured enrichment path, not the default no-key service. adsbdb route-publication permission was not established, so its route API is not added to production.

For route candidates, Virtual Radar Server standing-data is published as CC0. This repair pins revision `7db1e656f68f7bb4064b92c345ea0937a0ea44db`, checks exact callsign matching, refuses multi-leg/ambiguous records and screens geographic plausibility per observation. These are historical/reference route candidates, not confirmed current itineraries. No schedule, ETA, landed state or progress is inferred from them. The live adsb.lol routeset query returned an empty HTTP 201 response in this session, so it is not used.

## Cross-checks performed independently

- Official Amadeus GitHub organization marks the program deprecated and archived on 2026-07-17. The locally referenced `test.api.amadeus.com` failed DNS resolution. Enterprise remains a different offering; restoring a Self-Service key is not a replacement.
- adsb.lol's official page explicitly links ODbL 1.0; its published OpenAPI includes callsign and routeset endpoints. A live callsign GET for SWA1781 returned an aircraft observation with position, speed, altitude, registration, track, snapshot time and position age. Fields can still be absent.
- The official VRS repository identifies CC0-1.0. Its pinned SWA CSV has an exact SWA1781 reference row; airport CSVs carry coordinates and names. A positive historical match does not establish the operating date or current leg.
- FlyItalyADSB's official terms explicitly allow commercial Free use and server-side caching; no free-account access or live coverage was tested.

## Contract rules carried into the repair

Convert each provider's units explicitly. ADS-B `gs` is knots; `alt_baro` is feet or the string ground. Ground track is movement direction, not heading. Position age is snapshot time minus `seen_pos`, never time of fetch or last non-position message. Validate finite ranges, exact identity and ambiguity. Missing timestamps cannot support a live label. Ground does not mean arrived at a gate. Airline schedule actual/estimated/scheduled times remain separate and require unambiguous timezones.

Use bounded network timeouts, a small short-lived cache, request deduplication and bounded cache size. Process-local caching is not a cross-region serverless quota guarantee. Keep optional enrichment off the critical position path where possible, and preserve valid telemetry if an enrichment request fails. User-facing errors distinguish not observed from upstream unavailability. A missing observation never proves a cancellation.

## Primary sources

- https://www.adsb.lol/docs/open-data/api
- https://api.adsb.lol/api/openapi.json
- https://www.adsb.lol/request
- https://github.com/adsblol/api
- https://opendatacommons.org/licenses/odbl/1-0/
- https://github.com/vradarserver/standing-data
- https://github.com/amadeus4dev
- https://developers.amadeus.com/
- https://github.com/adsbfi/opendata/blob/main/README.md
- https://opensky-network.org/about/terms-of-use
- https://openskynetwork.github.io/opensky-api/rest.html
- https://airplanes.live/api-docs/
- https://airplanes.live/commercial-use/
- https://www.adsbdb.com/
- https://aviationstack.com/pricing
- https://aviationstack.com/documentation
- https://flyitalyadsb.com/en/terms/
- https://flyitalyadsb.com/openapi.json
- https://flyitalyadsb.com/en/data/api/docs/fields/
- https://flyitalyadsb.com/en/data/api/docs/limits-and-errors/

Sources were inspected on the research date; most do not supply an update date. The older Amadeus test-data guide is archived historical documentation and must not be used as evidence that Self-Service still operates.
