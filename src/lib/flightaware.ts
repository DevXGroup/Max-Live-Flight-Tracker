import { FlightStatus } from './api';
import { getAirportCoords } from './airports';
import https from 'https';

const IATA_TO_ICAO: Record<string, string> = {
    'AA': 'AAL', 'AC': 'ACA', 'AF': 'AFR', 'AI': 'AIC', 'AM': 'AMX', 'AS': 'ASA',
    'AY': 'FIN', 'AZ': 'ITY', 'BA': 'BAW', 'B6': 'JBU', 'BR': 'EVA', 'CA': 'CCA',
    'CI': 'CAL', 'CX': 'CPA', 'CZ': 'CSN', 'DL': 'DAL', 'EK': 'UAE', 'EY': 'ETD',
    'F9': 'FFT', 'IB': 'IBE', 'JL': 'JAL', 'KE': 'KAL', 'KL': 'KLM', 'LH': 'DLH',
    'LX': 'SWR', 'MU': 'CES', 'NH': 'ANA', 'NK': 'NKS', 'NZ': 'ANZ', 'OS': 'AUA',
    'OZ': 'AAR', 'QF': 'QFA', 'QR': 'QTR', 'SK': 'SAS', 'SQ': 'SIA', 'SU': 'AFL',
    'TK': 'THY', 'UA': 'UAL', 'VS': 'VIR', 'WN': 'SWA', 'WS': 'WJA', 'FX': 'FDX',
    'FR': 'RYR', 'U2': 'EZY', 'W6': 'WZZ', 'TP': 'TAP', 'VY': 'VOI', 'YX': 'RPA',
    'MQ': 'ENY', 'OO': 'SKW', 'QK': 'JZA'
};

