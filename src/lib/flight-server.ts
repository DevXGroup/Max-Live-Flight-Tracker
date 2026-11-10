import 'server-only';
import { FlightLookupError, type FlightStatus } from './flight-types';
import { CALLSIGN_ALIASES, callsignMatches, emptyFlight, missingFlightFields, normalizeAircraft, normalizeFlightNumber, parseAdsbSnapshot, remainingTimeFromEstimate, selectAircraft, withPosition } from './flight-normalize';
import { getReferenceRoute } from './flight-route-reference';
import { getAirlineName } from './utils';
import { getAirportCoords, icaoToIata } from './airports';

const REQUEST_TIMEOUT_MS = 3_000;
const POSITION_DEADLINE_MS = 9_000;
const CACHE_TTL_MS = 15_000;
const MAX_CACHE_ENTRIES = 100;
const MAX_INFLIGHT_LOOKUPS = 8;
const NEGATIVE_CACHE_TTL_MS = 15_000;
const MAX_NEGATIVE_CACHE_ENTRIES = 100;
type CacheEntry = { value: FlightStatus; expiresAt: number };
type NegativeCacheEntry = { error: FlightLookupError; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<FlightStatus>>();
const negativeCache = new Map<string, NegativeCacheEntry>();
const providerCooldowns = new Map<string, number>();

function timedFetch(url: string, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
    return fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs), cache: 'no-store' });
}

async function fetchAdsb(provider: string, callsign: string, timeoutMs: number) {
    const urls: Record<string, string> = {
        'adsb.lol': `https://api.adsb.lol/v2/callsign/${encodeURIComponent(callsign)}`,
        'adsb.fi': `https://opendata.adsb.fi/api/v2/callsign/${encodeURIComponent(callsign)}`,
        'airplanes.live': `https://api.airplanes.live/v2/callsign/${encodeURIComponent(callsign)}`,
    };
    const url = urls[provider];
    if (!url) return { now: Date.now(), ac: [] };
    const response = await timedFetch(url, { headers: { Accept: 'application/json' } }, timeoutMs);
    if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        const seconds = retryAfter && /^\d+(?:\.\d+)?$/.test(retryAfter)
            ? Number(retryAfter)
            : retryAfter ? (Date.parse(retryAfter) - Date.now()) / 1000 : 15;
        providerCooldowns.set(provider, Date.now() + Math.min(60_000, Math.max(1_000, (Number.isFinite(seconds) ? seconds : 15) * 1000)));
        throw new Error('position provider unavailable');
    }
    if (!response.ok) throw new Error('position provider unavailable');
    const json: unknown = await response.json();
    const snapshot = parseAdsbSnapshot(json);
    if (!snapshot) throw new Error('position provider returned invalid data');
    return snapshot;
}

function providers(): string[] {
    const allowed = new Set(['adsb.fi', 'airplanes.live']);
    const opted = (process.env.FLIGHT_POSITION_PROVIDERS ?? '').split(',').map(x => x.trim()).filter(x => allowed.has(x));
    return ['adsb.lol', ...opted];
}

function airlineFromCallsign(callsign: string): string | null {
    const match = callsign.match(/^([A-Z]{3}|[A-Z][A-Z0-9])\d/);
    if (!match) return null;
    const prefix = match[1];
    const iata = prefix.length === 3 ? CALLSIGN_ALIASES[prefix] : prefix;
    if (!iata) return null;
    const name = getAirlineName(iata);
    return name && name !== iata ? name : null;
}

async function getPosition(flightNumber: string) {
    const aliases = [flightNumber];
    const m = flightNumber.match(/^([A-Z]{3}|[A-Z][A-Z0-9]|[0-9][A-Z])(\d{1,4}[A-Z]?)$/);
    if (m && CALLSIGN_ALIASES[m[1]]) {
        const alternate = `${CALLSIGN_ALIASES[m[1]]}${m[2]}`;
        if (m[1].length === 2) aliases.unshift(alternate);
        else aliases.push(alternate);
    }
    const deadline = Date.now() + POSITION_DEADLINE_MS;
    let anySuccessful = false;
    for (const provider of providers()) {
        if ((providerCooldowns.get(provider) ?? 0) > Date.now()) continue;
        for (const query of aliases) {
            const remaining = deadline - Date.now();
            if (remaining <= 0) break;
            try {
                const snapshot = await fetchAdsb(provider, query, Math.min(REQUEST_TIMEOUT_MS, remaining));
                anySuccessful = true;
                const selected = selectAircraft(flightNumber, snapshot);
                if (selected) return { ...selected, provider };
            } catch (error) {
                if (error instanceof FlightLookupError && error.code === 'NOT_OBSERVED' && error.message.startsWith('More than one aircraft')) throw error;
                break;
            }
        }
    }
    if (!anySuccessful) throw new FlightLookupError('PROVIDERS_UNAVAILABLE', 'Live flight data is temporarily unavailable.');
    throw new FlightLookupError('NOT_OBSERVED', `No recent position was found for ${flightNumber}. This does not mean the flight is cancelled.`);
}

