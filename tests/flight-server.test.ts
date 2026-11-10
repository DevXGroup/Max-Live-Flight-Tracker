import assert from 'node:assert/strict';
import test from 'node:test';
import Module from 'node:module';

// This is a server-only module. Stub Next's client-boundary marker while loading it in Node tests.
type ModuleLoader = (this: unknown, request: string, parent: unknown, isMain: boolean) => unknown;
const mutableModule = Module as unknown as { _load: ModuleLoader };
const originalLoad = mutableModule._load;
mutableModule._load = function(request: string, parent: unknown, isMain: boolean) {
    if (request === 'server-only') return {};
    return originalLoad.call(this, request, parent, isMain);
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getFlightDataServer } = require('../src/lib/flight-server') as typeof import('../src/lib/flight-server');
mutableModule._load = originalLoad;

const wallNow = Date.now();
function response(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }); }
function liveEnvelope(flight: string, overrides: Record<string, unknown> = {}) {
    return { now: wallNow, ac: [{ hex: 'abc123', flight, seen_pos: 5, lat: 0, lon: -122, alt_baro: 0, gs: 0, track: 0, ...overrides }] };
}
function setEnv(key: string, value: string | undefined) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
}

test('no-key lookup makes no schedule request and preserves actual live zero values', async () => {
    setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const seen: string[] = [];
    const before = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input); seen.push(url);
        if (url.includes('api.adsb.lol')) return response(liveEnvelope('WN1781'));
        return new Response('', { status: 404 });
    }) as typeof fetch;
    try {
        const result = await getFlightDataServer('WN1781');
        assert.equal(result.liveData.latitude, 0);
        assert.equal(result.liveData.longitude, -122);
        assert.equal(result.aircraft.speed, 0);
        assert.equal(result.aircraft.heading, 0);
        assert.equal(result.airline, 'Southwest Airlines');
        assert.equal(result.dataSources.schedule, null);
        assert.ok(result.dataQuality.positionUpdatedAt);
        assert.equal(seen.some(url => url.includes('aviationstack.com')), false);
    } finally { globalThis.fetch = before; }
});

test('bounded operational callsigns require an exact live match and do not create carrier aliases', async () => {
    setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const urls: string[] = [];
    const before = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input); urls.push(url);
        if (url.includes('api.adsb.lol')) return response(liveEnvelope('RYR12AB'));
        return new Response('', { status: 404 });
    }) as typeof fetch;
    try {
        const exact = await getFlightDataServer('RYR12AB');
        assert.equal(exact.flightNumber, 'RYR12AB');
        assert.equal(exact.liveData.latitude, 0);
        assert.equal(exact.dataSources.position, 'adsb.lol');
        assert.ok(urls.some(url => url.endsWith('/RYR12AB')));
        await assert.rejects(getFlightDataServer('RYR12AC'), /No recent position/);
    } finally { globalThis.fetch = before; }
});

test('position expiring while schedule retrieval is pending still returns schedule-only data', async () => {
    setEnv('DATA_SOURCE', 'aviationstack'); setEnv('AVIATION_STACK_KEY', 'test-only-placeholder'); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const beforeFetch = globalThis.fetch;
    const beforeNow = Date.now;
    let controlledNow = beforeNow();
    const snapshotTime = controlledNow;
    Date.now = () => controlledNow;
    const z = 'America/Los_Angeles';
    const departure = new Date(snapshotTime + 10 * 60_000).toISOString();
    const arrival = new Date(snapshotTime + 90 * 60_000).toISOString();
    const flightDate = new Intl.DateTimeFormat('en-CA', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(departure));
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('api.adsb.lol')) return response({ now: snapshotTime, ac: [{ hex: 'abc123', flight: 'WN935', seen_pos: 119, lat: 34, lon: -118 }] });
        if (url.includes('aviationstack.com')) {
            await new Promise(resolve => setTimeout(resolve, 10));
            controlledNow += 3_000;
            return response({ data: [{ flight_date: flightDate, flight_status: 'scheduled', flight: { iata: 'WN935' },
                departure: { iata: 'LAX', timezone: z, scheduled: departure },
                arrival: { iata: 'SFO', timezone: z, scheduled: arrival, estimated: arrival } }] });
        }
        return new Response('', { status: 404 });
    }) as typeof fetch;
    try {
        const result = await getFlightDataServer('WN935');
        assert.equal(result.status, 'Scheduled');
        assert.equal(result.dataSources.schedule, 'aviationstack');
        assert.equal(result.dataSources.position, null);
        assert.equal(result.liveData.latitude, null);
        assert.equal(result.liveData.longitude, null);
        assert.equal(result.departure.scheduledTime, departure);
        assert.ok(result.dataQuality.warnings.some(warning => warning.includes('No recent aircraft position')));
    } finally {
        globalThis.fetch = beforeFetch;
        Date.now = beforeNow;
        setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    }
});

