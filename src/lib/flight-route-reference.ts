import type { FlightAirport } from './flight-types';
import { calculateDistance } from './airports';

// CC0 standing data, not an airline timetable. Pin the revision for reproducibility.
// Source and license: https://github.com/vradarserver/standing-data
export const ROUTE_REFERENCE_REVISION = '7db1e656f68f7bb4064b92c345ea0937a0ea44db';
const ROOT = `https://raw.githubusercontent.com/vradarserver/standing-data/${ROUTE_REFERENCE_REVISION}`;
const csvCache = new Map<string, string>();

function csvRow(line: string): string[] {
    const fields: string[] = [];
    let value = '';
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (quoted && line[i + 1] === '"') { value += '"'; i++; }
            else quoted = !quoted;
        } else if (char === ',' && !quoted) { fields.push(value); value = ''; }
        else value += char;
    }
    fields.push(value);
    return fields;
}

export function getRouteAirportCodes(csv: string, callsign: string): [string, string] | null {
    const rows = csv.replace(/^\uFEFF/, '').split(/\r?\n/);
    if (rows[0] !== 'Callsign,Code,Number,AirlineCode,AirportCodes') return null;
    const matches = rows.slice(1).map(csvRow).filter(row => row[0] === callsign);
    if (matches.length !== 1) return null;
    const codes = (matches[0][4] || '').split('-');
    // Multi-leg standing records cannot identify the currently operating leg.
    if (codes.length !== 2 || codes[0] === codes[1] || !codes.every(c => /^[A-Z0-9]{3,4}$/.test(c))) return null;
    return [codes[0], codes[1]];
}

export function parseReferenceAirport(csv: string, code: string): Partial<FlightAirport> | null {
    const rows = csv.replace(/^\uFEFF/, '').split(/\r?\n/);
    if (rows[0] !== 'Code,Name,ICAO,IATA,Location,CountryISO2,Latitude,Longitude,AltitudeFeet') return null;
    const matches = rows.slice(1).map(csvRow).filter(row => row[0] === code || row[2] === code);
    if (matches.length !== 1) return null;
    const row = matches[0];
    if (!row[6]?.trim() || !row[7]?.trim()) return null;
    const latitude = Number(row[6]);
    const longitude = Number(row[7]);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
    return { airport: row[1] || null, code: row[3] || row[2] || code, latitude, longitude };
}

export function isReferenceRoutePlausible(
    departure: Partial<FlightAirport>, arrival: Partial<FlightAirport>, latitude: number, longitude: number
): boolean {
    const { latitude: a, longitude: b } = departure;
    const { latitude: c, longitude: d } = arrival;
    if (a == null || b == null || c == null || d == null || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
    const direct = calculateDistance(a, b, c, d);
    const viaPlane = calculateDistance(a, b, latitude, longitude) + calculateDistance(latitude, longitude, c, d);
    // Conservative screening only. Even a plausible reference is never a confirmed itinerary.
    return direct >= 20 && viaPlane <= direct + Math.max(100, direct * 0.2);
}

async function getCsv(path: string, signal: AbortSignal): Promise<string | null> {
    if (csvCache.has(path)) return csvCache.get(path)!;
    const response = await fetch(`${ROOT}/${path}`, { signal, cache: 'force-cache' });
    if (!response.ok) return null;
    const csv = await response.text();
    if (csv.length > 2_000_000) return null;
    if (csvCache.size >= 32) csvCache.delete(csvCache.keys().next().value!);
    csvCache.set(path, csv);
    return csv;
}

export async function getReferenceRoute(
    callsign: string, latitude: number, longitude: number
): Promise<{ departure: Partial<FlightAirport>; arrival: Partial<FlightAirport> } | null> {
    if (!/^[A-Z]{3}\d{1,4}[A-Z]?$/.test(callsign)) return null;
    const signal = AbortSignal.timeout(3000);
    try {
        const prefix = callsign.slice(0, 3);
        const routes = await getCsv(`routes/schema-01/${prefix[0]}/${prefix}-all.csv`, signal);
        const codes = routes ? getRouteAirportCodes(routes, callsign) : null;
        if (!codes) return null;
        const files = await Promise.all(codes.map(c => getCsv(`airports/schema-01/${c[0]}/${c.slice(0, 2)}.csv`, signal)));
        if (!files[0] || !files[1]) return null;
        const departure = parseReferenceAirport(files[0], codes[0]);
        const arrival = parseReferenceAirport(files[1], codes[1]);
        if (!departure || !arrival || !isReferenceRoutePlausible(departure, arrival, latitude, longitude)) return null;
        return { departure, arrival };
    } catch {
        // Optional reference failure never hides a valid aircraft observation.
        return null;
    }
}