type AviationStackFlight = {
    flight_date?: string; flight_status?: string;
    flight?: { iata?: string | null; icao?: string | null; number?: string | null };
    airline?: { name?: string | null };
    departure?: Partial<AirportResult>;
    arrival?: Partial<AirportResult>;
    aircraft?: { registration?: string | null; iata?: string | null; icao?: string | null };
};
type AirportResult = { airport?: string | null; iata?: string | null; icao?: string | null; terminal?: string | null; gate?: string | null; delay?: string | number | null; scheduled?: string | null; estimated?: string | null; actual?: string | null; timezone?: string | null; latitude?: number | null; longitude?: number | null };

function usableTime(v: unknown): string | null {
    if (typeof v !== 'string' || !/(Z|[+-]\d{2}:?\d{2})$/i.test(v)) return null;
    const date = new Date(v);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}
function safeText(v: unknown, maxLength = 128): string | null {
    if (typeof v !== 'string') return null;
    const value = v.trim();
    return value && value.length <= maxLength ? value : null;
}
function airportLocalDate(instant: string, timezone: string): string | null {
    try {
        const parts = new Intl.DateTimeFormat('en-US', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(instant));
        const fields = Object.fromEntries(parts.map(part => [part.type, part.value]));
        return fields.year && fields.month && fields.day ? `${fields.year}-${fields.month}-${fields.day}` : null;
    } catch { return null; }
}

function scheduleTimes(flight: AviationStackFlight) {
    return {
        departure: usableTime(flight.departure?.scheduled),
        arrival: usableTime(flight.arrival?.actual) ?? usableTime(flight.arrival?.estimated) ?? usableTime(flight.arrival?.scheduled),
    };
}

function chooseScheduleCandidate(flights: AviationStackFlight[], flightNumber: string, nowMs: number): AviationStackFlight | null {
    const prefix = flightNumber.match(/^([A-Z]{3}|[A-Z][A-Z0-9]|[0-9][A-Z])/);
    if (!prefix) return null;
    const param = prefix[1].length === 3 ? 'flight_icao' : 'flight_iata';
    const valid = flights.filter(flight => {
        const code = param === 'flight_icao' ? flight.flight?.icao : flight.flight?.iata;
        const zone = flight.departure?.timezone;
        const departure = usableTime(flight.departure?.scheduled);
        return typeof code === 'string' && callsignMatches(flightNumber, code)
            && typeof zone === 'string' && !!departure
            && flight.flight_date === airportLocalDate(departure, zone)
            && !!(flight.departure?.iata || flight.departure?.icao)
            && !!(flight.arrival?.iata || flight.arrival?.icao)
            && !!(usableTime(flight.arrival?.scheduled) || usableTime(flight.arrival?.estimated) || usableTime(flight.arrival?.actual));
    });
    if (!valid.length) return null;

    // An active record with a recent departure stays the current trip even if its estimate is stale. An actual arrival means it is complete.
    const active = valid.filter(flight => {
        if (flight.flight_status !== 'active') return false;
        const departure = usableTime(flight.departure?.scheduled);
        const actualArrival = usableTime(flight.arrival?.actual);
        return !!departure && !actualArrival && Date.parse(departure) >= nowMs - 36 * 60 * 60_000
            && Date.parse(departure) <= nowMs;
    });
    if (active.length === 1) return active[0];
    if (active.length > 1) return null;

    const today = valid.filter(flight => {
        const zone = flight.departure?.timezone;
        return typeof zone === 'string' && flight.flight_date === airportLocalDate(new Date(nowMs).toISOString(), zone);
    });
    if (today.length === 1) return today[0];
    if (today.length > 1) {
        const upcoming = today.filter(flight => {
            const dep = usableTime(flight.departure?.scheduled);
            return !!dep && Date.parse(dep) >= nowMs && ['scheduled', 'active'].includes(flight.flight_status ?? '');
        });
        return upcoming.length === 1 ? upcoming[0] : null;
    }

    const nextDay = valid.filter(flight => {
        const dep = usableTime(flight.departure?.scheduled);
        return !!dep && Date.parse(dep) >= nowMs && Date.parse(dep) <= nowMs + 24 * 60 * 60_000;
    });
    if (nextDay.length === 1) return nextDay[0];
    if (nextDay.length > 1) return null;

    const recentlyLanded = valid.filter(flight => {
        if (flight.flight_status !== 'landed') return false;
        const { arrival } = scheduleTimes(flight);
        return !!arrival && Date.parse(arrival) <= nowMs && Date.parse(arrival) >= nowMs - 6 * 60 * 60_000;
    });
    return recentlyLanded.length === 1 ? recentlyLanded[0] : null;
}

