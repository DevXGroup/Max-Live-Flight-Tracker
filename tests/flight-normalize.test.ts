import assert from 'node:assert/strict';
import test from 'node:test';
import { callsignMatches, emptyFlight, missingFlightFields, normalizeAircraft, normalizeFlightNumber, parseAdsbSnapshot, remainingTimeFromEstimate, selectAircraft, withPosition } from '../src/lib/flight-normalize';
import { FlightLookupError } from '../src/lib/flight-types';

const plane = (overrides: Record<string, unknown> = {}) => ({ hex: 'a1b2c3', flight: 'WN1781 ', seen_pos: 10, lat: 0, lon: 0, alt_baro: 0, gs: 0, track: 0, ...overrides });

test('validates flight numbers including digit-bearing IATA codes and keeps leading zeroes', () => {
    assert.equal(normalizeFlightNumber(' wn 0178a '), 'WN0178A');
    assert.equal(normalizeFlightNumber('B6 123'), 'B6123');
    assert.equal(normalizeFlightNumber('U2123'), 'U2123');
    assert.equal(normalizeFlightNumber('5X123'), '5X123');
    assert.equal(normalizeFlightNumber('W1781'), 'W1781');
    assert.equal(normalizeFlightNumber('ryr12ab'), 'RYR12AB');
    for (const invalid of ['', '1781', 'WN12345', 'WN17!']) {
        assert.throws(() => normalizeFlightNumber(invalid), (e: unknown) => e instanceof FlightLookupError && e.code === 'INVALID_FLIGHT');
    }
});

test('matches approved IATA and ICAO callsign aliases exactly', () => {
    assert.equal(callsignMatches('SWA1781', 'WN1781 '), true);
    assert.equal(callsignMatches('WN1781', 'SWA1781'), true);
    assert.equal(callsignMatches('WN1781', 'WN11781'), false);
    assert.equal(callsignMatches('RYR12AB', 'RYR12AB '), true);
    assert.equal(callsignMatches('RYR12AB', 'FR12AB'), false);
});

test('selects only exact fresh matches, including zero coordinates and snapshot age', () => {
    const wall = 1_800_000_000_000;
    const snapshot = (row: Record<string, unknown>, now = wall) => ({ now, ac: [plane(row)] });
    assert.equal(selectAircraft('WN1781', snapshot({ flight: 'WN1782' }), wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({ seen_pos: 121 }), wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({ lat: 91 }), wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({ lat: null }), wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({ lon: '' }), wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({ seen_pos: null }), wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({ seen_pos: '' }), wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({ hex: 'not-hex' }), wall), null);
    assert.equal(selectAircraft('WN1781', { now: wall, ac: [null as never] }, wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({}), wall)?.aircraft.hex, 'a1b2c3');
    assert.equal(selectAircraft('WN1781', snapshot({}, wall - 121_000), wall), null);
    assert.equal(selectAircraft('WN1781', snapshot({}, wall + 6_000), wall), null);
});

test('rejects ambiguity when distinct aircraft report the same callsign', () => {
    const now = 1_800_000_000_000;
    assert.throws(() => selectAircraft('WN1781', { now, ac: [plane(), plane({ hex: 'd4e5f6' })] }, now), (e: unknown) => e instanceof FlightLookupError && e.code === 'NOT_OBSERVED');
});

test('preserves zero-valued telemetry and does not mistake hex for registration', () => {
    const now = 1_800_000_000_000;
    const p = normalizeAircraft(plane(), now, now);
    assert.equal(p.lat, 0);
    assert.equal(p.lon, 0);
    assert.equal(p.speed, 0);
    assert.equal(p.heading, 0);
    assert.equal(p.altitude, 0);
    assert.equal(p.onGround, false);
    assert.equal(p.registration, null);
    assert.equal(p.hex, 'A1B2C3');
});

test('unknown ground state stays unknown and altitude zero is not treated as ground', () => {
    const now = 1_800_000_000_000;
    const position = normalizeAircraft(plane({ alt_baro: null }), now, now);
    const flight = emptyFlight('WN1781', new Date(now));
    withPosition(flight, position);
    assert.equal(position.onGround, null);
    assert.equal(flight.status, 'Unknown');
    assert.equal(normalizeAircraft(plane({ alt_baro: 0 }), now, now).onGround, false);
});

test('missing schedule fields remain null and are reported, with no invented timestamps', () => {
    const flight = emptyFlight('WN1781', new Date('2026-11-09T12:00:00.000Z'));
    assert.equal(flight.departure.scheduledTime, null);
    assert.equal(flight.arrival.estimatedTime, null);
    const now = Date.parse('2026-11-09T12:00:00.000Z');
    withPosition(flight, normalizeAircraft(plane(), now, now));
    assert.equal(flight.departure.scheduledTime, null);
    assert.equal(flight.liveData.latitude, 0);
    assert.ok(missingFlightFields(flight).includes('departure.scheduledTime'));
    assert.ok(missingFlightFields(flight).includes('arrival.gate'));
    assert.ok(missingFlightFields(flight).includes('departure.timezone'));
    assert.ok(missingFlightFields(flight).includes('arrival.longitude'));
    assert.ok(missingFlightFields(flight).includes('liveData.progress'));
    assert.ok(missingFlightFields(flight).includes('liveData.remainingTime'));
});

test('invalid envelopes and missing position timestamps are not treated as empty fresh results', () => {
    assert.equal(parseAdsbSnapshot({ ac: [] }), null);
    assert.equal(parseAdsbSnapshot({ now: '1800000000000', ac: [] }), null);
    assert.equal(parseAdsbSnapshot({ now: 1_800_000_000_000, ac: [] })?.ac.length, 0);
    assert.throws(() => normalizeAircraft(plane({ seen_pos: null }), 1_800_000_000_000, 1_800_000_000_000), (e: unknown) => e instanceof FlightLookupError);
});

test('remaining time only uses a future estimated arrival for an active or delayed flight', () => {
    const now = Date.parse('2026-11-09T12:00:00.000Z');
    assert.equal(remainingTimeFromEstimate('2026-11-09T13:35:00.000Z', 'Active', now), '1h 35m');
    assert.equal(remainingTimeFromEstimate('2026-11-09T13:35:00.000Z', 'Delayed', now), '1h 35m');
    assert.equal(remainingTimeFromEstimate('2026-11-09T11:35:00.000Z', 'Active', now), null);
    assert.equal(remainingTimeFromEstimate('2026-11-09T13:35:00.000Z', 'Landed', now), null);
    assert.equal(remainingTimeFromEstimate(null, 'Active', now), null);
});
