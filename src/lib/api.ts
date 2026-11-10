import type { FlightStatus } from './flight-types';
export type { FlightStatus, FlightAirport, FlightErrorCode } from './flight-types';

/** Browser-safe entry point. Provider credentials and orchestration stay server-side. */
export async function getFlightData(flightNumber: string, signal?: AbortSignal): Promise<FlightStatus> {
    const normalized = flightNumber.trim().toUpperCase().replace(/\s+/g, '');
    const timeout = AbortSignal.timeout(18_000);
    const requestSignal = signal ? AbortSignal.any([signal, timeout]) : timeout;
    let response: Response;
    try {
        response = await fetch(`/api/flight?flightNumber=${encodeURIComponent(normalized)}`, { signal: requestSignal, cache: 'no-store' });
    } catch (error) {
        if (error instanceof DOMException && error.name === 'TimeoutError') throw new Error('Flight lookup took too long. Please try again.');
        throw error;
    }
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
        const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
            ? body.error
            : 'Flight data is temporarily unavailable.';
        throw new Error(message);
    }
    if (!isFlightStatus(body)) throw new Error('The flight service returned an invalid response.');
    return body;
}

function isFlightStatus(value: unknown): value is FlightStatus {
    if (!value || typeof value !== 'object') return false;
    const flight = value as Partial<FlightStatus>;
    const nullableString = (v: unknown) => v === null || typeof v === 'string';
    const nullableNumber = (v: unknown) => v === null || (typeof v === 'number' && Number.isFinite(v));
    const airportOk = (v: unknown) => !!v && typeof v === 'object' &&
        ['airport','code','terminal','gate','scheduledTime','estimatedTime','actualTime','timezone'].every(key => nullableString((v as Record<string, unknown>)[key])) &&
        nullableNumber((v as Record<string, unknown>).latitude) && nullableNumber((v as Record<string, unknown>).longitude);
    const statuses = ['Scheduled','Active','Landed','Delayed','Cancelled','On Ground','Unknown'];
    return typeof flight.flightNumber === 'string' && statuses.includes(String(flight.status)) && nullableString(flight.flightDate) && nullableString(flight.airline)
        && airportOk(flight.departure) && airportOk(flight.arrival)
        && !!flight.aircraft && nullableString(flight.aircraft.model) && nullableString(flight.aircraft.registration)
        && nullableNumber(flight.aircraft.speed) && nullableNumber(flight.aircraft.altitude) && nullableNumber(flight.aircraft.heading)
        && !!flight.liveData && nullableNumber(flight.liveData.latitude) && nullableNumber(flight.liveData.longitude)
        && nullableNumber(flight.liveData.progress) && nullableString(flight.liveData.remainingTime)
        && !!flight.dataSources && nullableString(flight.dataSources.position) && nullableString(flight.dataSources.route) && nullableString(flight.dataSources.schedule)
        && !!flight.dataQuality && nullableString(flight.dataQuality.positionUpdatedAt) && typeof flight.dataQuality.fetchedAt === 'string'
        && ['schedule','callsign','unknown'].includes(String(flight.dataQuality.routeConfidence))
        && Array.isArray(flight.dataQuality.missingFields) && flight.dataQuality.missingFields.every(x => typeof x === 'string')
        && Array.isArray(flight.dataQuality.warnings) && flight.dataQuality.warnings.every(x => typeof x === 'string');
}