function airportFrom(v?: Partial<AirportResult>) {
    const validLatitude = typeof v?.latitude === 'number' && Number.isFinite(v.latitude) && v.latitude >= -90 && v.latitude <= 90 ? v.latitude : null;
    const validLongitude = typeof v?.longitude === 'number' && Number.isFinite(v.longitude) && v.longitude >= -180 && v.longitude <= 180 ? v.longitude : null;
    let latitude = validLatitude, longitude = validLongitude;
    let local: ReturnType<typeof getAirportCoords> = null;
    if (latitude === null || longitude === null) {
        const iata = typeof v?.iata === 'string' && /^[A-Z]{3}$/i.test(v.iata)
            ? v.iata.toUpperCase()
            : typeof v?.icao === 'string' ? icaoToIata(v.icao) : null;
        if (iata) local = getAirportCoords(iata);
        latitude = local?.lat ?? null;
        longitude = local?.lng ?? null;
    }
    return {
        airport: safeText(v?.airport, 160) ?? local?.name ?? null,
        code: safeText(v?.iata, 4) ?? safeText(v?.icao, 4), terminal: safeText(v?.terminal, 32), gate: safeText(v?.gate, 32),
        scheduledTime: usableTime(v?.scheduled), estimatedTime: usableTime(v?.estimated), actualTime: usableTime(v?.actual), timezone: safeText(v?.timezone, 64),
        latitude, longitude,
    };
}

async function getSchedule(flightNumber: string): Promise<Partial<FlightStatus> | null> {
    if (process.env.DATA_SOURCE !== 'aviationstack' && process.env.DATA_SOURCE !== 'hybrid') return null;
    const key = process.env.AVIATION_STACK_KEY;
    if (!key) return null;
    const prefix = flightNumber.match(/^([A-Z]{3}|[A-Z][A-Z0-9]|[0-9][A-Z])(\d{1,4}[A-Z]?)$/);
    if (!prefix) return null;
    const param = prefix[1].length === 3 ? 'flight_icao' : 'flight_iata';
    const url = new URL('https://api.aviationstack.com/v1/flights');
    url.searchParams.set('access_key', key);
    url.searchParams.set(param, flightNumber);
    try {
        const response = await timedFetch(url.toString(), { headers: { Accept: 'application/json' } });
        if (!response.ok) return null;
        const body = await response.json() as { data?: AviationStackFlight[] };
        const flight = chooseScheduleCandidate(body.data ?? [], flightNumber, Date.now());
        if (!flight) return null;
        const aircraftCode = [flight.aircraft?.icao, flight.aircraft?.iata].find(value => typeof value === 'string' && /^[A-Z0-9]{2,4}$/i.test(value));
        const status = scheduleStatus(flight);
        return {
            flightDate: safeText(flight.flight_date, 16),
            airline: safeText(flight.airline?.name, 128),
            status,
            departure: airportFrom(flight.departure), arrival: airportFrom(flight.arrival),
            aircraft: { model: aircraftCode?.toUpperCase() ?? null, registration: safeText(flight.aircraft?.registration, 16), speed: null, altitude: null, heading: null },
            // Progress is unsupported without a provider position-history/progress field; never derive it from route geometry.
            liveData: { latitude: null, longitude: null, progress: null, remainingTime: remainingTimeFromEstimate(usableTime(flight.arrival?.estimated), status) },
            dataSources: { position: null, route: null, schedule: 'aviationstack' },
            dataQuality: { positionUpdatedAt: null, fetchedAt: new Date().toISOString(), routeConfidence: 'schedule', missingFields: [], warnings: [] },
        };
    } catch { return null; }
}

