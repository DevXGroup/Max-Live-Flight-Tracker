import assert from 'node:assert/strict';
import test from 'node:test';
import {
    calculateRemainingTime,
    formatFlightAge,
    formatFlightTime,
    isFlightPositionStale,
    isValidFlightDate,
    resolveFlightTimeZone,
} from '../src/lib/flightUtils';

test('invalid and elapsed times are unavailable, not treated as arrival', () => {
    assert.equal(calculateRemainingTime(null), 'Unavailable');
    assert.equal(calculateRemainingTime('not a date'), 'Unavailable');
    assert.equal(calculateRemainingTime('2000-01-01T00:00:00Z'), 'Unavailable');
    assert.equal(formatFlightTime('not a date'), 'Unavailable');
    assert.equal(isValidFlightDate('not a date'), false);
});

test('flight times use the airport timezone and fall back to UTC for invalid zones', () => {
    const instant = '2026-01-01T00:00:00Z';
    assert.equal(formatFlightTime(instant, 'America/Los_Angeles'), '16:00');
    assert.equal(resolveFlightTimeZone('Mars/Olympus'), 'UTC');
    assert.equal(formatFlightTime(instant, 'Mars/Olympus'), '00:00');
    assert.equal(resolveFlightTimeZone('Local'), 'UTC');
});

test('position age and stale checks use the observation timestamp', () => {
    const now = Date.parse('2026-01-01T00:02:00Z');
    assert.equal(formatFlightAge('2026-01-01T00:01:50Z', now), '10s ago');
    assert.equal(formatFlightAge('2026-01-01T00:00:30Z', now), '1m ago');
    assert.equal(isFlightPositionStale('2025-12-31T23:59:59Z', now), true);
    assert.equal(isFlightPositionStale('2026-01-01T00:01:30Z', now), false);
    assert.equal(formatFlightAge(null, now), 'Unavailable');
});
