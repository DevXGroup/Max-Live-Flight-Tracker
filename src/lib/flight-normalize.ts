import { FlightLookupError, type FlightAirport, type FlightStatus } from './flight-types';

export const ICAO_TO_IATA: Record<string, string> = {
    AAL:'AA', ACA:'AC', AFR:'AF', AIC:'AI', AMX:'AM', ASA:'AS', FIN:'AY', ITY:'AZ', BAW:'BA', JBU:'B6', EVA:'BR', CCA:'CA', CAL:'CI', CPA:'CX', CSN:'CZ', DAL:'DL', UAE:'EK', ETD:'EY', FFT:'F9', IBE:'IB', JAL:'JL', KAL:'KE', KLM:'KL', DLH:'LH', SWR:'LX', CES:'MU', ANA:'NH', NKS:'NK', ANZ:'NZ', AUA:'OS', AAR:'OZ', QFA:'QF', QTR:'QR', SAS:'SK', SIA:'SQ', AFL:'SU', THY:'TK', UAL:'UA', VIR:'VS', SWA:'WN', WJA:'WS', UPS:'5X', FDX:'FX', RYR:'FR', EZY:'U2', WZZ:'W6', TAP:'TP', SWG:'ZK', VOI:'VY', RPA:'YX', ENY:'MQ', SKW:'OO', JZA:'QK', AJM:'GP',
};
export const CALLSIGN_ALIASES: Record<string, string> = Object.fromEntries(
    Object.entries(ICAO_TO_IATA).flatMap(([icao, iata]) => [[icao, iata], [iata, icao]]),
);

export function normalizeFlightNumber(input: string): string {
    const value = input.trim().toUpperCase().replace(/\s+/g, '');
    const marketingNumber = /^([A-Z]{3}|[A-Z][A-Z0-9]|[0-9][A-Z])\d{1,4}[A-Z]?$/.test(value);
    const operationalCallsign = value.length <= 8 && /^[A-Z]{2,4}\d{1,4}[A-Z]{1,2}$/.test(value);
    if (value.length > 12 || (!marketingNumber && !operationalCallsign)) {
        throw new FlightLookupError('INVALID_FLIGHT', 'Enter a valid flight number, such as WN1781.');
    }
    return value;
}

export function callsignMatches(input: string, callsign: unknown): boolean {
    if (typeof callsign !== 'string') return false;
    const observed = callsign.trim().toUpperCase().replace(/\s+/g, '');
    const requested = input.toUpperCase();
    if (observed === requested) return true;
    const parsed = requested.match(/^([A-Z]{3}|[A-Z][A-Z0-9]|[0-9][A-Z])(\d{1,4}[A-Z]?)$/);
    if (!parsed) return false;
    const alias = CALLSIGN_ALIASES[parsed[1]];
    return !!alias && observed === `${alias}${parsed[2]}`;
}

export interface AdsbAircraft {
    hex?: unknown; flight?: unknown; seen_pos?: unknown; lat?: unknown; lon?: unknown;
    alt_baro?: unknown; gs?: unknown; track?: unknown; r?: unknown; t?: unknown;
}

export interface AdsbSnapshot { now: number; ac: AdsbAircraft[] }
export interface SelectedAircraft { aircraft: AdsbAircraft; snapshotTime: number }

