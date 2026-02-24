// Airport coordinates database for accurate positioning
export const AIRPORT_COORDS: Record<string, { lat: number; lng: number; name: string }> = {
    // Major US Airports
    'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International' },
    'LAX': { lat: 33.9416, lng: -118.4085, name: 'Los Angeles International' },
    'ORD': { lat: 41.9742, lng: -87.9073, name: "O'Hare International" },
    'DFW': { lat: 32.8998, lng: -97.0403, name: 'Dallas/Fort Worth International' },
    'ATL': { lat: 33.6407, lng: -84.4277, name: 'Hartsfield-Jackson Atlanta' },
    'MIA': { lat: 25.7959, lng: -80.2870, name: 'Miami International' },

    'SFO': { lat: 37.6213, lng: -122.3790, name: 'San Francisco International' },
    'EWR': { lat: 40.6895, lng: -74.1745, name: 'Newark Liberty International' },
    'DAL': { lat: 32.8471, lng: -96.8518, name: 'Dallas Love Field' },
    'HOU': { lat: 29.6454, lng: -95.2788, name: 'William P. Hobby' },
    'DEL': { lat: 28.5562, lng: 77.1000, name: 'Indira Gandhi International' },
    'BOM': { lat: 19.0896, lng: 72.8656, name: 'Chhatrapati Shivaji Maharaj International' },
    'SEA': { lat: 47.4502, lng: -122.3088, name: 'Seattle-Tacoma International' },
    'LAS': { lat: 36.0840, lng: -115.1537, name: 'Harry Reid International' },
    'BOS': { lat: 42.3656, lng: -71.0096, name: 'Boston Logan International' },

    // European Airports
    'LHR': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow' },
    'CDG': { lat: 49.0097, lng: 2.5479, name: 'Paris Charles de Gaulle' },
    'FRA': { lat: 50.0379, lng: 8.5622, name: 'Frankfurt Airport' },
    'AMS': { lat: 52.3105, lng: 4.7683, name: 'Amsterdam Schiphol' },
    'MAD': { lat: 40.4983, lng: -3.5676, name: 'Madrid-Barajas' },
    'FCO': { lat: 41.8003, lng: 12.2389, name: 'Rome Fiumicino' },
    'IST': { lat: 41.2753, lng: 28.7519, name: 'Istanbul Airport' },
    'ZRH': { lat: 47.4647, lng: 8.5492, name: 'Zurich Airport' },

    // Asian Airports
    'HND': { lat: 35.5494, lng: 139.7798, name: 'Tokyo Haneda' },
    'NRT': { lat: 35.7720, lng: 140.3929, name: 'Tokyo Narita' },
    'ICN': { lat: 37.4602, lng: 126.4407, name: 'Seoul Incheon' },
    'PEK': { lat: 40.0799, lng: 116.6031, name: 'Beijing Capital' },
    'PVG': { lat: 31.1443, lng: 121.8083, name: 'Shanghai Pudong' },
    'HKG': { lat: 22.3080, lng: 113.9185, name: 'Hong Kong International' },
    'SIN': { lat: 1.3644, lng: 103.9915, name: 'Singapore Changi' },
    'BKK': { lat: 13.6900, lng: 100.7501, name: 'Bangkok Suvarnabhumi' },
    'DXB': { lat: 25.2532, lng: 55.3657, name: 'Dubai International' },
    'KUL': { lat: 2.7456, lng: 101.7072, name: 'Kuala Lumpur International' },

    // South American Airports
    'GRU': { lat: -23.4356, lng: -46.4731, name: 'São Paulo Guarulhos' },
    'GIG': { lat: -22.8089, lng: -43.2436, name: 'Rio de Janeiro Galeão' },
    'EZE': { lat: -34.8222, lng: -58.5358, name: 'Buenos Aires Ezeiza' },
    'BOG': { lat: 4.7016, lng: -74.1469, name: 'Bogotá El Dorado' },
    'LIM': { lat: -12.0219, lng: -77.1143, name: 'Lima Jorge Chávez' },

    // Oceania Airports
    'SYD': { lat: -33.9399, lng: 151.1753, name: 'Sydney Kingsford Smith' },
    'MEL': { lat: -37.6690, lng: 144.8410, name: 'Melbourne Airport' },
    'AKL': { lat: -37.0082, lng: 174.7850, name: 'Auckland Airport' },

    // African Airports
    'JNB': { lat: -26.1392, lng: 28.2460, name: 'Johannesburg OR Tambo' },
    'CAI': { lat: 30.1219, lng: 31.4056, name: 'Cairo International' },

    // Middle East
    'DOH': { lat: 25.2731, lng: 51.6080, name: 'Doha Hamad International' },
    'AUH': { lat: 24.4330, lng: 54.6511, name: 'Abu Dhabi International' },

    // Additional Asian


    // Southeast Asia
    'MNL': { lat: 14.5086, lng: 121.0194, name: 'Manila Ninoy Aquino' },
    'CGK': { lat: -6.1256, lng: 106.6559, name: 'Jakarta Soekarno-Hatta' },
    'CEB': { lat: 10.3075, lng: 123.9790, name: 'Mactan-Cebu International' },

    // Canadian Airports
    'YYZ': { lat: 43.6772, lng: -79.6306, name: 'Toronto Pearson International' },
    'YVR': { lat: 49.1967, lng: -123.1815, name: 'Vancouver International' },
    'YUL': { lat: 45.4706, lng: -73.7408, name: 'Montréal-Trudeau International' },
    'YYC': { lat: 51.1215, lng: -114.0131, name: 'Calgary International' },
    'YEG': { lat: 53.3097, lng: -113.5800, name: 'Edmonton International' },
    'YOW': { lat: 45.3225, lng: -75.6692, name: 'Ottawa Macdonald-Cartier International' },
    'YHZ': { lat: 44.8808, lng: -63.5086, name: 'Halifax Stanfield International' },
    'YWG': { lat: 49.9100, lng: -97.2398, name: 'Winnipeg Richardson International' },
    'YQB': { lat: 46.7911, lng: -71.3933, name: 'Québec City Jean Lesage International' },
    'YXE': { lat: 52.1708, lng: -106.6997, name: 'Saskatoon John G. Diefenbaker International' },

    // Additional US Airports
    'DEN': { lat: 39.8561, lng: -104.6737, name: 'Denver International' },
    'MSP': { lat: 44.8848, lng: -93.2223, name: 'Minneapolis-Saint Paul International' },
    'DTW': { lat: 42.2162, lng: -83.3554, name: 'Detroit Metropolitan Wayne County' },
    'PHL': { lat: 39.8721, lng: -75.2411, name: 'Philadelphia International' },
    'CLT': { lat: 35.2140, lng: -80.9431, name: 'Charlotte Douglas International' },
    'IAH': { lat: 29.9902, lng: -95.3368, name: 'Houston George Bush Intercontinental' },
    'PHX': { lat: 33.4373, lng: -112.0078, name: 'Phoenix Sky Harbor International' },
    'MCO': { lat: 28.4294, lng: -81.3089, name: 'Orlando International' },
    'SAN': { lat: 32.7338, lng: -117.1933, name: 'San Diego International' },
    'BNA': { lat: 36.1245, lng: -86.6782, name: 'Nashville International' },
    'AUS': { lat: 30.1975, lng: -97.6664, name: 'Austin-Bergstrom International' },
    'PDX': { lat: 45.5898, lng: -122.5951, name: 'Portland International' },
    'SLC': { lat: 40.7884, lng: -111.9778, name: 'Salt Lake City International' },
    'RDU': { lat: 35.8776, lng: -78.7875, name: 'Raleigh-Durham International' },
    'BWI': { lat: 39.1754, lng: -76.6682, name: 'Baltimore/Washington International' },
    'IAD': { lat: 38.9531, lng: -77.4565, name: 'Washington Dulles International' },
    'DCA': { lat: 38.8521, lng: -77.0379, name: 'Ronald Reagan Washington National' },
};

