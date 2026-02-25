// OpenSky Network API integration for real-time flight tracking
// Documentation: https://opensky-network.org/apidoc/

import { parseFlightNumber } from "./amadeus";

export interface OpenSkyState {
    icao24: string;
    callsign: string | null;
    origin_country: string;
    time_position: number | null;
    last_contact: number;
    longitude: number | null;
    latitude: number | null;
    baro_altitude: number | null;
    on_ground: boolean;
    velocity: number | null;
    true_track: number | null;
    vertical_rate: number | null;
    geo_altitude: number | null;
    registration?: string | null;
    aircraftType?: string | null;
}

export type OpenSkyStateValue = string | number | boolean | null;

export interface OpenSkyResponse {
    time: number;
    states: OpenSkyStateValue[][] | null;
}

// In-memory cache for the states/all response (30 second TTL)
let statesCache: { data: OpenSkyResponse; timestamp: number } | null = null;
const STATES_CACHE_TTL_MS = 30_000;

async function fetchAllStates(): Promise<OpenSkyResponse> {
    const now = Date.now();
    if (statesCache && now - statesCache.timestamp < STATES_CACHE_TTL_MS) {
        console.log('📦 OpenSky: using cached states data');
        return statesCache.data;
    }

    console.log('📡 [OpenSky] Fetching active aircraft states from states/all...');
    const response = await fetch('https://opensky-network.org/api/states/all', {
        next: { revalidate: 0 },
        cache: 'no-store'
    } as any);

    if (!response.ok) {
        if (response.status === 429) {
            console.error('❌ [OpenSky] Rate limit exceeded');
            throw new Error('OpenSky rate limit exceeded.');
        }
        throw new Error(`OpenSky API error: ${response.status}`);
    }

    const data: OpenSkyResponse = await response.json();
    console.log(`✅ [OpenSky] Successfully fetched ${data.states?.length || 0} aircraft states`);
    statesCache = { data, timestamp: now };
    return data;
}

// Map a raw OpenSky state array to OpenSkyState
function mapStateArray(state: OpenSkyStateValue[]): OpenSkyState {
    return {
        icao24: state[0] as string,
        callsign: state[1] as string | null,
        origin_country: state[2] as string,
        time_position: state[3] as number | null,
        last_contact: state[4] as number,
        longitude: state[5] as number | null,
        latitude: state[6] as number | null,
        baro_altitude: state[7] as number | null,
        on_ground: state[8] as boolean,
        velocity: state[9] as number | null,
        true_track: state[10] as number | null,
        vertical_rate: state[11] as number | null,
        geo_altitude: state[13] as number | null,
    };
}

// Map an adsb.fi / airplanes.live aircraft object to OpenSkyState
// These APIs give altitude in feet and speed in knots — convert to OpenSky units (meters, m/s)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAdsbAcToState(ac: any, fallbackCallsign: string): OpenSkyState {
    return {
        icao24: ac.hex || '',
        callsign: (ac.flight || fallbackCallsign).trim(),
        origin_country: ac.ownOp || '',
        time_position: ac.seen_pos != null ? Date.now() / 1000 - ac.seen_pos : null,
        last_contact: Date.now() / 1000,
        longitude: ac.lon ?? null,
        latitude: ac.lat ?? null,
        baro_altitude: ac.alt_baro != null && ac.alt_baro !== 'ground'
            ? Number(ac.alt_baro) * 0.3048   // ft → meters
            : null,
        on_ground: ac.alt_baro === 'ground' || ac.alt_baro === 0,
        velocity: ac.gs != null ? ac.gs * 0.514444 : null,           // knots → m/s
        true_track: ac.track ?? null,
        vertical_rate: ac.baro_rate != null ? ac.baro_rate * 0.00508 : null, // ft/min → m/s
        geo_altitude: ac.alt_geom != null ? ac.alt_geom * 0.3048 : null,
        registration: ac.r || null,
        aircraftType: ac.t || null,
    };
}