test('schedule result remains useful when no receiver has a current position', async () => {
    setEnv('DATA_SOURCE', 'aviationstack'); setEnv('AVIATION_STACK_KEY', 'test-only-placeholder'); setEnv('FLIGHT_POSITION_PROVIDERS', 'adsb.fi');
    const before = globalThis.fetch;
    const departureTime = new Date().toISOString();
    const arrivalTime = new Date(Date.now() + 60 * 60_000).toISOString();
    const flightDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(departureTime));
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('aviationstack.com')) return response({ data: [{
            flight_date: flightDate, flight_status: 'cancelled', flight: { iata: 'WN1782' }, airline: { name: 'Southwest Airlines' },
            departure: { airport: 'Los Angeles International', iata: 'LAX', timezone: 'America/Los_Angeles', scheduled: departureTime },
            arrival: { airport: 'San Francisco International', iata: 'SFO', timezone: 'America/Los_Angeles', scheduled: arrivalTime },
        }] });
        return response({}, 503);
    }) as typeof fetch;
    try {
        const result = await getFlightDataServer('WN1782');
        assert.equal(result.status, 'Cancelled');
        assert.equal(result.liveData.latitude, null);
        assert.equal(result.departure.scheduledTime, departureTime);
        assert.deepEqual([result.departure.latitude, result.departure.longitude], [33.9416, -118.4085]);
        assert.deepEqual([result.arrival.latitude, result.arrival.longitude], [37.6213, -122.379]);
        assert.equal(result.dataSources.position, null);
    } finally { globalThis.fetch = before; setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); setEnv('FLIGHT_POSITION_PROVIDERS', undefined); }
});

test('selects today service over previous-day landed records and prefers an active overnight flight', async () => {
    setEnv('DATA_SOURCE', 'aviationstack'); setEnv('AVIATION_STACK_KEY', 'test-only-placeholder'); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const before = globalThis.fetch;
    const now = Date.now();
    const z = 'America/Los_Angeles';
    const time = (delta: number) => new Date(now + delta).toISOString();
    const dateAt = (instant: string) => new Intl.DateTimeFormat('en-CA', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(instant));
    const row = (flightDate: string, status: string, dep: string, arr: string, destination: string, flightCode = 'WN930') => ({
        flight_date: flightDate, flight_status: status, flight: { iata: flightCode },
        departure: { iata: 'LAX', timezone: z, scheduled: dep },
        arrival: { iata: destination, timezone: z, scheduled: arr, estimated: status === 'active' ? arr : undefined, actual: status === 'landed' ? arr : undefined },
    });
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (!url.includes('aviationstack.com')) return response({}, 503);
        const request = new URL(url);
        const code = request.searchParams.get('flight_iata');
        if (code === 'WN930') return response({ data: [
            row(dateAt(time(-26 * 60 * 60_000)), 'landed', time(-26 * 60 * 60_000), time(-2 * 60 * 60_000), 'SFO'),
            row(dateAt(time(0)), 'scheduled', time(0), time(60 * 60_000), 'SEA'),
        ] });
        return response({ data: [
            row(dateAt(time(-8 * 60 * 60_000)), 'active', time(-8 * 60 * 60_000), time(2 * 60 * 60_000), 'SFO', 'WN931'),
            row(dateAt(time(0)), 'scheduled', time(4 * 60 * 60_000), time(5 * 60 * 60_000), 'SEA', 'WN931'),
        ] });
    }) as typeof fetch;
    try {
        const current = await getFlightDataServer('WN930');
        assert.equal(current.status, 'Scheduled');
        assert.equal(current.arrival.code, 'SEA');
        const overnight = await getFlightDataServer('WN931');
        assert.equal(overnight.status, 'Active');
        assert.equal(overnight.arrival.code, 'SFO');
    } finally { globalThis.fetch = before; setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); }
});