function finiteNumber(v: unknown): number | null {
    return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

export function parseAdsbSnapshot(value: unknown): AdsbSnapshot | null {
    if (!value || typeof value !== 'object' || !('ac' in value) || !Array.isArray(value.ac) || !('now' in value)) return null;
    const now = finiteNumber(value.now);
    if (now === null || now < 1_000_000_000_000) return null;
    return { now, ac: value.ac as AdsbAircraft[] };
}

export function selectAircraft(input: string, snapshot: AdsbSnapshot, wallNowMs = Date.now()): SelectedAircraft | null {
    const snapshotAge = wallNowMs - snapshot.now;
    if (snapshotAge < -5_000 || snapshotAge > 120_000) return null;
    const fresh = snapshot.ac.filter((row) => {
        if (!row || typeof row !== 'object') return false;
        if (!callsignMatches(input, row.flight)) return false;
        const age = finiteNumber(row.seen_pos);
        const lat = finiteNumber(row.lat), lon = finiteNumber(row.lon);
        return age !== null && age >= 0 && age + Math.max(0, snapshotAge) / 1000 <= 120
            && lat !== null && lat >= -90 && lat <= 90
            && lon !== null && lon >= -180 && lon <= 180
            && typeof row.hex === 'string' && /^[a-f0-9]{6}$/i.test(row.hex);
    });
    const byHex = new Map(fresh.map((row) => [String(row.hex).toLowerCase(), row]));
    if (byHex.size > 1) throw new FlightLookupError('NOT_OBSERVED', 'More than one aircraft matched this callsign. Try again later.');
    const row = byHex.values().next().value as AdsbAircraft | undefined;
    return row ? { aircraft: row, snapshotTime: snapshot.now } : null;
}

const emptyAirport = (): FlightAirport => ({ airport: null, code: null, terminal: null, gate: null, scheduledTime: null, estimatedTime: null, actualTime: null, timezone: null, latitude: null, longitude: null });
const validNumber = (v: unknown, min: number, max: number): number | null => {
    const n = finiteNumber(v);
    return n !== null && n >= min && n <= max ? n : null;
};

export interface PositionSnapshot { lat: number; lon: number; altitude: number | null; speed: number | null; heading: number | null; registration: string | null; model: string | null; updatedAt: string; hex: string; callsign: string; onGround: boolean | null }

export function normalizeAircraft(row: AdsbAircraft, snapshotTimeMs: number, wallNowMs = Date.now()): PositionSnapshot {
    const lat = validNumber(row.lat, -90, 90), lon = validNumber(row.lon, -180, 180);
    if (lat === null || lon === null) throw new FlightLookupError('NOT_OBSERVED', 'No recent aircraft position was found.');
    const seen = validNumber(row.seen_pos, 0, 120);
    if (seen === null || snapshotTimeMs < 1_000_000_000_000 || wallNowMs - snapshotTimeMs > 120_000 || snapshotTimeMs - wallNowMs > 5_000 || seen + Math.max(0, wallNowMs - snapshotTimeMs) / 1000 > 120) {
        throw new FlightLookupError('NOT_OBSERVED', 'No recent aircraft position was found.');
    }
    const alt = row.alt_baro === 'ground' ? null : validNumber(row.alt_baro, 0, 60000);
    return {
        lat, lon, altitude: alt,
        speed: validNumber(row.gs, 0, 800), heading: validNumber(row.track, 0, 360), // track over ground, shown as heading in the UI
        registration: typeof row.r === 'string' && row.r.trim() ? row.r.trim() : null,
        model: typeof row.t === 'string' && row.t.trim() ? row.t.trim() : null,
        updatedAt: new Date(snapshotTimeMs - seen * 1000).toISOString(), hex: String(row.hex).toUpperCase(), callsign: String(row.flight ?? '').trim().toUpperCase(),
        onGround: row.alt_baro === 'ground' ? true : validNumber(row.alt_baro, 0, 60000) !== null ? false : null,
    };
}

export function emptyFlight(input: string, now = new Date()): FlightStatus {
    return {
        flightNumber: input, flightDate: null, airline: null, status: 'Unknown',
        departure: emptyAirport(), arrival: emptyAirport(),
        aircraft: { model: null, registration: null, speed: null, altitude: null, heading: null },
        liveData: { latitude: null, longitude: null, progress: null, remainingTime: null },
        dataSources: { position: null, route: null, schedule: null },
        dataQuality: { positionUpdatedAt: null, fetchedAt: now.toISOString(), routeConfidence: 'unknown', missingFields: [], warnings: [], },
    };
}

export function missingFlightFields(flight: FlightStatus): string[] {
    const missing: string[] = [];
    const fields: Array<[string, unknown]> = [
        ['airline', flight.airline], ['flightDate', flight.flightDate],
        ['departure.airport', flight.departure.airport], ['departure.code', flight.departure.code],
        ['departure.terminal', flight.departure.terminal], ['departure.gate', flight.departure.gate],
        ['departure.scheduledTime', flight.departure.scheduledTime], ['departure.estimatedTime', flight.departure.estimatedTime], ['departure.actualTime', flight.departure.actualTime],
        ['departure.timezone', flight.departure.timezone], ['departure.latitude', flight.departure.latitude], ['departure.longitude', flight.departure.longitude],
        ['arrival.airport', flight.arrival.airport], ['arrival.code', flight.arrival.code],
        ['arrival.terminal', flight.arrival.terminal], ['arrival.gate', flight.arrival.gate],
        ['arrival.scheduledTime', flight.arrival.scheduledTime], ['arrival.estimatedTime', flight.arrival.estimatedTime], ['arrival.actualTime', flight.arrival.actualTime],
        ['arrival.timezone', flight.arrival.timezone], ['arrival.latitude', flight.arrival.latitude], ['arrival.longitude', flight.arrival.longitude],
        ['aircraft.model', flight.aircraft.model], ['aircraft.registration', flight.aircraft.registration],
        ['aircraft.speed', flight.aircraft.speed], ['aircraft.altitude', flight.aircraft.altitude], ['aircraft.heading', flight.aircraft.heading],
        ['liveData.latitude', flight.liveData.latitude], ['liveData.longitude', flight.liveData.longitude],
        ['liveData.progress', flight.liveData.progress], ['liveData.remainingTime', flight.liveData.remainingTime],
    ];
    for (const [name, value] of fields) if (value === null) missing.push(name);
    return missing;
}

export function remainingTimeFromEstimate(estimatedArrival: string | null, status: FlightStatus['status'], nowMs = Date.now()): string | null {
    if (!estimatedArrival || (status !== 'Active' && status !== 'Delayed')) return null;
    const arrivalMs = Date.parse(estimatedArrival);
    if (!Number.isFinite(arrivalMs) || arrivalMs <= nowMs) return null;
    const totalMinutes = Math.floor((arrivalMs - nowMs) / 60_000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function withPosition(flight: FlightStatus, position: PositionSnapshot): FlightStatus {
    flight.liveData.latitude = position.lat;
    flight.liveData.longitude = position.lon;
    flight.aircraft.speed = position.speed;
    flight.aircraft.altitude = position.altitude;
    flight.aircraft.heading = position.heading;
    if (position.registration !== null) flight.aircraft.registration = position.registration;
    if (position.model !== null) flight.aircraft.model = position.model;
    if (flight.status === 'Unknown' && position.onGround !== null) flight.status = position.onGround ? 'On Ground' : 'Active';
    flight.dataSources.position = 'adsb.lol';
    flight.dataQuality.positionUpdatedAt = position.updatedAt;
    flight.dataQuality.warnings.push('Position comes from shared aircraft tracking stations.');
    flight.dataQuality.missingFields = missingFlightFields(flight);
    return flight;
}
