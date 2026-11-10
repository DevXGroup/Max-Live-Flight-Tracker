# Screenshot provenance, 2026-11-10

## Public live lookup before hotfix

- `public-live-ual1759-desktop.png`: real public alias `flight.devxgroup.io`, exact
  production release `0fd784019ee12633706cbea77bcc36b663d65fd4`, 1440 × 1000 viewport,
  captured about 03:09 Pacific. No request interception. It shows the missing KOA map
  marker/path and an Early badge from a past estimated arrival; both are fixed locally
  but not deployed. Parent visually reviewed this capture.
- `public-live-ual1759-mobile.png`: same release and live lookup, 375 × 900 viewport,
  no request interception. It has the same pre-hotfix state. Parent's mobile visual
  review was pending when this provenance was written.

## Cardinal direction fixtures

- `direction-fixture-0.png`, `direction-fixture-90.png`,
  `direction-fixture-180.png`, `direction-fixture-270.png`: public app and real map tiles,
  map-only captures around 1150 × 498. ADS-B interception supplied synthetic SWA9000
  coordinates/headings to verify north/east/south/west rotation. These are UI fixtures,
  not real flights. Interception was removed after the check. Parent visually reviewed
  all four direction fixtures and the public desktop capture.

The completed-record, KOA-coordinate and expired-estimate hotfixes are not deployed. Do
not use the live captures as evidence that these changes are present in production. When
final production captures are added, include capture time, viewport, URL, lookup mode,
whether data was live or replayed, and exact deployment/commit.
