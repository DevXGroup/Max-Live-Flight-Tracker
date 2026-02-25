export interface FlightStatus {
    flightNumber: string;
    flightDate: string; // Date of the flight (YYYY-MM-DD)
    airline: string;
    status: 'Scheduled' | 'Active' | 'Landed' | 'Delayed' | 'Cancelled';
    departure: {
        airport: string;
        code: string;
        terminal: string;
        gate: string;
        scheduledTime: string;
        estimatedTime?: string;
        actualTime?: string;
        timezone: string;
        latitude: number;
        longitude: number;
    };
    arrival: {
        airport: string;
        code: string;
        terminal: string;
        gate: string;
        scheduledTime: string;
        estimatedTime: string;
        timezone: string;
        latitude: number;
        longitude: number;
    };
    aircraft: {
        model: string;
        registration: string;
        speed: number; // kts
        altitude: number; // ft
        heading: number; // degrees
    };
    liveData: {
        latitude: number;
        longitude: number;
        progress: number; // 0-100 percentage
        remainingTime: string;
    };
}

const AVIATION_STACK_KEY = process.env.NEXT_PUBLIC_AVIATION_STACK_KEY;

// Data source configuration
export type DataSource = 'aviationstack' | 'opensky' | 'hybrid';
export const DATA_SOURCE: DataSource = 'opensky'; // Full chain: Amadeus → AviationStack (schedule) + OpenSky → adsb.fi → airplanes.live (position)

// End of data source config section

console.log('🔧 Flight data source:', DATA_SOURCE);

// Keep mock data as fallback
const MOCK_FLIGHTS: Record<string, FlightStatus> = {
    'AA123': {
        flightNumber: 'AA123',
        flightDate: new Date().toISOString().split('T')[0],
        airline: 'American Airlines',
        status: 'Active',
        departure: {
            airport: 'John F. Kennedy International Airport',
            code: 'JFK',
            terminal: '8',
            gate: 'B12',
            scheduledTime: '2023-11-20T08:00:00',
            actualTime: '2023-11-20T08:15:00',
            timezone: 'America/New_York',
            latitude: 40.6413,
            longitude: -73.7781
        },
        arrival: {
            airport: 'Los Angeles International Airport',
            code: 'LAX',
            terminal: '4',
            gate: '42A',
            scheduledTime: '2023-11-20T11:30:00',
            estimatedTime: '2023-11-20T11:45:00',
            timezone: 'America/Los_Angeles',
            latitude: 33.9416,
            longitude: -118.4085
        },
        aircraft: {
            model: 'Boeing 777-300ER',
            registration: 'N777AA',
            speed: 480,
            altitude: 32000,
            heading: 270
        },
        liveData: {
            latitude: 39.8283,
            longitude: -98.5795, // Roughly center of US
            progress: 45,
            remainingTime: '2h 45m'
        }
    },
    'BA249': {
        flightNumber: 'BA249',
        flightDate: new Date().toISOString().split('T')[0],
        airline: 'British Airways',
        status: 'Active',
        departure: {
            airport: 'Heathrow Airport',
            code: 'LHR',
            terminal: '5',
            gate: 'A10',
            scheduledTime: '2023-11-20T14:00:00',
            actualTime: '2023-11-20T14:22:00',
            timezone: 'Europe/London',
            latitude: 51.4700,
            longitude: -0.4543
        },
        arrival: {
            airport: 'Rio de Janeiro/Galeão',
            code: 'GIG',
            terminal: '2',
            gate: 'C4',
            scheduledTime: '2023-11-20T21:55:00',
            estimatedTime: '2023-11-20T22:10:00',
            timezone: 'America/Sao_Paulo',
            latitude: -22.8089,
            longitude: -43.2436
        },
        aircraft: {
            model: 'Boeing 777-200',
            registration: 'G-YMML',
            speed: 510,
            altitude: 36000,
            heading: 210
        },
        liveData: {
            latitude: 20.5,
            longitude: -30.2, // Over Atlantic
            progress: 60,
            remainingTime: '4h 15m'
        }
    },
    'LH400': {
        flightNumber: 'LH400',
        flightDate: new Date().toISOString().split('T')[0],
        airline: 'Lufthansa',
        status: 'Scheduled',
        departure: {
            airport: 'Frankfurt Airport',
            code: 'FRA',
            terminal: '1',
            gate: 'Z50',
            scheduledTime: '2023-11-21T10:00:00',
            timezone: 'Europe/Berlin',
            latitude: 50.0379,
            longitude: 8.5622
        },
        arrival: {
            airport: 'John F. Kennedy International Airport',
            code: 'JFK',
            terminal: '1',
            gate: '4',
            scheduledTime: '2023-11-21T12:55:00',
            estimatedTime: '2023-11-21T12:55:00',
            timezone: 'America/New_York',
            latitude: 40.6413,
            longitude: -73.7781
        },
        aircraft: {
            model: 'Boeing 747-8',
            registration: 'D-ABYA',
            speed: 0,
            altitude: 0,
            heading: 0
        },
        liveData: {
            latitude: 50.0379,
            longitude: 8.5622, // FRA
            progress: 0,
            remainingTime: '8h 55m'
        }
    }
};