export async function scrapeFlightAware(flightNumber: string): Promise<FlightStatus | null> {
    const matchCarrier = flightNumber.toUpperCase().match(/^([A-Z]{2,3})(\d+)$/);
    let fetchId = flightNumber.toUpperCase();
    
    if (matchCarrier) {
        const carrier = matchCarrier[1];
        const num = matchCarrier[2];
        if (carrier.length === 2 && IATA_TO_ICAO[carrier]) {
            fetchId = `${IATA_TO_ICAO[carrier]}${num}`;
        }
    }

    const url = `https://www.flightaware.com/live/flight/${fetchId}`;

    return new Promise((resolve) => {
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            
            res.on('data', chunk => data += chunk);
            
            res.on('end', async () => {
                if (res.statusCode !== 200) {
                    console.log(`[FlightAware] URL returned status code ${res.statusCode}`);
                    return resolve(null);
                }

                const match = data.match(/var trackpollBootstrap = ({.*});/);
                if (!match) {
                    console.log(`[FlightAware] Could not find trackpollBootstrap pattern on page`);
                    return resolve(null);
                }

                try {
                    const json = JSON.parse(match[1]);
                    const flightKeys = Object.keys(json.flights || {});
                    if (flightKeys.length === 0) {
                        return resolve(null);
                    }

                    const f = json.flights[flightKeys[0]];
                    const now = new Date();

                    let status: FlightStatus['status'] = 'Scheduled';
                    const isLanded = f.status && f.status.toLowerCase().includes('arrived');
                    const isEnroute = f.status && f.status.toLowerCase().includes('en route');
                    const isDelayed = f.status && f.status.toLowerCase().includes('delayed');
                    const isCancelled = f.status && f.status.toLowerCase().includes('cancelled');
                    
                    if (isLanded) status = 'Landed';
                    else if (isEnroute) status = 'Active';
                    else if (isDelayed) status = 'Delayed';
                    else if (isCancelled) status = 'Cancelled';

                    const depCode = f.origin?.iata || f.origin?.icao || '???';
                    const arrCode = f.destination?.iata || f.destination?.icao || '???';
                    
                    const depCoords = getAirportCoords(depCode);
                    const arrCoords = getAirportCoords(arrCode);

                    // Track data
                    const track = f.track || [];
                    const lastPos = track.length > 0 ? track[track.length - 1] : null;

                    let currentLat = depCoords?.lat || 0;
                    let currentLng = depCoords?.lng || 0;

                    if (lastPos && lastPos.coord) {
                        currentLng = lastPos.coord[0];
                        currentLat = lastPos.coord[1];
                    }

                    const safeDate = (timestamp: number | null) => timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString();

                    const departureTimeScheduled = safeDate(f.gateDepartureTimes?.scheduled || null);
                    const departureTimeEstimated = safeDate(f.gateDepartureTimes?.estimated || null);
                    const departureTimeActual = safeDate(f.gateDepartureTimes?.actual || null);

                    const arrivalTimeScheduled = safeDate(f.gateArrivalTimes?.scheduled || null);
                    const arrivalTimeEstimated = safeDate(f.gateArrivalTimes?.estimated || null);

                    // Calculate Progress
                    let progress = isLanded ? 100 : 0;
                    if (!isLanded && depCoords && arrCoords) {
                        const { calculateDistance } = await import('./airports');
                        const totalDist = calculateDistance(depCoords.lat, depCoords.lng, arrCoords.lat, arrCoords.lng);
                        const coveredDist = calculateDistance(depCoords.lat, depCoords.lng, currentLat, currentLng);
                        if (totalDist > 0) {
                            progress = Math.min(99, Math.max(0, Math.round((coveredDist / totalDist) * 100)));
                        }
                    }

                    // Remaining time
                    let remainingTime = isLanded ? 'Arrived' : 'Calculating...';
                    if (!isLanded && arrivalTimeEstimated) {
                        try {
                            const { calculateRemainingTime } = await import('./flightUtils');
                            remainingTime = calculateRemainingTime(arrivalTimeEstimated);
                        } catch (e) {
                            console.error('[FlightAware] Duration calculation failed:', e);
                        }
                    }

                    const result: FlightStatus = {
                        flightNumber: flightNumber,
                        flightDate: now.toISOString().split('T')[0],
                        airline: f.airline?.shortName || f.airline?.fullName || 'Unknown',
                        status: status,
                        departure: {
                            airport: f.origin?.friendlyName || f.origin?.name || 'Unknown',
                            code: depCode,
                            terminal: f.gateOrigin?.terminal || 'TBD',
                            gate: f.gateOrigin?.gate || 'TBD',
                            scheduledTime: departureTimeScheduled,
                            estimatedTime: departureTimeEstimated,
                            actualTime: departureTimeActual,
                            timezone: f.origin?.timezone || 'Local',
                            latitude: depCoords?.lat || 0,
                            longitude: depCoords?.lng || 0,
                        },
                        arrival: {
                            airport: f.destination?.friendlyName || f.destination?.name || 'Unknown',
                            code: arrCode,
                            terminal: f.gateDestination?.terminal || 'TBD',
                            gate: f.gateDestination?.gate || 'TBD',
                            scheduledTime: arrivalTimeScheduled,
                            estimatedTime: arrivalTimeEstimated,
                            timezone: f.destination?.timezone || 'Local',
                            latitude: arrCoords?.lat || 0,
                            longitude: arrCoords?.lng || 0,
                        },
                        aircraft: {
                            model: f.aircraft?.friendlyType || f.aircraft?.type || 'Unknown',
                            registration: f.tail || 'Unknown',
                            speed: lastPos?.gs ? Number(lastPos.gs) : 0, // kts
                            altitude: lastPos?.alt ? Number(lastPos.alt) * 100 : 0, // ft (FlightAware alt is often in FL, e.g. 350 = 35000ft)
                            heading: lastPos?.heading ? Number(lastPos.heading) : 0,
                        },
                        liveData: {
                            latitude: currentLat,
                            longitude: currentLng,
                            progress: progress,
                            remainingTime: remainingTime,
                        }
                    };
                    
                    console.log(`✅ [FlightAware] Successfully scraped data for ${flightNumber}`);
                    resolve(result);

                } catch (e) {
                    console.error('[FlightAware] Parsing error:', e);
                    resolve(null);
                }
            });
        }).on('error', (err) => {
            console.error('[FlightAware] Network error:', err.message);
            resolve(null);
        });
    });
}
