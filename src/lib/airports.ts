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

    // Chinese Airports
    'CAN': { lat: 23.3924, lng: 113.2988, name: 'Guangzhou Baiyun International' },
    'CTU': { lat: 30.5728, lng: 103.9468, name: 'Chengdu Shuangliu International' },
    'SZX': { lat: 22.6393, lng: 113.8107, name: 'Shenzhen Bao\'an International' },
    'SHA': { lat: 31.1979, lng: 121.3363, name: 'Shanghai Hongqiao International' },
    'KMG': { lat: 24.9924, lng: 102.7434, name: 'Kunming Changshui International' },
    'XIY': { lat: 34.4471, lng: 108.7516, name: 'Xi\'an Xianyang International' },
    'HGH': { lat: 30.2295, lng: 120.4344, name: 'Hangzhou Xiaoshan International' },
    'WUH': { lat: 30.7838, lng: 114.2081, name: 'Wuhan Tianhe International' },
    'CKG': { lat: 29.7192, lng: 106.6422, name: 'Chongqing Jiangbei International' },
    'NKG': { lat: 31.7420, lng: 118.8620, name: 'Nanjing Lukou International' },
    'TSN': { lat: 39.1244, lng: 117.3462, name: 'Tianjin Binhai International' },
    'TAO': { lat: 36.2661, lng: 120.3744, name: 'Qingdao Jiaodong International' },
    'SYX': { lat: 18.3029, lng: 109.4122, name: 'Sanya Phoenix International' },
    'HAK': { lat: 19.9349, lng: 110.4590, name: 'Haikou Meilan International' },
    'PKX': { lat: 39.5098, lng: 116.4105, name: 'Beijing Daxing International' },

    // Additional Middle East
    'RUH': { lat: 24.9576, lng: 46.6988, name: 'Riyadh King Khalid International' },
    'JED': { lat: 21.6796, lng: 39.1565, name: 'Jeddah King Abdulaziz International' },
    'MCT': { lat: 23.5933, lng: 58.2844, name: 'Muscat International' },
    'BAH': { lat: 26.2708, lng: 50.6336, name: 'Bahrain International' },
    'KWI': { lat: 29.2266, lng: 47.9689, name: 'Kuwait International' },
    'AMM': { lat: 31.7226, lng: 35.9932, name: 'Amman Queen Alia International' },
    'TLV': { lat: 32.0114, lng: 34.8867, name: 'Tel Aviv Ben Gurion International' },

    // Additional Indian Airports
    'MAA': { lat: 12.9941, lng: 80.1709, name: 'Chennai International' },
    'BLR': { lat: 13.1979, lng: 77.7063, name: 'Bengaluru Kempegowda International' },
    'HYD': { lat: 17.2403, lng: 78.4294, name: 'Hyderabad Rajiv Gandhi International' },
    'CCU': { lat: 22.6547, lng: 88.4467, name: 'Kolkata Netaji Subhas Chandra Bose International' },
    'COK': { lat: 10.1520, lng: 76.4019, name: 'Cochin International' },
    'GOI': { lat: 15.3808, lng: 73.8314, name: 'Goa Manohar International' },

    // Additional European Airports
    'MUC': { lat: 48.3537, lng: 11.7750, name: 'Munich Airport' },
    'BCN': { lat: 41.2971, lng: 2.0785, name: 'Barcelona-El Prat' },
    'LGW': { lat: 51.1537, lng: -0.1821, name: 'London Gatwick' },
    'STN': { lat: 51.8860, lng: 0.2389, name: 'London Stansted' },
    'ORY': { lat: 48.7262, lng: 2.3652, name: 'Paris Orly' },
    'VIE': { lat: 48.1103, lng: 16.5697, name: 'Vienna International' },
    'OSL': { lat: 60.1976, lng: 11.1004, name: 'Oslo Gardermoen' },
    'CPH': { lat: 55.6180, lng: 12.6560, name: 'Copenhagen Airport' },
    'ARN': { lat: 59.6519, lng: 17.9186, name: 'Stockholm Arlanda' },
    'HEL': { lat: 60.3172, lng: 24.9633, name: 'Helsinki-Vantaa' },
    'DUB': { lat: 53.4213, lng: -6.2701, name: 'Dublin Airport' },
    'LIS': { lat: 38.7742, lng: -9.1342, name: 'Lisbon Humberto Delgado' },
    'ATH': { lat: 37.9364, lng: 23.9445, name: 'Athens Eleftherios Venizelos' },
    'WAW': { lat: 52.1657, lng: 20.9671, name: 'Warsaw Chopin' },
    'PRG': { lat: 50.1008, lng: 14.2600, name: 'Prague Václav Havel' },
    'BRU': { lat: 50.9014, lng: 4.4844, name: 'Brussels Airport' },
    'MXP': { lat: 45.6306, lng: 8.7281, name: 'Milan Malpensa' },

    // Additional US Airports
    'TPA': { lat: 27.9755, lng: -82.5332, name: 'Tampa International' },
    'FLL': { lat: 26.0726, lng: -80.1527, name: 'Fort Lauderdale-Hollywood International' },
    'STL': { lat: 38.7487, lng: -90.3700, name: 'St. Louis Lambert International' },
    'SJC': { lat: 37.3626, lng: -121.9290, name: 'San Jose International' },
    'OAK': { lat: 37.7213, lng: -122.2208, name: 'Oakland International' },
    'MSY': { lat: 29.9934, lng: -90.2580, name: 'New Orleans Louis Armstrong International' },
    'CLE': { lat: 41.4117, lng: -81.8498, name: 'Cleveland Hopkins International' },
    'PIT': { lat: 40.4915, lng: -80.2329, name: 'Pittsburgh International' },
    'IND': { lat: 39.7173, lng: -86.2944, name: 'Indianapolis International' },
    'CMH': { lat: 39.9980, lng: -82.8919, name: 'John Glenn Columbus International' },
    'MCI': { lat: 39.2976, lng: -94.7139, name: 'Kansas City International' },
    'MKE': { lat: 42.9472, lng: -87.8966, name: 'Milwaukee Mitchell International' },
    'HNL': { lat: 21.3187, lng: -157.9224, name: 'Daniel K. Inouye International (Honolulu)' },
    'ANC': { lat: 61.1743, lng: -149.9962, name: 'Ted Stevens Anchorage International' },
    'SMF': { lat: 38.6954, lng: -121.5908, name: 'Sacramento International' },

    // Additional African Airports
    'ADD': { lat: 8.9779, lng: 38.7993, name: 'Addis Ababa Bole International' },
    'NBO': { lat: -1.3192, lng: 36.9278, name: 'Nairobi Jomo Kenyatta International' },
    'LOS': { lat: 6.5774, lng: 3.3213, name: 'Lagos Murtala Muhammed International' },
    'CMN': { lat: 33.3675, lng: -7.5898, name: 'Casablanca Mohammed V International' },
    'CPT': { lat: -33.9648, lng: 18.6017, name: 'Cape Town International' },
    'ALG': { lat: 36.6910, lng: 3.2154, name: 'Algiers Houari Boumediene' },
    'TUN': { lat: 36.8510, lng: 10.2272, name: 'Tunis-Carthage International' },

    // Additional Oceania
    'BNE': { lat: -27.3842, lng: 153.1175, name: 'Brisbane Airport' },
    'PER': { lat: -31.9403, lng: 115.9672, name: 'Perth Airport' },
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
    // European airports
    'EGLL': 'LHR', 'EGKK': 'LGW', 'EGSS': 'STN', 'EHAM': 'AMS',
    'EDDF': 'FRA', 'EDDM': 'MUC', 'EDDB': 'BER', 'EDDL': 'DUS',
    'LFPG': 'CDG', 'LFPO': 'ORY', 'LEMD': 'MAD', 'LEBL': 'BCN',
    'LIRF': 'FCO', 'LIMC': 'MXP', 'LTFM': 'IST', 'LTAI': 'AYT',
    'LSZH': 'ZRH', 'LOWW': 'VIE', 'ENGM': 'OSL', 'EKCH': 'CPH',
    'ESSA': 'ARN', 'EFHK': 'HEL', 'EIDW': 'DUB', 'LPPT': 'LIS',
    'LGAV': 'ATH', 'EPWA': 'WAW', 'LKPR': 'PRG', 'EBBR': 'BRU',

    // Middle East airports
    'OMDB': 'DXB', 'OMAL': 'AUH', 'OMAA': 'AUH',
    'OTHH': 'DOH', 'OTBD': 'DOH',
    'OERK': 'RUH', 'OEJN': 'JED',
    'OOMS': 'MCT', 'OBKH': 'BAH', 'OKBK': 'KWI',
    'OJAI': 'AMM', 'LLBG': 'TLV',

    // East Asian airports
    'RJTT': 'HND', 'RJAA': 'NRT', 'RJBB': 'KIX', 'RJOO': 'ITM',
    'RJFF': 'FUK', 'RJCC': 'CTS', 'RJSS': 'SDJ', 'RJGG': 'NGO',
    'RKSI': 'ICN', 'RKSS': 'GMP', 'RKPK': 'PUS',

    // Chinese airports
    'ZBAA': 'PEK', 'ZSPD': 'PVG', 'ZGGG': 'CAN', 'ZUUU': 'CTU',
    'ZGSZ': 'SZX', 'ZSSS': 'SHA', 'ZPPP': 'KMG', 'ZLXY': 'XIY',
    'ZSHC': 'HGH', 'ZHHH': 'WUH', 'ZUCK': 'CKG', 'ZSNJ': 'NKG',
    'ZBTJ': 'TSN', 'ZSQD': 'TAO', 'ZJSY': 'SYX', 'ZJHK': 'HAK',
    'ZBAD': 'PKX',

    // Southeast Asian airports
    'VHHH': 'HKG', 'WSSS': 'SIN', 'VTBS': 'BKK', 'WMKK': 'KUL',
    'RPLL': 'MNL', 'WIII': 'CGK', 'RPVM': 'CEB',
    'VTBD': 'DMK', 'VTSB': 'USM', 'VTSP': 'HKT',

    // South Asian airports
    'VIDP': 'DEL', 'VABB': 'BOM', 'VOMM': 'MAA', 'VOBL': 'BLR',
    'VOHY': 'HYD', 'VECC': 'CCU', 'VOCI': 'COK', 'VOGO': 'GOI',
    'VCBI': 'CMB', 'VRMM': 'MLE',

    // African airports
    'FAOR': 'JNB', 'FACT': 'CPT', 'HECA': 'CAI',
    'HAAB': 'ADD', 'HKJK': 'NBO', 'DNMM': 'LOS',
    'GMMN': 'CMN', 'DAAG': 'ALG', 'DTTA': 'TUN',

    // South American airports
    'SAEZ': 'EZE', 'SBGR': 'GRU', 'SBGL': 'GIG', 'SKBO': 'BOG',
    'SPJC': 'LIM', 'SCEL': 'SCL',

    // Oceania airports
    'YSSY': 'SYD', 'YMML': 'MEL', 'YBBN': 'BNE', 'YPPH': 'PER',
    'NZAA': 'AKL',
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