// Helper function to calculate remaining time
function calculateRemainingTime(arrivalTime: string): string {
    const now = new Date();
    const arrival = new Date(arrivalTime);
    const diffMs = arrival.getTime() - now.getTime();

    if (diffMs <= 0) {
        return 'Arrived';
    }

    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) {
        return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
}

export async function getFlightData(flightNumber: string): Promise<FlightStatus | null> {
    console.log('🔍 Searching for flight:', flightNumber);
    console.log('🔑 API Key present:', !!AVIATION_STACK_KEY);
    console.log('📡 Data source:', DATA_SOURCE);

    // Route to appropriate data source
    if (DATA_SOURCE === 'opensky') {
        return getFlightDataFromOpenSky(flightNumber);
    } else if (DATA_SOURCE === 'hybrid') {
        return getFlightDataHybrid(flightNumber);
    } else {
        return getFlightDataFromAviationStack(flightNumber);
    }
}

// No-op - removed unused import


// Hybrid mode: Use AviationStack for details + OpenSky for real-time position
async function getFlightDataHybrid(flightNumber: string): Promise<FlightStatus | null> {
    console.log('🔄 Using HYBRID mode: AviationStack + OpenSky');

    // Get flight details from AviationStack
    const aviationStackData = await getFlightDataFromAviationStack(flightNumber);

    if (!aviationStackData) {
        console.warn('⚠️ AviationStack returned no data, falling back to Amadeus/OpenSky...');
        return getFlightDataFromOpenSky(flightNumber);
    }

    // Try to enhance with real-time position from OpenSky
    try {
        const { getFlightFromOpenSky } = await import('./opensky');
        const openSkyData = await getFlightFromOpenSky(flightNumber);

        if (openSkyData && openSkyData.latitude && openSkyData.longitude) {
            console.log('✅ Enhanced with OpenSky real-time position!');

            // Update with real-time data from OpenSky
            aviationStackData.liveData.latitude = openSkyData.latitude;
            aviationStackData.liveData.longitude = openSkyData.longitude;
            aviationStackData.aircraft.altitude = openSkyData.baro_altitude || openSkyData.geo_altitude || aviationStackData.aircraft.altitude;
            aviationStackData.aircraft.speed = openSkyData.velocity ? Math.round(openSkyData.velocity * 1.94384) : aviationStackData.aircraft.speed; // m/s to knots
            aviationStackData.aircraft.heading = openSkyData.true_track || aviationStackData.aircraft.heading;
        }
    } catch {
        console.warn('⚠️ Could not get OpenSky data, using AviationStack only');
    }

    return aviationStackData;
}