// Search an OpenSky states snapshot for a specific flight callsign
function searchOpenSkyStates(data: OpenSkyResponse, flightNumber: string): OpenSkyStateValue[] | undefined {
    if (!data.states || data.states.length === 0) return undefined;

    const normalizedInput = flightNumber.toUpperCase().trim().replace(/\s/g, '');
    const parsed = parseFlightNumber(normalizedInput);

    // 1. Exact callsign match
    console.log(`🔍 [OpenSky] Searching states for callsign: ${normalizedInput}`);
    let match = data.states.find(state => {
        const cs = state[1]?.toString().trim().toUpperCase().replace(/\s/g, '') || '';
        return cs === normalizedInput;
    });

    if (match) {
        console.log(`✅ [OpenSky] Found exact callsign match: ${match[1]}`);
    }

    // 2. ICAO/IATA carrier code + flight number
    if (!match && parsed) {
        const { carrierCode, icaoCode, flightNum } = parsed;
        const codesToTry = icaoCode ? [icaoCode, carrierCode] : [carrierCode];
        console.log(`🔍 [OpenSky] No exact match, trying carrier codes: ${codesToTry.join(', ')} + ${flightNum}`);
        for (const code of codesToTry) {
            if (match) break;
            match = data.states.find(state => {
                const cs = state[1]?.toString().trim().toUpperCase().replace(/\s/g, '') || '';
                return cs.startsWith(code) && cs.endsWith(flightNum);
            });
        }
    }

    if (match && !match[1]?.toString().includes(normalizedInput)) {
        console.log(`✅ [OpenSky] Found fuzzy match: ${match[1]}`);
    }

    // 3. Loose: callsign contains the flight number
    if (!match && parsed) {
        const { flightNum } = parsed;
        console.log(`🔍 [OpenSky] No carrier match, trying loose flight number match: ${flightNum}`);
        match = data.states.find(state => {
            const cs = state[1]?.toString().trim().toUpperCase().replace(/\s/g, '') || '';
            return cs.includes(flightNum) && cs.length > flightNum.length;
        });
    }

    if (!match) {
        console.log('❌ [OpenSky] No matching callsign found in active states');
    }

    return match;
}

// ─── Source 1: OpenSky Network ────────────────────────────────────────────────
async function getFlightFromOpenSkyDirect(flightNumber: string): Promise<OpenSkyState | null> {
    const data = await fetchAllStates(); // may throw on 429
    const state = searchOpenSkyStates(data, flightNumber);
    if (!state) return null;
    console.log('✅ [OpenSky] found:', flightNumber);
    return mapStateArray(state);
}

// ─── Source 2: adsb.fi (free, no auth) ───────────────────────────────────────
async function getFlightFromAdsbFi(flightNumber: string): Promise<OpenSkyState | null> {
    try {
        const callsign = flightNumber.toUpperCase().trim().replace(/\s/g, '');
        const response = await fetch(
            `https://opendata.adsb.fi/api/v2/callsign/${callsign}`,
            { headers: { Accept: 'application/json' } }
        );
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.ac || data.ac.length === 0) return null;
        console.log('✅ [adsb.fi] found:', flightNumber);
        return mapAdsbAcToState(data.ac[0], flightNumber);
    } catch {
        return null;
    }
}

// ─── Source 3: airplanes.live (free, no auth) ─────────────────────────────────
async function getFlightFromAirplanesLive(flightNumber: string): Promise<OpenSkyState | null> {
    try {
        const callsign = flightNumber.toUpperCase().trim().replace(/\s/g, '');
        const response = await fetch(`https://api.airplanes.live/v2/callsign/${callsign}`);
        if (!response.ok) return null;
        const data = await response.json();
        if (!data.ac || data.ac.length === 0) return null;
        console.log('✅ [airplanes.live] found:', flightNumber);
        return mapAdsbAcToState(data.ac[0], flightNumber);
    } catch {
        return null;
    }
}

