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
}

export interface OpenSkyResponse {
    time: number;
    states: any[][] | null;
}

// Convert IATA flight number to ICAO24 hex code (this is a limitation - we need the aircraft's ICAO code)
// For now, we'll search by callsign which often matches the flight number
export async function getFlightFromOpenSky(flightNumber: string): Promise<OpenSkyState | null> {
    try {
        console.log('🛰️ Calling OpenSky Network API for:', flightNumber);

        // OpenSky API endpoint - get all current flights
        const response = await fetch('https://opensky-network.org/api/states/all');

        if (!response.ok) {
            if (response.status === 429) {
                console.error('⚠️ OpenSky rate limit exceeded. Please wait 10 seconds before searching again.');
                throw new Error('OpenSky rate limit exceeded. Please wait a moment and try again.');
            }
            console.error('OpenSky API error:', response.status);
            return null;
        }

        const data: OpenSkyResponse = await response.json();

        if (!data.states || data.states.length === 0) {
            console.log('No flights found in OpenSky data');
            return null;
        }

        // Normalize input
        const normalizedInput = flightNumber.toUpperCase().trim().replace(/\s/g, '');
        const parsed = parseFlightNumber(normalizedInput);
        let flightState: any[] | undefined;

        // First try exact match with raw input (handles ICAO callsigns like ACA794)
        flightState = data.states.find(state => {
            const cs = state[1]?.toString().trim().toUpperCase().replace(/\s/g, '') || '';
            return cs === normalizedInput;
        });

        // Try matching with ICAO code + flight number (OpenSky uses ICAO callsigns)
        if (!flightState && parsed) {
            const { carrierCode, icaoCode, flightNum } = parsed;

            // If user entered ICAO code, try it directly; also try IATA code
            const codesToTry = icaoCode ? [icaoCode, carrierCode] : [carrierCode];

            for (const code of codesToTry) {
                if (flightState) break;
                flightState = data.states.find(state => {
                    const cs = state[1]?.toString().trim().toUpperCase().replace(/\s/g, '') || '';
                    return cs.startsWith(code) && cs.endsWith(flightNum);
                });
            }
        }

        // Fallback to looser heuristic if not found
        if (!flightState && parsed) {
            const { flightNum } = parsed;
            flightState = data.states.find((state) => {
                const callsign = state[1]?.toString().trim().toUpperCase().replace(/\s/g, '') || '';
                // Loose match: contains flight number
                if (callsign.includes(flightNum) && callsign.length > flightNum.length) {
                    return true;
                }
                return false;
            });
        }

        if (!flightState) {
            console.log(`❌ Flight ${flightNumber} not found in OpenSky data`);
            return null;
        }

        console.log('✅ Found flight in OpenSky!');

        // Parse the state array into our interface
        return {
            icao24: flightState[0],
            callsign: flightState[1],
            origin_country: flightState[2],
            time_position: flightState[3],
            last_contact: flightState[4],
            longitude: flightState[5],
            latitude: flightState[6],
            baro_altitude: flightState[7],
            on_ground: flightState[8],
            velocity: flightState[9],
            true_track: flightState[10],
            vertical_rate: flightState[11],
            geo_altitude: flightState[13],
        };
    } catch (error) {
        console.error('OpenSky API error:', error);
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

        const state = data.states[0];

        return {
            icao24: state[0],
            callsign: state[1],
            origin_country: state[2],
            time_position: state[3],
            last_contact: state[4],
            longitude: state[5],
            latitude: state[6],
            baro_altitude: state[7],
            on_ground: state[8],
            velocity: state[9],
            true_track: state[10],
            vertical_rate: state[11],
            geo_altitude: state[13],
        };
    } catch (error) {
        console.error('OpenSky API error:', error);
        return null;
    }
}