// Smart Flight Data with full call chain:
//   Schedule: [1] Amadeus (today→tomorrow→yesterday) → [2] Amadeus with actual callsign → [3] AviationStack
//   Position: [1] OpenSky → [2] adsb.fi → [3] airplanes.live  (via getFlightFromOpenSky)
async function getFlightDataFromOpenSky(flightNumber: string): Promise<FlightStatus | null> {
    console.log('🔍 Flight data chain starting for:', flightNumber);

    try {
        const { getFlightFromOpenSky } = await import('./opensky');
        const { getFlightStatusFromAmadeus, parseFlightNumber, getAirportName, hasAmadeusCredentials } = await import('./amadeus');
        const { getAirportCoords, calculateDistance } = await import('./airports');
        const { getAirlineName } = await import('./utils');

        const parsed = parseFlightNumber(flightNumber);
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const tomorrowDate = new Date(now); tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        const yesterdayDate = new Date(now); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const tomorrow = tomorrowDate.toISOString().split('T')[0];
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        // Helper: try Amadeus for today/tomorrow/yesterday given carrier+flightNum
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async function tryAmadeus(carrier: string, num: string): Promise<any | null> {
            return (
                await getFlightStatusFromAmadeus(carrier, num, today) ||
                await getFlightStatusFromAmadeus(carrier, num, tomorrow) ||
                await getFlightStatusFromAmadeus(carrier, num, yesterday)
            ) ?? null;
        }

        // ── SCHEDULE CHAIN ────────────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let amadeusData: any = null;

        // [S1] Amadeus with searched flight number
        if (hasAmadeusCredentials && parsed) {
            console.log(`📅 [S1] Amadeus schedule for ${parsed.carrierCode}${parsed.flightNum}...`);
            amadeusData = await tryAmadeus(parsed.carrierCode, parsed.flightNum);
            if (amadeusData) console.log('✅ [S1] Schedule found via Amadeus');
            else console.log('   ↳ not found, will retry with actual callsign after position lookup');
        } else if (!hasAmadeusCredentials) {
            console.log('⚠️ [S1] Amadeus credentials not configured, skipping');
        }

        // ── POSITION CHAIN ────────────────────────────────────────────────────
        // getFlightFromOpenSky internally chains: [P1] OpenSky → [P2] adsb.fi → [P3] airplanes.live
        console.log('📡 [P1→P3] Live position chain for:', flightNumber);
        const openSkyData = await getFlightFromOpenSky(flightNumber);

        // ── SCHEDULE CHAIN (continued) ────────────────────────────────────────
        // [S2] Retry Amadeus with the actual broadcasting callsign (may differ from user input)
        if (!amadeusData && hasAmadeusCredentials && openSkyData?.callsign) {
            const actualCallsign = openSkyData.callsign.trim().replace(/\s/g, '').toUpperCase();
            const parsedActual = parseFlightNumber(actualCallsign);
            if (parsedActual && actualCallsign !== flightNumber.toUpperCase().replace(/\s/g, '')) {
                console.log(`📅 [S2] Retrying Amadeus with actual callsign: ${actualCallsign}`);
                amadeusData = await tryAmadeus(parsedActual.carrierCode, parsedActual.flightNum);
                if (amadeusData) console.log('✅ [S2] Schedule found via Amadeus (actual callsign)');
            }
        }

        // [S3] AviationStack — try both original query and actual callsign
        if (!amadeusData) {
            const callsignToTry = openSkyData?.callsign?.trim().replace(/\s/g, '') || flightNumber;
            console.log(`📅 [S3] AviationStack for: ${callsignToTry}`);
            try {
                const avSchedule = callsignToTry !== flightNumber
                    ? await getFlightDataFromAviationStack(callsignToTry) || await getFlightDataFromAviationStack(flightNumber)
                    : await getFlightDataFromAviationStack(flightNumber);
                if (avSchedule) {
                    console.log('✅ [S3] Schedule found via AviationStack');
                    // Wrap AviationStack result in amadeus-like shape so we can reuse the builder below
                    amadeusData = {
                        _fromAviationStack: avSchedule,
                    };
                }
            } catch { /* AviationStack failure is non-fatal */ }
        }

        // ── BUILD RESULT ──────────────────────────────────────────────────────

        // [S3 path] AviationStack returned a full FlightStatus — enhance with live position and return
        if (amadeusData?._fromAviationStack) {
            const result: FlightStatus = amadeusData._fromAviationStack;
            if (openSkyData?.latitude && openSkyData?.longitude) {
                result.liveData.latitude = openSkyData.latitude;
                result.liveData.longitude = openSkyData.longitude;
                result.aircraft.speed = openSkyData.velocity ? Math.round(openSkyData.velocity * 1.94384) : result.aircraft.speed;
                result.aircraft.altitude = openSkyData.baro_altitude || openSkyData.geo_altitude || result.aircraft.altitude;
                result.aircraft.heading = openSkyData.true_track || result.aircraft.heading;
            }
            return result;
        }

        // [S1/S2 path] Amadeus returned schedule data — build rich result
        if (amadeusData) {
            console.log('✅ Found Schedule Data from Amadeus');

            // Determine Status
            let status: 'Scheduled' | 'Active' | 'Landed' | 'Delayed' | 'Cancelled' = 'Scheduled';

            const scheduledDep = new Date(amadeusData.departure.scheduledTime || now.toISOString()).getTime();
            const estimatedDep = amadeusData.departure.estimatedTime ? new Date(amadeusData.departure.estimatedTime).getTime() : scheduledDep;
            const actualDep = amadeusData.departure.actualTime ? new Date(amadeusData.departure.actualTime).getTime() : null;

            const arrTimeStr = amadeusData.arrival.estimatedTime || amadeusData.arrival.scheduledTime || now.toISOString();
            const arrTime = new Date(arrTimeStr).getTime();
            const currentTime = now.getTime();

            // Check for delay (threshold: 10 mins)
            const isDelayed = (estimatedDep - scheduledDep) > 10 * 60 * 1000;

            if (actualDep) {
                // It has departed
                if (currentTime >= arrTime) {
                    status = 'Landed';
                } else {
                    status = 'Active';
                }
            } else {
                // Has not departed yet (as far as we know)
                if (isDelayed) {
                    status = 'Delayed';
                } else if (currentTime < estimatedDep) {
                    status = 'Scheduled';
                } else {
                    // Current time is past estimated departure, but no actual time yet.
                    // Could be taxiing, or data is stale.
                    // If OpenSky says flying, it's active.
                    if (openSkyData && !openSkyData.on_ground) {
                        status = 'Active';
                    } else {
                        // Assume delayed if we are past departure time and still on ground
                        status = 'Delayed';
                    }
                }
            }

            // Get Coordinates & Names
            const depCoords = getAirportCoords(amadeusData.departure.iataCode || '');
            const arrCoords = getAirportCoords(amadeusData.arrival.iataCode || '');

            // Resolve Airport Names (if not in local DB)
            let depAirportName = depCoords?.name;
            if (!depAirportName && amadeusData.departure.iataCode) {
                depAirportName = await getAirportName(amadeusData.departure.iataCode) || amadeusData.departure.iataCode;
            }

            let arrAirportName = arrCoords?.name;
            if (!arrAirportName && amadeusData.arrival.iataCode) {
                arrAirportName = await getAirportName(amadeusData.arrival.iataCode) || amadeusData.arrival.iataCode;
            }

            // Effective departure time for calculations
            const effectiveDepTime = actualDep || estimatedDep;

            const flightStatus: FlightStatus = {
                flightNumber: `${amadeusData.carrierCode}${amadeusData.flightNumber}`,
                flightDate: amadeusData.scheduledDepartureDate,
                airline: getAirlineName(amadeusData.carrierCode), // Could map to full name
                status: status,
                departure: {
                    airport: depAirportName || 'Unknown',
                    code: amadeusData.departure.iataCode || '???',
                    terminal: amadeusData.departure.terminal || 'TBD',
                    gate: amadeusData.departure.gate || 'TBD',
                    scheduledTime: amadeusData.departure.scheduledTime || now.toISOString(),
                    estimatedTime: amadeusData.departure.estimatedTime || undefined,
                    actualTime: amadeusData.departure.actualTime || undefined,
                    timezone: 'Local', // Amadeus doesn't give timezone easily, default to Local
                    latitude: depCoords?.lat || 0,
                    longitude: depCoords?.lng || 0,
                },
                arrival: {
                    airport: arrAirportName || 'Unknown',
                    code: amadeusData.arrival.iataCode || '???',
                    terminal: amadeusData.arrival.terminal || 'TBD',
                    gate: amadeusData.arrival.gate || 'TBD',
                    scheduledTime: amadeusData.arrival.scheduledTime || now.toISOString(),
                    estimatedTime: amadeusData.arrival.estimatedTime || amadeusData.arrival.scheduledTime || now.toISOString(),
                    timezone: 'Local',
                    latitude: arrCoords?.lat || 0,
                    longitude: arrCoords?.lng || 0,
                },
                aircraft: {
                    model: 'Unknown',
                    registration: openSkyData?.icao24?.toUpperCase() || 'TBD',
                    speed: openSkyData?.velocity ? Math.round(openSkyData.velocity * 1.94384) : 0,
                    altitude: openSkyData?.baro_altitude || openSkyData?.geo_altitude || 0,
                    heading: openSkyData?.true_track || 0,
                },
                liveData: {
                    latitude: openSkyData?.latitude || depCoords?.lat || 0,
                    longitude: openSkyData?.longitude || depCoords?.lng || 0,
                    progress: 0,
                    remainingTime: status === 'Scheduled' ? 'Scheduled' : 'Calculating...',
                }
            };

            // Calculate Progress & Remaining Time
            if (status === 'Landed') {
                flightStatus.liveData.progress = 100;
                flightStatus.liveData.remainingTime = 'Arrived';
                flightStatus.liveData.latitude = arrCoords?.lat || 0;
                flightStatus.liveData.longitude = arrCoords?.lng || 0;
            } else if (status === 'Scheduled' || status === 'Delayed') {
                flightStatus.liveData.progress = 0;
                const timeUntil = effectiveDepTime - currentTime;
                if (timeUntil > 0) {
                    const hours = Math.floor(timeUntil / 3600000);
                    const mins = Math.floor((timeUntil % 3600000) / 60000);
                    flightStatus.liveData.remainingTime = `${status === 'Delayed' ? 'Delayed, departs' : 'Departs'} in ${hours}h ${mins}m`;
                } else {
                    flightStatus.liveData.remainingTime = 'Departing soon';
                }
            } else {
                // Active
                if (openSkyData && openSkyData.latitude && openSkyData.longitude && depCoords && arrCoords) {
                    // Distance based progress
                    const totalDist = calculateDistance(depCoords.lat, depCoords.lng, arrCoords.lat, arrCoords.lng);
                    const coveredDist = calculateDistance(depCoords.lat, depCoords.lng, openSkyData.latitude, openSkyData.longitude);
                    if (totalDist > 0) {
                        flightStatus.liveData.progress = Math.round((coveredDist / totalDist) * 100);
                    }
                } else {
                    // Time based progress
                    const totalDuration = arrTime - effectiveDepTime;
                    const elapsed = currentTime - effectiveDepTime;
                    if (totalDuration > 0) {
                        flightStatus.liveData.progress = Math.round((elapsed / totalDuration) * 100);
                    }
                }

                // Remaining Time
                const remainingMs = arrTime - currentTime;
                if (remainingMs > 0) {
                    const hours = Math.floor(remainingMs / 3600000);
                    const mins = Math.floor((remainingMs % 3600000) / 60000);
                    flightStatus.liveData.remainingTime = `${hours}h ${mins}m`;
                } else {
                    flightStatus.liveData.remainingTime = 'Landing soon';
                }
            }

            return flightStatus;

        } else if (openSkyData && openSkyData.latitude && openSkyData.longitude) {
            console.log('⚠️ No Schedule found, but Flight is Active on OpenSky');
            const isLanded = openSkyData.on_ground;

            // Resolve airline name from parsed carrier code, fallback to origin country
            const airlineName = parsed?.carrierCode
                ? (getAirlineName(parsed.carrierCode) !== parsed.carrierCode
                    ? getAirlineName(parsed.carrierCode)
                    : openSkyData.origin_country)
                : openSkyData.origin_country;

            const flightStatus: FlightStatus = {
                flightNumber: openSkyData.callsign?.trim() || flightNumber,
                flightDate: now.toISOString().split('T')[0],
                airline: airlineName,
                status: isLanded ? 'Landed' : 'Active',
                departure: {
                    airport: 'Unknown',
                    code: '---',
                    terminal: 'N/A',
                    gate: 'N/A',
                    scheduledTime: new Date(openSkyData.last_contact * 1000).toISOString(),
                    timezone: 'UTC',
                    latitude: 0,
                    longitude: 0,
                },
                arrival: {
                    airport: 'Unknown',
                    code: '---',
                    terminal: 'N/A',
                    gate: 'N/A',
                    scheduledTime: new Date(openSkyData.last_contact * 1000 + 7200000).toISOString(),
                    estimatedTime: new Date(openSkyData.last_contact * 1000 + 7200000).toISOString(),
                    timezone: 'UTC',
                    latitude: 0,
                    longitude: 0,
                },
                aircraft: {
                    model: openSkyData.aircraftType || 'Unknown',
                    registration: openSkyData.registration || openSkyData.icao24.toUpperCase(),
                    speed: openSkyData.velocity ? Math.round(openSkyData.velocity * 1.94384) : 0,
                    altitude: openSkyData.baro_altitude || openSkyData.geo_altitude || 0,
                    heading: openSkyData.true_track || 0,
                },
                liveData: {
                    latitude: openSkyData.latitude,
                    longitude: openSkyData.longitude,
                    progress: isLanded ? 100 : 50,
                    remainingTime: isLanded ? 'Arrived' : 'Live Tracking',
                },
            };

            // ── AIRPORT RESOLUTION CHAIN ──────────────────────────────────────
            // [A0] hexdb.io — free, no auth, callsign-based route lookup
            try {
                const { getFlightRouteFromHexDB } = await import('./opensky');
                const { icaoToIata } = await import('./airports');
                const callsignForRoute = openSkyData.callsign?.trim().replace(/\s/g, '') || flightNumber;
                console.log('🗺️ [A0] hexdb.io route lookup for callsign:', callsignForRoute);
                const hexdbRoute = await getFlightRouteFromHexDB(callsignForRoute);
                if (hexdbRoute?.departureIcao) {
                    const iata = icaoToIata(hexdbRoute.departureIcao);
                    if (iata) {
                        flightStatus.departure.code = iata;
                        const coords = getAirportCoords(iata);
                        if (coords) { flightStatus.departure.airport = coords.name; flightStatus.departure.latitude = coords.lat; flightStatus.departure.longitude = coords.lng; }
                    }
                }
                if (hexdbRoute?.arrivalIcao) {
                    const iata = icaoToIata(hexdbRoute.arrivalIcao);
                    if (iata) {
                        flightStatus.arrival.code = iata;
                        const coords = getAirportCoords(iata);
                        if (coords) { flightStatus.arrival.airport = coords.name; flightStatus.arrival.latitude = coords.lat; flightStatus.arrival.longitude = coords.lng; }
                    }
                }
                if (hexdbRoute?.departureIcao || hexdbRoute?.arrivalIcao) console.log('✅ [A0] Airports resolved via hexdb.io');
            } catch (e) { console.warn('[A0] hexdb.io route lookup failed:', e); }

            // [A1] OpenSky historical flights endpoint (ICAO24-based)
            if (flightStatus.departure.code === '---' || flightStatus.arrival.code === '---') {
                try {
                    const { getFlightRouteFromOpenSky } = await import('./opensky');
                    const { icaoToIata } = await import('./airports');
                    console.log('🗺️ [A1] OpenSky route lookup for ICAO24:', openSkyData.icao24);
                    const route = await getFlightRouteFromOpenSky(openSkyData.icao24);
                    if (route?.departureIcao && flightStatus.departure.code === '---') {
                        const iata = icaoToIata(route.departureIcao);
                        if (iata) {
                            flightStatus.departure.code = iata;
                            const coords = getAirportCoords(iata);
                            if (coords) { flightStatus.departure.airport = coords.name; flightStatus.departure.latitude = coords.lat; flightStatus.departure.longitude = coords.lng; }
                        }
                    }
                    if (route?.arrivalIcao && flightStatus.arrival.code === '---') {
                        const iata = icaoToIata(route.arrivalIcao);
                        if (iata) {
                            flightStatus.arrival.code = iata;
                            const coords = getAirportCoords(iata);
                            if (coords) { flightStatus.arrival.airport = coords.name; flightStatus.arrival.latitude = coords.lat; flightStatus.arrival.longitude = coords.lng; }
                        }
                    }
                    if (route?.departureIcao || route?.arrivalIcao) console.log('✅ [A1] Airports resolved via OpenSky route');
                } catch (e) { console.warn('[A1] OpenSky route lookup failed:', e); }
            }

            // [A2] Amadeus schedule lookup using the actual broadcasting callsign
            if ((flightStatus.departure.code === '---' || flightStatus.arrival.code === '---') && hasAmadeusCredentials) {
                const actualCallsign = openSkyData.callsign?.trim().replace(/\s/g, '').toUpperCase() || flightNumber;
                const parsedCallsign = parseFlightNumber(actualCallsign);
                if (parsedCallsign) {
                    try {
                        console.log(`📅 [A2] Amadeus airport lookup for callsign: ${actualCallsign}`);
                        const aData = await tryAmadeus(parsedCallsign.carrierCode, parsedCallsign.flightNum);
                        if (aData) {
                            if (flightStatus.departure.code === '---' && aData.departure?.iataCode) {
                                flightStatus.departure.code = aData.departure.iataCode;
                                const coords = getAirportCoords(aData.departure.iataCode);
                                if (coords) { flightStatus.departure.airport = coords.name; flightStatus.departure.latitude = coords.lat; flightStatus.departure.longitude = coords.lng; }
                                else flightStatus.departure.airport = await getAirportName(aData.departure.iataCode) || aData.departure.iataCode;
                            }
                            if (flightStatus.arrival.code === '---' && aData.arrival?.iataCode) {
                                flightStatus.arrival.code = aData.arrival.iataCode;
                                const coords = getAirportCoords(aData.arrival.iataCode);
                                if (coords) { flightStatus.arrival.airport = coords.name; flightStatus.arrival.latitude = coords.lat; flightStatus.arrival.longitude = coords.lng; }
                                else flightStatus.arrival.airport = await getAirportName(aData.arrival.iataCode) || aData.arrival.iataCode;
                            }
                            if (aData.departure?.iataCode || aData.arrival?.iataCode) console.log('✅ [A2] Airports resolved via Amadeus');
                        }
                    } catch (e) { console.warn('[A2] Amadeus callsign lookup failed:', e); }
                }
            }

            // [A3] AviationStack — try actual callsign first, then original query
            if (flightStatus.departure.code === '---' || flightStatus.arrival.code === '---') {
                const actualCallsign = openSkyData.callsign?.trim().replace(/\s/g, '') || flightNumber;
                const queriesToTry = [...new Set([actualCallsign, flightNumber])];
                console.log(`📅 [A3] AviationStack airport lookup for: ${queriesToTry.join(', ')}`);
                try {
                    let avData: FlightStatus | null = null;
                    for (const q of queriesToTry) {
                        avData = await getFlightDataFromAviationStack(q);
                        if (avData) break;
                    }
                    if (avData) {
                        if (flightStatus.departure.code === '---') {
                            flightStatus.departure.code = avData.departure.code;
                            flightStatus.departure.airport = avData.departure.airport;
                            const depCoords = getAirportCoords(avData.departure.code);
                            if (depCoords) { flightStatus.departure.latitude = depCoords.lat; flightStatus.departure.longitude = depCoords.lng; }
                        }
                        if (flightStatus.arrival.code === '---') {
                            flightStatus.arrival.code = avData.arrival.code;
                            flightStatus.arrival.airport = avData.arrival.airport;
                            const arrCoords = getAirportCoords(avData.arrival.code);
                            if (arrCoords) { flightStatus.arrival.latitude = arrCoords.lat; flightStatus.arrival.longitude = arrCoords.lng; }
                        }
                        console.log('✅ [A3] Airports resolved via AviationStack');
                    }
                } catch (e) { console.warn('[A3] AviationStack fallback failed:', e); }
            }

            // [A4] hexdb.io aircraft info — if we still need aircraft details
            if (flightStatus.aircraft.model === 'Unknown' && openSkyData.icao24) {
                try {
                    const { getAircraftInfoFromHexDB } = await import('./opensky');
                    console.log('✈️ [A4] hexdb.io aircraft info for:', openSkyData.icao24);
                    const acInfo = await getAircraftInfoFromHexDB(openSkyData.icao24);
                    if (acInfo) {
                        if (acInfo.type) flightStatus.aircraft.model = acInfo.type;
                        if (acInfo.registration) flightStatus.aircraft.registration = acInfo.registration;
                    }
                } catch (e) { console.warn('[A4] hexdb.io aircraft info failed:', e); }
            }

            // ── RECALCULATE PROGRESS if we now have valid airport coordinates ──
            if (flightStatus.departure.latitude !== 0 && flightStatus.arrival.latitude !== 0 && !isLanded) {
                const { calculateDistance } = await import('./airports');
                const totalDist = calculateDistance(
                    flightStatus.departure.latitude, flightStatus.departure.longitude,
                    flightStatus.arrival.latitude, flightStatus.arrival.longitude
                );
                const coveredDist = calculateDistance(
                    flightStatus.departure.latitude, flightStatus.departure.longitude,
                    openSkyData.latitude!, openSkyData.longitude!
                );
                if (totalDist > 0) {
                    flightStatus.liveData.progress = Math.min(100, Math.max(0, Math.round((coveredDist / totalDist) * 100)));
                    console.log(`📊 Recalculated progress: ${flightStatus.liveData.progress}%`);
                }
            }

            return flightStatus;
        }

        console.log('❌ Flight not found in Amadeus or OpenSky');
        return null;

    } catch (error) {
        // Propagate rate-limit errors to the UI so users see a useful message
        if (error instanceof Error && error.message.toLowerCase().includes('rate limit')) {
            throw error;
        }
        console.error('Smart Flight Data Error:', error);
        return null;
    }
}