test('active schedule with an expired estimate cannot be replaced by a future trip', async () => {
    setEnv('DATA_SOURCE', 'aviationstack'); setEnv('AVIATION_STACK_KEY', 'test-only-placeholder'); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const before = globalThis.fetch;
    const now = Date.now();
    const z = 'America/Los_Angeles';
    const at = (delta: number) => new Date(now + delta).toISOString();
    const localDate = (instant: string) => new Intl.DateTimeFormat('en-CA', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(instant));
    const activeDeparture = at(-4 * 60 * 60_000);
    const expiredEstimate = at(-5 * 60_000);
    const futureDeparture = at(4 * 60 * 60_000);
    const futureArrival = at(5 * 60 * 60_000);
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('api.adsb.lol')) return response(liveEnvelope('WN934'));
        if (url.includes('aviationstack.com')) return response({ data: [
            { flight_date: localDate(activeDeparture), flight_status: 'active', flight: { iata: 'WN934' },
                departure: { iata: 'LAX', timezone: z, scheduled: activeDeparture },
                arrival: { iata: 'SFO', timezone: z, scheduled: expiredEstimate, estimated: expiredEstimate } },
            { flight_date: localDate(futureDeparture), flight_status: 'scheduled', flight: { iata: 'WN934' },
                departure: { iata: 'LAX', timezone: z, scheduled: futureDeparture },
                arrival: { iata: 'SEA', timezone: z, scheduled: futureArrival, estimated: futureArrival } },
        ] });
        return new Response('', { status: 404 });
    }) as typeof fetch;
    try {
        const result = await getFlightDataServer('WN934');
        assert.equal(result.dataSources.schedule, 'aviationstack');
        assert.equal(result.status, 'Active');
        assert.equal(result.departure.scheduledTime, activeDeparture);
        assert.equal(result.arrival.scheduledTime, expiredEstimate);
        assert.equal(result.arrival.code, 'SFO');
        assert.equal(result.liveData.remainingTime, null);
        assert.notEqual(result.status, 'Landed');
        assert.notEqual(result.arrival.code, 'SEA');
        assert.notEqual(result.arrival.scheduledTime, futureArrival);
        assert.ok(result.dataSources.position);
    } finally { globalThis.fetch = before; setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); }
});

test('ambiguous same-date schedule candidates remain unresolved', async () => {
    setEnv('DATA_SOURCE', 'aviationstack'); setEnv('AVIATION_STACK_KEY', 'test-only-placeholder'); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const before = globalThis.fetch;
    const dep = new Date().toISOString();
    const eta = new Date(Date.now() + 60 * 60_000).toISOString();
    const flightDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dep));
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (!url.includes('aviationstack.com')) return response({}, 503);
        const make = (destination: string) => ({ flight_date: flightDate, flight_status: 'scheduled', flight: { iata: 'WN932' }, departure: { iata: 'LAX', timezone: 'America/Los_Angeles', scheduled: dep }, arrival: { iata: destination, timezone: 'America/Los_Angeles', scheduled: eta } });
        return response({ data: [make('SFO'), make('SEA')] });
    }) as typeof fetch;
    try {
        await assert.rejects(getFlightDataServer('WN932'), /temporarily unavailable/);
    } finally { globalThis.fetch = before; setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); }
});

