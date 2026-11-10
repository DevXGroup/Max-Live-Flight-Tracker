/** The UI contract. Unavailable provider values stay null, never invented defaults. */
export interface FlightAirport {
    airport: string | null;
    code: string | null;
    terminal: string | null;
    gate: string | null;
    scheduledTime: string | null;
    estimatedTime: string | null;
    actualTime: string | null;
    timezone: string | null;
    latitude: number | null;
    longitude: number | null;
}

export interface FlightStatus {
    flightNumber: string;
    flightDate: string | null;
    airline: string | null;
    status: 'Scheduled' | 'Active' | 'Landed' | 'Delayed' | 'Cancelled' | 'On Ground' | 'Unknown';
    departure: FlightAirport;
    arrival: FlightAirport;
    aircraft: {
        model: string | null;
        registration: string | null;
        speed: number | null; // knots
        altitude: number | null; // feet
        heading: number | null; // degrees true
    };
    liveData: {
        latitude: number | null;
        longitude: number | null;
        progress: number | null;
        remainingTime: string | null;
    };
    dataSources: { position: string | null; route: string | null; schedule: string | null };
    dataQuality: {
        positionUpdatedAt: string | null;
        fetchedAt: string;
        routeConfidence: 'schedule' | 'callsign' | 'unknown';
        missingFields: string[];
        warnings: string[];
    };
}

export type FlightErrorCode = 'INVALID_FLIGHT' | 'NOT_OBSERVED' | 'PROVIDERS_UNAVAILABLE';

export class FlightLookupError extends Error {
    constructor(public readonly code: FlightErrorCode, message: string) {
        super(message);
        this.name = 'FlightLookupError';
    }
}