// Original AviationStack function
async function getFlightDataFromAviationStack(flightNumber: string): Promise<FlightStatus | null> {
    // If no key, use mock
    if (!AVIATION_STACK_KEY) {
        console.warn('⚠️ No AviationStack API key found. Using mock data.');
        await new Promise(resolve => setTimeout(resolve, 800));
        const normalizedNumber = flightNumber.toUpperCase().replace(/\s/g, '');
        return MOCK_FLIGHTS[normalizedNumber] || null;
    }

    try {
        const url = `http://api.aviationstack.com/v1/flights?access_key=${AVIATION_STACK_KEY}&flight_iata=${flightNumber}`;
        console.log('📡 Calling API:', url.replace(AVIATION_STACK_KEY, 'HIDDEN'));

        const response = await fetch(url);
        const data = await response.json();

        console.log('📥 API Response:', data);

        if (!data.data || data.data.length === 0) {
            console.log('❌ No flight found in API, checking mock data...');
            // Fallback to mock if not found in API (for demo purposes)
            const normalizedNumber = flightNumber.toUpperCase().replace(/\s/g, '');
            return MOCK_FLIGHTS[normalizedNumber] || null;
        }

        console.log('✅ Flight found in API!');
        console.log(`📋 Found ${data.data.length} flight(s) for ${flightNumber}`);

        // Filter and select the best flight:
        // 1. Prioritize active flights
        // 2. Then today's flights
        // 3. Then most recent flight
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const flight = data.data.find((f: any) => f.flight_status === 'active') || // Active flight first
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data.data.find((f: any) => f.flight_date === today) ||        // Today's flight
            data.data[0];                                                   // Most recent

        console.log(`🎯 Selected flight: ${flight.flight_date} (Status: ${flight.flight_status})`);

        // Get accurate airport coordinates from database
        const { getAirportCoords, interpolatePosition, calculateBearing } = await import('./airports');

        const depCoords = getAirportCoords(flight.departure.iata) || { lat: 40.6413, lng: -73.7781 };
        const arrCoords = getAirportCoords(flight.arrival.iata) || { lat: 34.0522, lng: -118.2437 };

        // Calculate accurate progress based on actual/scheduled times
        const now = new Date().getTime();

        // Use actual departure time if available, otherwise scheduled
        const depTime = flight.departure.actual
            ? new Date(flight.departure.actual).getTime()
            : new Date(flight.departure.scheduled).getTime();

        // Use estimated arrival if available, otherwise scheduled
        const arrTime = flight.arrival.estimated
            ? new Date(flight.arrival.estimated).getTime()
            : new Date(flight.arrival.scheduled).getTime();

        const totalDuration = arrTime - depTime;
        const elapsed = now - depTime;

        // Calculate progress with bounds checking
        let progress = 0;

        // Check if estimated arrival has already passed (API data might be stale)
        const arrivalPassed = now > arrTime;

        if (arrivalPassed && flight.flight_status !== 'landed' && flight.flight_status !== 'arrived') {
            console.warn('⚠️ Estimated arrival time has passed but API shows status as:', flight.flight_status);
            console.warn('⚠️ Note: Free tier API may have delayed updates. Flight likely landed.');
            progress = 100;
        } else if (flight.flight_status === 'scheduled') {
            progress = 0; // Flight hasn't departed yet
        } else if (flight.flight_status === 'landed' || flight.flight_status === 'arrived') {
            progress = 100; // Flight has landed
        } else if (flight.flight_status === 'active' || flight.flight_status === 'en-route') {
            // Flight is in progress - calculate based on time
            progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

            // If we have live data, we can be more confident in the progress
            if (flight.live?.latitude && flight.live?.longitude) {
                console.log('📍 Using live position data for accurate tracking');
            }
        } else {
            // For other statuses (delayed, cancelled, etc.), estimate based on time
            progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
        }

        console.log(`📊 Flight progress: ${progress.toFixed(1)}% (Status: ${flight.flight_status}, Arrival passed: ${arrivalPassed})`);

        // Use live coordinates if available, otherwise interpolate along great circle route
        const currentPos = flight.live?.latitude && flight.live?.longitude
            ? { lat: flight.live.latitude, lng: flight.live.longitude }
            : interpolatePosition(depCoords.lat, depCoords.lng, arrCoords.lat, arrCoords.lng, progress / 100);

        // Calculate accurate heading based on current position and destination
        const heading = calculateBearing(currentPos.lat, currentPos.lng, arrCoords.lat, arrCoords.lng);

        return {
            flightNumber: flight.flight.iata,
            flightDate: flight.flight_date,
            airline: flight.airline.name,
            status: (flight.flight_status.charAt(0).toUpperCase() + flight.flight_status.slice(1)) as FlightStatus['status'],
            departure: {
                airport: flight.departure.airport,
                code: flight.departure.iata,
                terminal: flight.departure.terminal || 'TBD',
                gate: flight.departure.gate || 'TBD',
                scheduledTime: flight.departure.scheduled,
                actualTime: flight.departure.actual,
                timezone: flight.departure.timezone,
                latitude: depCoords.lat,
                longitude: depCoords.lng
            },
            arrival: {
                airport: flight.arrival.airport,
                code: flight.arrival.iata,
                terminal: flight.arrival.terminal || 'TBD',
                gate: flight.arrival.gate || 'TBD',
                scheduledTime: flight.arrival.scheduled,
                estimatedTime: flight.arrival.estimated || flight.arrival.scheduled,
                timezone: flight.arrival.timezone,
                latitude: arrCoords.lat,
                longitude: arrCoords.lng
            },
            aircraft: {
                model: flight.aircraft?.iata || 'Boeing 737',
                registration: flight.aircraft?.registration || 'N/A',
                speed: flight.live?.speed_horizontal || 450,
                altitude: flight.live?.altitude || 35000,
                heading: heading
            },
            liveData: {
                latitude: currentPos.lat,
                longitude: currentPos.lng,
                progress: progress,
                remainingTime: calculateRemainingTime(flight.arrival.estimated || flight.arrival.scheduled)
            }
        };

    } catch (error) {
        console.error('API Error:', error);
        return null;
    }
}