// ─── Public: position waterfall ───────────────────────────────────────────────
// Tries each source in order; returns first successful result.
export async function getFlightFromOpenSky(flightNumber: string): Promise<OpenSkyState | null> {
    // 1. OpenSky Network
    try {
        console.log('🛰️  [1/3] OpenSky Network for:', flightNumber);
        const result = await getFlightFromOpenSkyDirect(flightNumber);
        if (result) return result;
        console.log('   ↳ not in OpenSky snapshot, trying adsb.fi...');
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`   ↳ OpenSky failed (${msg}), trying adsb.fi...`);
    }

    // 2. adsb.fi
    console.log('📡 [2/3] adsb.fi for:', flightNumber);
    const adsbResult = await getFlightFromAdsbFi(flightNumber);
    if (adsbResult) return adsbResult;
    console.log('   ↳ not in adsb.fi, trying airplanes.live...');

    // 3. airplanes.live
    console.log('✈️  [3/3] airplanes.live for:', flightNumber);
    const alResult = await getFlightFromAirplanesLive(flightNumber);
    if (alResult) return alResult;

    console.log('❌ Live position not found in any source for:', flightNumber);
    return null;
}

// Fetch departure/arrival ICAO airport codes for an aircraft using OpenSky flights endpoint
export async function getFlightRouteFromOpenSky(
    icao24: string
): Promise<{ departureIcao: string | null; arrivalIcao: string | null } | null> {
    try {
        const now = Math.floor(Date.now() / 1000);
        const begin = now - 86400; // look back 24 hours
        const url = `https://opensky-network.org/api/flights/aircraft?icao24=${icao24.toLowerCase()}&begin=${begin}&end=${now}`;

        const response = await fetch(url);
        if (!response.ok) return null;

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) return null;

        // Pick the flight with the most recent lastSeen
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recent = data.sort((a: any, b: any) => b.lastSeen - a.lastSeen)[0];
        return {
            departureIcao: recent.estDepartureAirport || null,
            arrivalIcao: recent.estArrivalAirport || null,
        };
    } catch {
        return null;
    }
}

// Get flight by ICAO24 code (more reliable if you know the aircraft code)
export async function getFlightByICAO24(icao24: string): Promise<OpenSkyState | null> {
    try {
        const response = await fetch(`https://opensky-network.org/api/states/all?icao24=${icao24.toLowerCase()}`);

        if (!response.ok) {
            return null;
        }

        const data: OpenSkyResponse = await response.json();

        if (!data.states || data.states.length === 0) {
            return null;
        }

        return mapStateArray(data.states[0]);
    } catch (error) {
        console.error('OpenSky API error:', error);
        return null;
    }
}

// ─── hexdb.io route lookup ────────────────────────────────────────────────────
// Resolves departure/arrival ICAO airport codes from a callsign via hexdb.io
// Returns ICAO codes like "OTHH-EGLL" which can then be converted to IATA codes
export async function getFlightRouteFromHexDB(
    callsign: string
): Promise<{ departureIcao: string | null; arrivalIcao: string | null } | null> {
    try {
        const cs = callsign.trim().toUpperCase().replace(/\s/g, '');
        console.log('🔎 [hexdb.io] Route lookup for callsign:', cs);
        const response = await fetch(`https://hexdb.io/api/v1/route/icao/${cs}`, {
            signal: AbortSignal.timeout(5000), // 5s timeout
        });
        if (!response.ok) {
            console.log('   ↳ hexdb.io returned', response.status);
            return null;
        }
        // Response is JSON: {"flight": "QTR8940", "route": "OTHH-ZGGG", "updatetime": 1547555191}
        const data = await response.json();
        const route = data.route;
        if (!route || !route.includes('-')) {
            console.log('   ↳ hexdb.io returned no route or unexpected format:', JSON.stringify(data));
            return null;
        }
        const parts = route.trim().split('-');
        console.log('✅ [hexdb.io] Route resolved:', parts[0], '→', parts[1]);
        return {
            departureIcao: parts[0] || null,
            arrivalIcao: parts[1] || null,
        };
    } catch (e) {
        console.warn('[hexdb.io] Route lookup failed:', e);
        return null;
    }
}

// Fetch aircraft info from hexdb.io (registration, type, etc.)
export async function getAircraftInfoFromHexDB(
    icao24hex: string
): Promise<{ registration: string | null; type: string | null; operator: string | null } | null> {
    try {
        const hex = icao24hex.trim().toLowerCase();
        const response = await fetch(`https://hexdb.io/api/v1/aircraft/${hex}`, {
            signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) return null;
        const data = await response.json();
        return {
            registration: data.Registration || null,
            type: data.Type || data.ICAOTypeCode || null,
            operator: data.RegisteredOwners || null,
        };
    } catch {
        return null;
    }
}