test('schedule aircraft type and future estimated arrival populate existing UI fields only when supported', async () => {
    setEnv('DATA_SOURCE', 'aviationstack'); setEnv('AVIATION_STACK_KEY', 'test-only-placeholder'); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const before = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (!url.includes('aviationstack.com')) return response({}, 503);
        const request = new URL(url);
        const flightCode = request.searchParams.get('flight_iata') ?? 'WN920';
        const dep = new Date(Date.now() - 60_000).toISOString();
        const estimate = flightCode.endsWith('921') ? new Date(Date.now() - 180_000).toISOString() : new Date(Date.now() + 5 * 60_000).toISOString();
        const localDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dep));
        return response({ data: [{ flight_date: localDate, flight_status: 'active', flight: { iata: flightCode }, aircraft: { icao: 'B738', iata: '738' },
            departure: { airport: 'Los Angeles International', iata: 'LAX', timezone: 'America/Los_Angeles', scheduled: dep },
            arrival: { airport: 'San Francisco International', iata: 'SFO', timezone: 'America/Los_Angeles', scheduled: estimate, estimated: estimate },
        }] });
    }) as typeof fetch;
    try {
        const future = await getFlightDataServer('WN920');
        assert.equal(future.aircraft.model, 'B738');
        assert.ok(future.liveData.remainingTime);
        assert.equal(future.status, 'Active');
        const past = await getFlightDataServer('WN921');
        assert.equal(past.liveData.remainingTime, null);
        assert.equal(past.status, 'Active');
    } finally { globalThis.fetch = before; setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); }
});

test('live position does not erase aircraft type or registration supplied by the matched schedule', async () => {
    setEnv('DATA_SOURCE', 'aviationstack'); setEnv('AVIATION_STACK_KEY', 'test-only-placeholder'); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const before = globalThis.fetch;
    const dep = new Date().toISOString();
    const arr = new Date(Date.now() + 60 * 60_000).toISOString();
    const flightDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dep));
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('api.adsb.lol')) return response(liveEnvelope('WN933', { r: null, t: null }));
        if (url.includes('aviationstack.com')) return response({ data: [{
            flight_date: flightDate, flight_status: 'active', flight: { iata: 'WN933' }, aircraft: { icao: 'B738', registration: 'N123AB' },
            departure: { iata: 'LAX', timezone: 'America/Los_Angeles', scheduled: dep },
            arrival: { iata: 'SFO', timezone: 'America/Los_Angeles', scheduled: arr, estimated: arr },
        }] });
        return new Response('', { status: 404 });
    }) as typeof fetch;
    try {
        const result = await getFlightDataServer('WN933');
        assert.equal(result.aircraft.model, 'B738');
        assert.equal(result.aircraft.registration, 'N123AB');
        assert.equal(result.aircraft.speed, 0);
        assert.equal(result.dataSources.position, 'adsb.lol');
    } finally { globalThis.fetch = before; setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); }
});

test('malformed optional schedule strings do not discard a valid live position or leak non-string fields', async () => {
    setEnv('DATA_SOURCE', 'aviationstack'); setEnv('AVIATION_STACK_KEY', 'test-only-placeholder'); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const before = globalThis.fetch;
    const dep = new Date().toISOString();
    const arr = new Date(Date.now() + 60 * 60_000).toISOString();
    const zone = 'America/Los_Angeles';
    const flightDate = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(dep));
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('api.adsb.lol')) return response(liveEnvelope('WN936'));
        if (url.includes('aviationstack.com')) return response({ data: [{
            flight_date: flightDate, flight_status: 'active', flight: { iata: 'WN936' }, airline: { name: { unexpected: 'object' } },
            aircraft: { icao: { unexpected: 'object' }, iata: ['738'], registration: 99 },
            departure: { airport: { unexpected: 'object' }, iata: 'LAX', terminal: ['1'], gate: { name: 'A1' }, timezone: zone, scheduled: dep },
            arrival: { airport: 12, iata: 'SFO', terminal: { name: '2' }, gate: 5, timezone: zone, scheduled: arr, estimated: arr },
        }] });
        return new Response('', { status: 404 });
    }) as typeof fetch;
    try {
        const result = await getFlightDataServer('WN936');
        assert.equal(result.dataSources.position, 'adsb.lol');
        assert.equal(result.dataSources.schedule, 'aviationstack');
        assert.equal(result.liveData.latitude, 0);
        assert.equal(result.airline, null);
        assert.equal(result.departure.airport, 'Los Angeles International');
        assert.equal(result.departure.terminal, null);
        assert.equal(result.departure.gate, null);
        assert.equal(result.arrival.airport, 'San Francisco International');
        assert.equal(result.arrival.terminal, null);
        assert.equal(result.arrival.gate, null);
        assert.equal(result.aircraft.model, null);
        assert.equal(result.aircraft.registration, null);
    } finally { globalThis.fetch = before; setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); }
});