// Calculate great circle distance between two points (in km)
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Calculate bearing (heading) between two points
export function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = toRad(lon2 - lon1);
    const y = Math.sin(dLon) * Math.cos(toRad(lat2));
    const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
        Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);
    const bearing = Math.atan2(y, x);
    return (toDeg(bearing) + 360) % 360;
}

// Interpolate position along great circle route
export function interpolatePosition(
    lat1: number, lon1: number,
    lat2: number, lon2: number,
    fraction: number
): { lat: number; lng: number } {
    const φ1 = toRad(lat1);
    const λ1 = toRad(lon1);
    const φ2 = toRad(lat2);
    const λ2 = toRad(lon2);

    const d = 2 * Math.asin(Math.sqrt(
        Math.pow(Math.sin((φ1 - φ2) / 2), 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.pow(Math.sin((λ1 - λ2) / 2), 2)
    ));

    const a = Math.sin((1 - fraction) * d) / Math.sin(d);
    const b = Math.sin(fraction * d) / Math.sin(d);

    const x = a * Math.cos(φ1) * Math.cos(λ1) + b * Math.cos(φ2) * Math.cos(λ2);
    const y = a * Math.cos(φ1) * Math.sin(λ1) + b * Math.cos(φ2) * Math.sin(λ2);
    const z = a * Math.sin(φ1) + b * Math.sin(φ2);

    const φ3 = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ3 = Math.atan2(y, x);

    return {
        lat: toDeg(φ3),
        lng: toDeg(λ3)
    };
}

function toRad(degrees: number): number {
    return degrees * Math.PI / 180;
}

function toDeg(radians: number): number {
    return radians * 180 / Math.PI;
}

// Get airport coordinates by IATA code
export function getAirportCoords(iataCode: string): { lat: number; lng: number; name: string } | null {
    return AIRPORT_COORDS[iataCode] || null;
}

// ICAO4 airport codes that don't follow simple prefix rules → IATA
const ICAO4_TO_IATA: Record<string, string> = {
    'EGLL': 'LHR', 'EGKK': 'LGW', 'EHAM': 'AMS', 'EDDF': 'FRA',
    'LFPG': 'CDG', 'LEMD': 'MAD', 'LIRF': 'FCO', 'LTFM': 'IST',
    'LSZH': 'ZRH', 'OMDB': 'DXB', 'OMAL': 'AUH', 'OTHH': 'DOH',
    'OTBD': 'DOH', 'RJTT': 'HND', 'RJAA': 'NRT', 'RKSI': 'ICN',
    'ZBAA': 'PEK', 'ZSPD': 'PVG', 'VHHH': 'HKG', 'WSSS': 'SIN',
    'VTBS': 'BKK', 'WMKK': 'KUL', 'FAOR': 'JNB', 'HECA': 'CAI',
    'SAEZ': 'EZE', 'SBGR': 'GRU', 'SBGL': 'GIG', 'SKBO': 'BOG',
    'SPJC': 'LIM', 'YSSY': 'SYD', 'YMML': 'MEL', 'NZAA': 'AKL',
    'VIDP': 'DEL', 'VABB': 'BOM', 'RPLL': 'MNL', 'WIII': 'CGK',
};

// Convert a 4-letter ICAO airport code to a 3-letter IATA code
export function icaoToIata(icao4: string): string | null {
    if (!icao4 || icao4.length !== 4) return null;
    const upper = icao4.toUpperCase();

    // Check explicit lookup table first
    if (ICAO4_TO_IATA[upper]) return ICAO4_TO_IATA[upper];

    // US airports: K + 3-letter IATA (e.g. KLAX → LAX)
    if (upper.startsWith('K')) return upper.slice(1);

    // Canadian airports: CY + 2 chars → Y + 2 chars (e.g. CYYZ → YYZ, CYVR → YVR)
    if (upper.startsWith('C') && upper[1] === 'Y') return upper.slice(1);

    // Mexican airports: MM prefix (e.g. MMMX → MEX) — fall through to null
    // Australian airports: YY prefix handled via explicit table above

    // Generic fallback: try last 3 chars and see if it's in our DB
    const last3 = upper.slice(1);
    if (AIRPORT_COORDS[last3]) return last3;

    return null;
}