function scheduleStatus(flight: AviationStackFlight): FlightStatus['status'] {
    const delayed = [flight.departure?.delay, flight.arrival?.delay].some(value => Number(value) > 0);
    if (delayed && (flight.flight_status === 'scheduled' || flight.flight_status === 'active')) return 'Delayed';
    return ({ scheduled: 'Scheduled', active: 'Active', landed: 'Landed', cancelled: 'Cancelled', diverted: 'Unknown' } as Record<string, FlightStatus['status']>)[flight.flight_status ?? ''] ?? 'Unknown';
}

async function lookup(flightNumber: string): Promise<FlightStatus> {
    const schedulePromise = getSchedule(flightNumber);
    const flight = emptyFlight(flightNumber);
    let observation: Awaited<ReturnType<typeof getPosition>> | null = null;
    let positionError: unknown = null;
    try { observation = await getPosition(flightNumber); } catch (error) { positionError = error; }
    const schedule = await schedulePromise;
    if (schedule) Object.assign(flight, schedule);
    let position: ReturnType<typeof normalizeAircraft> | null = null;
    if (observation) {
        try { position = normalizeAircraft(observation.aircraft, observation.snapshotTime); }
        catch (error) { positionError = error; }
    }
    if (position && observation) {
        withPosition(flight, position);
        flight.dataSources.position = observation.provider;
    } else if (!schedule) {
        if (positionError instanceof FlightLookupError) throw positionError;
        if (observation) throw new FlightLookupError('NOT_OBSERVED', 'No recent aircraft position was found.');
        throw new FlightLookupError('PROVIDERS_UNAVAILABLE', 'Flight data is temporarily unavailable.');
    }
    if (!schedule && position) {
        const airline = airlineFromCallsign(position.callsign);
        if (airline) {
            flight.airline = airline;
            flight.dataQuality.warnings.push('The airline name comes from the aircraft flight code.');
        }
        try {
            const reference = await Promise.race([
                getReferenceRoute(position.callsign, position.lat, position.lon),
                new Promise<null>(resolve => setTimeout(() => resolve(null), 2_500)),
            ]);
            if (reference) {
                Object.assign(flight.departure, reference.departure);
                Object.assign(flight.arrival, reference.arrival);
                flight.dataSources.route = 'Virtual Radar Server (CC0 reference)';
                flight.dataQuality.routeConfidence = 'callsign';
                flight.dataQuality.warnings.push('Route is a callsign reference and may not be this flight’s current route.');
            }
        } catch { /* Reference data is optional; retain the validated live position. */ }
    }
    if (schedule) {
        flight.dataSources.route = 'aviationstack';
        flight.dataQuality.routeConfidence = 'schedule';
    } else if (!flight.dataSources.route) {
        flight.dataQuality.warnings.push('No verified current schedule is available; schedule times, gate, terminal, and route may be missing.');
    }
    if (!position && schedule) flight.dataQuality.warnings.push('No recent aircraft position is available; this flight may still be scheduled or operating.');
    flight.dataQuality.missingFields = missingFlightFields(flight);
    return flight;
}

export async function getFlightDataServer(value: string): Promise<FlightStatus> {
    const flightNumber = normalizeFlightNumber(value);
    const cached = cache.get(flightNumber);
    if (cached && cached.expiresAt > Date.now()) return structuredClone(cached.value);
    if (cached) cache.delete(flightNumber);
    const existing = inflight.get(flightNumber);
    if (existing) return structuredClone(await existing);
    const negative = negativeCache.get(flightNumber);
    if (negative && negative.expiresAt > Date.now()) throw new FlightLookupError(negative.error.code, negative.error.message);
    if (negative) negativeCache.delete(flightNumber);
    if (inflight.size >= MAX_INFLIGHT_LOOKUPS) throw new FlightLookupError('PROVIDERS_UNAVAILABLE', 'Flight service is busy. Please try again shortly.');
    const request = lookup(flightNumber);
    inflight.set(flightNumber, request);
    try {
        const result = await request;
        if (cache.size >= MAX_CACHE_ENTRIES) cache.delete(cache.keys().next().value as string);
        cache.set(flightNumber, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
        negativeCache.delete(flightNumber);
        return structuredClone(result);
    } catch (error) {
        if (error instanceof FlightLookupError && error.code === 'NOT_OBSERVED') {
            if (negativeCache.size >= MAX_NEGATIVE_CACHE_ENTRIES) negativeCache.delete(negativeCache.keys().next().value as string);
            negativeCache.set(flightNumber, { error, expiresAt: Date.now() + NEGATIVE_CACHE_TTL_MS });
        }
        throw error;
    } finally { inflight.delete(flightNumber); }
}
