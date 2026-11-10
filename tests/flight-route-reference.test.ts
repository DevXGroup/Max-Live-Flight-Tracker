import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getReferenceAirport, getRouteAirportCodes, parseReferenceAirport, isReferenceRoutePlausible } from '../src/lib/flight-route-reference';

const header = 'Callsign,Code,Number,AirlineCode,AirportCodes\n';
const airportHeader = 'Code,Name,ICAO,IATA,Location,CountryISO2,Latitude,Longitude,AltitudeFeet\n';

test('exact callsign reference resolves two airports, never a prefix match', () => {
    const csv = '\uFEFF' + header + 'SWA1781,SWA,1781,SWA,KDEN-KSAN\nSWA17810,SWA,17810,SWA,KBOS-KJFK\n';
    assert.deepEqual(getRouteAirportCodes(csv, 'SWA1781'), ['KDEN', 'KSAN']);
    assert.equal(getRouteAirportCodes(csv, 'SWA178'), null);
});

test('multi-leg and duplicate route references remain unresolved', () => {
    assert.equal(getRouteAirportCodes(header + 'SWA1,SWA,1,SWA,KDEN-KSAN-KSFO', 'SWA1'), null);
    const row = 'SWA1,SWA,1,SWA,KDEN-KSAN\n';
    assert.equal(getRouteAirportCodes(header + row + row, 'SWA1'), null);
    assert.equal(getRouteAirportCodes(header + 'SWA1,SWA,1,SWA,KDEN-KDEN', 'SWA1'), null);
});

test('airport CSV supports quoted names, zero coordinates and ICAO-only airports', () => {
    const csv = airportHeader + 'TEST,"Test, Airport",TEST,,Town,ZZ,0,0,0';
    assert.deepEqual(parseReferenceAirport(csv, 'TEST'), { airport: 'Test, Airport', code: 'TEST', latitude: 0, longitude: 0 });
    assert.equal(parseReferenceAirport(airportHeader + 'TEST,Test,TEST,,,ZZ,,0,0', 'TEST'), null);
    assert.equal(parseReferenceAirport(airportHeader + 'TEST,Test,TEST,,,ZZ,91,0,0', 'TEST'), null);
});

test('pinned standing-airport lookup accepts a validated ICAO and returns its coordinates', async () => {
    const before = globalThis.fetch;
    const csv = airportHeader + 'KOA,Kona International Airport,PHKO,KOA,Kailua-Kona,US,19.7388,-156.0456,47';
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        assert.match(String(input), /airports\/schema-01\/P\/PH\.csv$/);
        return new Response(csv, { status: 200 });
    }) as typeof fetch;
    try {
        assert.deepEqual(await getReferenceAirport('PHKO'), {
            airport: 'Kona International Airport', code: 'KOA', latitude: 19.7388, longitude: -156.0456,
        });
        assert.equal(await getReferenceAirport('../PHKO'), null);
    } finally { globalThis.fetch = before; }
});

test('a geographically conflicting reference is suppressed, not shown as a current route', () => {
    const den = { latitude: 39.8561, longitude: -104.6737 };
    const san = { latitude: 32.7336, longitude: -117.1897 };
    assert.equal(isReferenceRoutePlausible(den, san, 36.88, -110.44), true);
    assert.equal(isReferenceRoutePlausible(den, san, 51.47, -0.45), false);
    assert.equal(isReferenceRoutePlausible({ latitude: null }, san, 36.88, -110.44), false);
});
