# Flight repair screenshot provenance

Captured 2026-11-09 America/Los_Angeles from the local Next.js app at
`http://127.0.0.1:3013`, based on the repair of `f3c87db`. Browser viewports were
1440 by 1000 and 375 by 900 CSS pixels. Full-page captures include the complete
page. Browser developer indicators in development captures are not production UI.

- `flight-before-tile-fix-desktop.png` and `flight-before-tile-fix-mobile.png`:
  real SWA1781 response from adsb.lol with a VRS reference route; old CARTO tiles
  visibly display API KEY REQUIRED. Captured after the flight adapter repair but
  before the map tile repair. These images prove a distinct tile failure, not a
  server JSON failure.
- `flight-live-desktop.png` and `flight-live-mobile.png`: real SWA1781 observation
  in the local production build, with key-free OpenStreetMap map background, source/license attribution and
  unconfirmed reference route. No schedule, gate, terminal, model or ETA was
  invented to fill the card.

The flight number and aircraft data are public observations. No passenger name,
account identity, credential, token, private URL or user-device location is shown.
Do not attach the private conversation's personal context to public reuse.

Fixture checks used synthetic data through browser request interception. They
verified null fields, real zero coordinates/telemetry, long airline text,
schedule-only airport markers, airport timezones and actual-arrival precedence,
refresh failure with retained data, malformed response rejection, not-observed
errors, stale observation labeling and blocked tile handling. Fixture results
are separate from the real live screenshots.

Final live screenshots were refreshed from the final production build after backend review fixes and include the footer data-and-privacy link. `data-and-privacy-mobile.png` and `data-and-privacy-desktop.png` capture the public disclosure at the same viewports; both were visually inspected and had no horizontal overflow. Final API probes returned SWA1781 HTTP 200 and the fixed diagnostic endpoint HTTP 404 with the expected NOT_OBSERVED code, rather than its former relative-fetch 500.

The last two map-control sizing changes came after the live screenshots.
`flight-controls-replay-desktop.png` and `flight-controls-replay-mobile.png` replay an
earlier real response through browser interception only to check that final layout.
They are not a current live lookup. The visible stale-position warning correctly
reflects the recorded observation's age. Zoom controls measured 44 by 44 pixels and
Update measured approximately 104 by 44 at both viewports. These images were visually
inspected after tiles and resize transitions settled. Interception was removed.

Subsequent real SWA1781/WN1781 probes returned On Ground, then the source stopped
providing a recent observation. A new search correctly returned NOT_OBSERVED rather
than inventing a position, cancellation, gate arrival or completed schedule.