test('provider timeout/failure falls through only to explicitly enabled fallback', async () => {
    setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); setEnv('FLIGHT_POSITION_PROVIDERS', 'adsb.fi');
    const seen: string[] = [];
    const before = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
        const url = String(input); seen.push(url);
        if (url.includes('api.adsb.lol')) throw new Error('simulated provider timeout');
        if (url.includes('opendata.adsb.fi')) return response(liveEnvelope('UAL765'));
        return new Response('', { status: 404 });
    }) as typeof fetch;
    try {
        const result = await getFlightDataServer('UAL765');
        assert.equal(result.dataSources.position, 'adsb.fi');
        assert.ok(seen.some(url => url.includes('api.adsb.lol')));
        assert.ok(seen.some(url => url.includes('opendata.adsb.fi')));
    } finally { globalThis.fetch = before; setEnv('FLIGHT_POSITION_PROVIDERS', undefined); }
});

test('wrong and stale observations are not returned as live and are never replaced by a guessed position', async () => {
    setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const before = globalThis.fetch;
    globalThis.fetch = (async () => response(liveEnvelope('WN1784', { seen_pos: 0 }), 200)) as typeof fetch;
    try {
        await assert.rejects(getFlightDataServer('WN1783'), /No recent position/);
    } finally { globalThis.fetch = before; }
});

test('NOT_OBSERVED failures are briefly cached to avoid repeated provider hits', async () => {
    setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    let calls = 0;
    const before = globalThis.fetch;
    globalThis.fetch = (async () => { calls++; return response({ now: Date.now(), ac: [] }); }) as typeof fetch;
    try {
        await assert.rejects(getFlightDataServer('WN901'), /No recent position/);
        const afterFirst = calls;
        await assert.rejects(getFlightDataServer('WN901'), /No recent position/);
        assert.equal(calls, afterFirst);
    } finally { globalThis.fetch = before; }
});

test('deduplicates same-flight work and caps distinct upstream lookups per process', async () => {
    setEnv('DATA_SOURCE', undefined); setEnv('AVIATION_STACK_KEY', undefined); setEnv('FLIGHT_POSITION_PROVIDERS', undefined);
    const pending: Array<(reason: Error) => void> = [];
    const before = globalThis.fetch;
    globalThis.fetch = (() => new Promise<Response>((_resolve, reject) => pending.push(reject))) as typeof fetch;
    const requests = ['WN910','WN911','WN912','WN913','WN914','WN915','WN916','WN917'].map(code => getFlightDataServer(code));
    try {
        while (pending.length < 8) await new Promise(resolve => setImmediate(resolve));
        const duplicate = getFlightDataServer('WN910');
        assert.equal(pending.length, 8);
        await assert.rejects(getFlightDataServer('WN918'), /busy/);
        assert.equal(pending.length, 8);
        for (const reject of pending) reject(new Error('simulated timeout'));
        const results = await Promise.allSettled([...requests, duplicate]);
        assert.equal(results.length, 9);
        assert.ok(results.every(result => result.status === 'rejected'));
    } finally {
        for (const reject of pending) reject(new Error('cleanup'));
        globalThis.fetch = before;
    }
});
