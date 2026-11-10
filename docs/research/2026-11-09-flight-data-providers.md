# Flight data providers: live ADS-B and schedule metadata

**Research date:** 2026-11-09 (America/Los_Angeles). Official provider documentation and terms were checked on this date. Two sample requests were made without credentials: adsbdb callsign lookup and public ADS-B callsign endpoints. No paid endpoint or account was used. This is a source-selection report, not legal advice; terms can change and should be rechecked before launch.

## Recommendation

For a public/commercial tracker, do not rely on OpenSky or adsb.fi without written commercial/operational permission. OpenSky's current terms require a written license for any for-profit use and for operational REST API use in a live product; its data also does not include airline schedules, cancellations, delays, or passenger schedule data. adsb.fi explicitly limits public open-data access to personal, non-commercial use and asks that its source be cited and linked.

For the no-key position layer to evaluate first, test adsb.lol: its own API docs say the API is free and public, its public API/data are under ODbL 1.0, and it asks production users to contact the operator so the service is not disrupted. The precise commercial redistribution obligations under ODbL and the live service's acceptable-use expectations require review before shipping. Keep the ADS-B adapter replaceable and cache results, rate-limit centrally, and avoid calling every source on every page refresh.

Airplanes.live has the clearest current statement that it continues to issue API keys to app developers, but its publicly reachable API now returns a contact request rather than aircraft JSON. Its FAQ says the network is community-run and unfiltered; public current API quota/terms were not found in its official site docs. Contact the provider for an app key and current written terms before relying on it. Do not assume an old no-key API archive or third-party rate-limit note is current.

For route enrichment, adsbdb's no-auth callsign endpoint returned a useful JSON route and airline record for the sample `UAL123`; it does not return live tracking, schedules, delays, actual/estimated times, or gate/terminal. Its site warns that route data may not be copied/published/incorporated into other databases without explicit permission, so use it only after obtaining permission for this public product. No supported free source was verified that legally supplies the full requested feature set for commercial/public use without a key or an agreement.

For reliable schedule/status/airport operations data, use a commercial schedule API or airport/airline feeds under an explicit product license. Aviationstack's current pricing calls its free tier personal and non-commercial, 100 requests/month; paid Basic is listed at $49.99/month (10,000 requests) with commercial use, schedules and airline routes. Aviation Edge's own pages conflict over whether a free key remains available: its Free API Key page says free keys were discontinued due to abuse, while its premium page still refers to free limited keys. Do not plan around a free Aviation Edge key; the site lists paid plans and warns introductory rates renew at much higher regular rates. No account was created and no paid requests were made.

## What the tracker needs vs. what these sources provide

| User-visible field | ADS-B live feeds | Callsign/aircraft reference data | Schedule/status data |
|---|---|---|---|
| Live latitude/longitude, altitude, speed, heading, on-ground, observed callsign | Yes, only when receivers hear the aircraft and it is not otherwise absent from the feed. | No | Sometimes a map/estimated position product, but not the ADS-B raw state this app currently consumes |
| Route origin/destination | Not a dependable field in a single live state. Can be inferred from route databases or track histories; route inference is uncertain. | adsbdb has origin/destination airport records keyed by callsign, with optional midpoint for some routes; route may be stale, absent, or ambiguous for reused/codeshare callsigns. | Yes, flight schedule/status APIs can provide airport pairs for a flight/date |
| Airline name / ICAO/IATA identifiers | Callsign prefix can be parsed, but that is not an authoritative airline record. | adsbdb returns airline name and ICAO/IATA/callsign fields when matched. | Usually included |
| Aircraft type and registration | Some ADS-B aggregators include transponder `t` (type) and `r` (registration) when identified; absent fields are normal. | adsbdb aircraft lookup returns type, ICAO type, manufacturer and registration by Mode-S hex or registration. | Often available with aircraft/registration metadata, depending on provider and plan |
| Scheduled/estimated/actual UTC departure and arrival, delays, status | No. ADS-B state has timestamps/position, not airline schedule commitments or airport operational status. | No | Yes; ensure response timezone semantics and actual vs estimated definitions are documented, then normalize to UTC in app |
| Gate and terminal | No | No | Often offered by paid schedule/status APIs, but airport-provided values can be missing or change late |

**Coverage/confidence caveat:** these are receiver networks, not universal satellite position services. Coverage varies by geography, altitude, receiver density, aircraft equipment, propagation, and intentional filtering/identifier changes. A failed callsign query is not evidence a flight is not operating. A positive route lookup is a timetable/reference match, not proof the aircraft is currently following that route. For route data, require a flight-number/date/airport context where possible and show provenance or mark the result estimated. For ADS-B position, expose “last observed” time and do not represent a stale coordinate as current.

## Provider comparison

### OpenSky Network

