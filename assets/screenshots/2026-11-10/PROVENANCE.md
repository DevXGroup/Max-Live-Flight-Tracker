# Screenshot provenance, 2026-11-10

## Final public production checks

Captured around 03:34 Pacific from the public alias `flight.devxgroup.io` after Vercel
deployment `dpl_jcPSn5UEfG6piVd5UNQautposn6S` promoted commit
`dfc43013c499ff3faa9860967ce725ee1959fa6a`. These use real public API responses with no
request interception.

- `public-final-swa1781-desktop.png`, `public-final-swa1781-mobile.png`: completed SWA1781
  lookup, date November 9, gate 103, terminal 1. Desktop and mobile layout visually reviewed.
- `public-final-ual1759-desktop.png`, `public-final-ual1759-mobile.png`: live UAL1759 lookup
  from KOA to DEN. KOA reference coordinates are `19.7388, -156.046005`; two airport markers,
  plane marker, route path, heading 63.02 degrees and no expired-Early badge. Desktop and
  mobile layouts visually reviewed. `public-final-ual1759-mobile-zoomed.png` shows the full
  route after manually zooming out.
- `public-final-ual1759-map-popup.png`: map popup detail capture; parent requested one clearer
  recapture with the popup unobscured.

Viewport checks at 375, 768, 1024 and 1440 pixels found no horizontal overflow or invalid
date/number output. The four direction fixtures below use synthetic intercepted aircraft
responses; the final public captures above do not.

## Cardinal direction fixtures

- `direction-fixture-0.png`, `direction-fixture-90.png`,
  `direction-fixture-180.png`, `direction-fixture-270.png`: public app and real map tiles,
  map-only captures around 1150 × 498. ADS-B response interception supplied synthetic
  SWA9000 coordinates/headings to verify north/east/south/west rotation. These are UI
  fixtures, not real flights. Interception was removed after the check. All four were
  visually reviewed.

## Earlier pre-hotfix captures

- `public-live-ual1759-desktop.png` and `public-live-ual1759-mobile.png` show the production
  deployment before the final fixes: missing KOA path/marker and an Early badge from an
  expired estimate. They are historical evidence only, not screenshots of the current
  release.