- API: OAuth2 client credentials is now the documented programmatic authentication path; tracker code currently calls `https://opensky-network.org/api/states/all` unauthenticated.
- Data: state vectors include icao24, callsign, time, longitude/latitude, altitude, on-ground, velocity, heading, vertical rate and related telemetry. OpenSky says aircraft metadata is crowdsourced/external and its aircraft database is currently irregularly updated.
- Route/schedule: its FAQ says it can derive origin/destination from tracks where possible, but does not map that to commercial schedules and cannot give scheduled flights, cancellations, delays, flight numbers, or passenger counts.
- Current policy: written license required for any for-profit/commercial use, and any operational use of the REST API in a live product/service/automated system, even for nonprofits. Personal/nonprofit research and education are the default licensed uses. Data is as-is; crediting is required for publications/web pages/presentations using its data.
- Decision: not an authorized free production source for this tracker absent a written license. Existing position-chain use should be treated as a policy blocker, not merely quota risk.
- Official sources: [Terms and data license](https://opensky-network.org/about/terms-of-use), [FAQ: API, routes, and metadata](https://dev.opensky-network.org/about/faq), [API documentation](https://openskynetwork.github.io/opensky-api/).

### adsb.fi

- API: no-auth public v2 lookups by hex/callsign/registration and v3 point-radius lookup; v2 point-radius form is deprecated in favor of v3. Public calls are limited to 1 request/second; feeder snapshot is 1 request per 30 seconds. Invalid requests (including 4xx/429) count toward limits and excessive invalid calls can temporarily restrict an IP.
- Data: ADS-B-compatible live aircraft results; appropriate for position and transponder metadata fields available in the feed, not schedules or gate status.
- Current policy: personal, non-commercial use only; cannot license/sell/rent/lease the data/service; cite adsb.fi and link to homepage. Provider asks commercial or higher-rate users to contact it. No warranty; access may be suspended.
- Decision: good personal-use development fallback with attribution and sensible caching; not free production use for a commercial product without negotiated permission.
- Official source: [adsb.fi open-data API README and terms](https://github.com/adsbfi/opendata/blob/main/README.md).

### adsb.lol

- API: public REST JSON, no key on the documented public API, ADS-B Exchange-compatible v2 endpoints including callsign, hex, registration/type, and location-radius (up to 250 NM); docs also list `/api/0/routeset` as POST. Do not infer the route endpoint's commercial right or semantics from its name; inspect the current schema and ask the maintainers before depending on it.
- Data/license: API docs state the API and public data are ODbL 1.0. This entails license/attribution/share-alike duties for database use and redistribution; get a product-specific legal read before combining/redistributing data in the app.
- Limits/availability: current docs describe the API as free/open and say a key may be required in future, obtainable by feeding data. Production users are explicitly asked to contact the maintainer so they do not break an application accidentally. No fixed public requests-per-second/day figure was found in official docs; treat limits as unpublished and capacity best-effort. Free adhoc keys have no commercial guarantee and may be temporarily rate-limited; key request asks applicant to explain ODbL compliance.
- Decision: strongest no-key candidate to evaluate for live position, subject to ODbL review, operator contact, caching, and robust failover. Not a schedule provider.
- Official sources: [API docs and endpoint list](https://api.adsb.lol/docs), [open data API page](https://www.adsb.lol/docs/open-data/api), [API key/production note](https://www.adsb.lol/request), [ODbL 1.0 text](https://opendatacommons.org/licenses/odbl/1-0/).

### Airplanes.live

- Data: community receiver ADS-B/MLAT aggregator. Official FAQ says it merges volunteer receivers and does not filter aircraft on the map; actual API availability/coverage remains dependent on receiver observation and service policy.
- API: existing app URL pattern `/v2/callsign/{callsign}` worked from the local tracker environment previously, but a fresh no-key sample GET during this research returned a contact message asking for project links/description rather than an `ac` response. Thus current unauthenticated production suitability is unverified and currently unavailable from this tested request path.
- Terms/limits: current official FAQ/about pages describe community/public-interest mission but do not state API rate limits or a blanket commercial API grant. Their public FAQ provides contact details; obtain API access/terms in writing. Historical/third-party API archives and forum/issue claims about quotas are not authoritative enough to establish current quotas.
- Decision: contact for an API key and terms; don't treat as an anonymous drop-in source until granted access.
- Official sources: [FAQ](https://airplanes.live/faq/), [About](https://airplanes.live/about/), [project GitHub organization](https://github.com/airplanes-live/).

### adsbdb.com

- API: public no-key endpoints for aircraft by Mode-S/registration and callsign route lookup. A sample `GET https://api.adsbdb.com/v0/callsign/UAL123` returned JSON with United Airlines and LHR–IAD airports (as observed 2026-11-10 UTC). Site documents rolling 60-second rate blocking at 512+ requests (60 seconds) and 1024+ (300 seconds); this is a protective block, not a service guarantee. Caching and low request frequency are appropriate.
- Route response: callsign, IATA/ICAO callsigns, airline identifiers/name, origin and destination airport codes/coordinates/names, and sometimes midpoint. Aircraft endpoint can return manufacturer, aircraft type/ICAO type, Mode-S, registration and registered owner.
- Critical data-rights caveat: adsbdb explicitly says flight-route data is the work of named contributors and may not be copied, published, or incorporated into other databases without explicit permission. Public GET access is not an unrestricted license to republish route data in this product. Ask for explicit permission before displaying or storing route results publicly.
- No schedule times, live positions, delay/status, gates, or terminals.
- Official source: [adsbdb API documentation and route-data notice](https://www.adsbdb.com/).

### Aviationstack

- API: API key required. Real-time flights endpoint advertises flight, airport and airline data; provider FAQ says real-time status may lag 30–60 seconds. Its product documentation lists schedule/history/future features on paid tiers and documents schedule/status fields such as scheduled, estimated and actual times, terminals, gates, delays, flight status and identifiers.
- Current terms/pricing: free tier is 100 monthly requests, personal/non-commercial only. Commercial use is in the paid Basic tier; listed at $49.99 month-to-month, with 10,000 requests/month and schedule/route features. The pricing page also describes quota alerts and possible overage billing once plan volume is exceeded. Confirm exact endpoints/features for a selected plan before implementation; the free tier is not suitable for a public commercial deployment.
- Decision: plausible one-vendor schedule/status source if the paid tier's live fields and budget fit; not free for production commercial use. Do not assume schedule endpoints are included in free tier.
- Official sources: [Pricing and limits](https://aviationstack.com/pricing/), [FAQ: accuracy, free plan, overages](https://aviationstack.com/faq), [flight data API fields](https://aviationstack.com/documentation).

### Aviation Edge

- API: paid flight tracker, live/future/historical schedule and routes endpoints. Official documentation lists useful fields: status; departure/arrival IATA/ICAO, terminal, gate, delay, scheduled/estimated/actual time; airline name and IATA/ICAO codes; flight numbers; future schedule response includes aircraft model.
- Free tier status is inconsistent across its current official site: the dedicated Free API Key page says free keys were discontinued due to abuse; premium pricing/FAQ still mention free limited keys. No new key or paid plan was tested. Do not treat it as a dependable free path; request written clarification and current price/terms first.
- Price risk: premium page says displayed $7/$15/$39 introductory monthly price is only for the first month and then renews at $299/$599/$1499 respectively. Confirm renewal in writing and billing controls before signup.
- Decision: technically feature-rich schedule candidate, but no verified free production access and pricing/renewal requires careful review.
- Official sources: [Flight status and schedule fields](https://aviation-edge.com/flight-data/), [premium plan/renewal terms](https://aviation-edge.com/premium-api/), [Free API key notice](https://aviation-edge.com/free-api-key/), [FAQ](https://aviation-edge.com/frequently-asked-questions/).

## Existing implementation observations

The local wrapper directory is not the Git repository; the project lives in `Live-Flight-Tracker/max-live-flight-tracker`. `src/lib/opensky.ts` currently tries OpenSky then adsb.fi then airplanes.live for live state, with callsign search. It maps ADS-B fields including callsign, lat/lon, altitude, speed, track, registration and type. The adsb.fi path uses `/v2/callsign/{callsign}`. The Amadeus module still targets `test.api.amadeus.com` and `/v2/schedule/flights`; its shape includes scheduled departure date, timing qualifiers, terminal and gate, but it is not a live commercial source as currently configured. `src/lib/api.ts` also contains Aviationstack response mapping and a separate FlightAware scrape path. The static sample data is not live truth. Route and ETA fallbacks synthesized from position/last contact should be labeled estimates, not airline-published schedule data.

A server API call hides keys from the browser but does not resolve provider licensing, freshness, quota, or false-route matching risks. Cache keys should include normalized flight/callsign plus local service date and airports when known. Keep position and schedule sources separate, store source timestamps, and never silently turn an empty or stale feed into a fabricated current position or schedule.

## Sample request observations

- adsbdb route GET without auth returned HTTP 200 and a populated UAL123 route/airline JSON object.
- adsb.lol and adsb.fi public GETs without auth returned HTTP 200 JSON with an empty aircraft array for the sample UAL123 (not evidence of endpoint failure; aircraft may not have been airborne/observed). A hex sample also returned empty arrays in this environment, so sample data did not prove field completeness.
- Airplanes.live no-key sample GET returned a contact instruction instead of aircraft results, supporting the current need to request app access.
- Tests were limited to a few low-volume no-key GETs, not a coverage or reliability benchmark.

## Sources and dates

All documentation/source claims above were checked 2026-11-09 local date; sample API requests occurred 2026-11-10 UTC. Official pages with rapidly changing pricing, terms, and quotas should be rechecked immediately before adoption. Third-party references were excluded from provider policy conclusions.
