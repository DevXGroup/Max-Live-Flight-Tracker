'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { FlightStatus } from '@/lib/api';
import { RefreshCw } from 'lucide-react';
import { interpolatePosition } from '@/lib/airports';
import { formatFlightAge, isFlightPositionStale, isValidFlightDate } from '@/lib/flightUtils';

// Fix for default marker icon
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

interface FlightMapProps {
    flight: FlightStatus;
    onRefresh?: () => Promise<void> | void;
}

// Component to recenter map when flight position changes
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    const [latitude, longitude] = center;

    useEffect(() => {
        map.setView([latitude, longitude], map.getZoom(), {
            animate: true,
            duration: 1,
        });
    }, [latitude, longitude, map]);

    return null;
}

export default function FlightMap({ flight, onRefresh }: FlightMapProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [mapTilesUnavailable, setMapTilesUnavailable] = useState(false);

    const toCoordinates = (latitude: number | null, longitude: number | null): [number, number] | null => {
        if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
        return [latitude, longitude];
    };

    const planePos = toCoordinates(flight.liveData.latitude, flight.liveData.longitude);
    const originPos = toCoordinates(flight.departure.latitude, flight.departure.longitude);
    const destPos = toCoordinates(flight.arrival.latitude, flight.arrival.longitude);
    const routeKnown = originPos !== null && destPos !== null;

    const getCurvedPath = (start: [number, number], end: [number, number], points = 20) => {
        const path: [number, number][] = [];
        for (let i = 0; i <= points; i++) {
            const pos = interpolatePosition(start[0], start[1], end[0], end[1], i / points);
            path.push([pos.lat, pos.lng]);
        }
        return path;
    };

    const referencePath = originPos && destPos ? getCurvedPath(originPos, destPos) : [];
    const visualHeading = typeof flight.aircraft.heading === 'number' && Number.isFinite(flight.aircraft.heading)
        ? flight.aircraft.heading
        : null;

    const routeMidpoint = originPos && destPos
        ? interpolatePosition(originPos[0], originPos[1], destPos[0], destPos[1], 0.5)
        : null;
    const center: [number, number] = planePos
        ?? (routeMidpoint ? [routeMidpoint.lat, routeMidpoint.lng] : originPos ?? destPos ?? [20, 0]);

    const getPlaneIcon = (trackDirection: number | null) => L.divIcon({
        html: `<div style="transform: ${trackDirection === null ? 'none' : `rotate(${trackDirection}deg)`}; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 38px; height: 38px; color: #60a5fa; filter: drop-shadow(0 0 8px rgba(96,165,250,0.8)) drop-shadow(0 0 2px rgba(255,255,255,0.4));">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
        </div>`,
        className: 'bg-transparent',
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });

    const getAirportIcon = (type: 'origin' | 'destination') => L.divIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: ${type === 'origin' ? '#059669' : '#dc2626'}; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 0 15px ${type === 'origin' ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'};">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="width: 16px; height: 16px;">
                ${type === 'origin'
                    ? '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>'
                    : '<path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>'}
            </svg>
        </div>`,
        className: 'bg-transparent',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
    });

    const handleRefresh = async () => {
        if (!onRefresh) return;
        setIsRefreshing(true);
        try {
            await onRefresh();
        } finally {
            setIsRefreshing(false);
        }
    };

    const positionSource = flight.dataSources.position || 'Unavailable';
    const routeSource = flight.dataSources.route || 'Unavailable';
    const hasVrsReference = routeSource.toLowerCase().includes('virtual radar');
    const positionAge = formatFlightAge(flight.dataQuality.positionUpdatedAt);
    const positionMayBeStale = Boolean(planePos) && (
        !isValidFlightDate(flight.dataQuality.positionUpdatedAt)
        || isFlightPositionStale(flight.dataQuality.positionUpdatedAt)
    );
    const hasAdsbLolSource = positionSource.toLowerCase().includes('adsb.lol');
    const routeLabel = flight.dataQuality.routeConfidence === 'schedule'
        ? 'Scheduled route'
        : flight.dataQuality.routeConfidence === 'callsign'
            ? 'Reference route from callsign. It may not be the current trip.'
            : 'Route guide is unconfirmed.';

    return (
        <div className="w-full">
            <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative z-0 group">
                <MapContainer
                    center={center}
                    zoom={4}
                    scrollWheelZoom={false}
                    zoomControl={true}
                    className="w-full h-full bg-[#0b1120]"
                    attributionControl={true}
                >
                    <TileLayer
                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                        className="flight-map-tiles"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
                        eventHandlers={{
                            tileerror: () => setMapTilesUnavailable(true),
                            tileload: () => setMapTilesUnavailable(false),
                        }}
                    />

                    <MapController center={center} />

                    {routeKnown && (
                        <Polyline
                            positions={referencePath}
                            pathOptions={{ color: '#94a3b8', weight: 2, dashArray: '8, 12', opacity: 0.75 }}
                        />
                    )}

                    {originPos && (
                        <Marker position={originPos} icon={getAirportIcon('origin')}>
                            <Popup>
                                <div className="font-bold text-emerald-400">{flight.departure.code || 'Departure'}</div>
                                <div className="text-xs text-slate-300">{flight.departure.airport || 'Airport unavailable'}</div>
                            </Popup>
                        </Marker>
                    )}

                    {destPos && (
                        <Marker position={destPos} icon={getAirportIcon('destination')}>
                            <Popup>
                                <div className="font-bold text-rose-400">{flight.arrival.code || 'Arrival'}</div>
                                <div className="text-xs text-slate-300">{flight.arrival.airport || 'Airport unavailable'}</div>
                            </Popup>
                        </Marker>
                    )}

                    {planePos && (
                        <Marker position={planePos} icon={getPlaneIcon(visualHeading)}>
                            <Popup>
                                <div className="p-1 min-w-[150px]">
                                    <div className="font-bold text-blue-400 flex items-center justify-between mb-1">
                                        <span>{flight.flightNumber}</span>
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">{flight.status || 'Unknown'}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mb-2 border-b border-slate-700 pb-1">{flight.airline || 'Airline unavailable'}</div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                                        <div className="text-slate-500 uppercase tracking-tighter">Speed</div>
                                        <div className="text-slate-300 font-medium text-right">{flight.aircraft.speed === null ? 'Unavailable' : `${flight.aircraft.speed} kts`}</div>
                                        <div className="text-slate-500 uppercase tracking-tighter">Altitude</div>
                                        <div className="text-slate-300 font-medium text-right">{flight.aircraft.altitude === null ? 'Unavailable' : `${flight.aircraft.altitude.toLocaleString()} ft`}</div>
                                        <div className="text-slate-500 uppercase tracking-tighter">Track direction</div>
                                        <div className="text-slate-300 font-medium text-right">{flight.aircraft.heading === null ? 'Unavailable' : `${flight.aircraft.heading}°`}</div>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>

                <button
                    type="button"
                    onClick={handleRefresh}
                    disabled={isRefreshing || !onRefresh}
                    className="absolute top-4 right-4 z-[400] min-h-[44px] bg-slate-900/80 hover:bg-blue-600 disabled:opacity-60 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-slate-700/50 shadow-2xl flex items-center gap-2 transition-all duration-300"
                >
                    <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} aria-hidden="true" />
                    <span className="text-xs font-semibold tracking-wide uppercase">{isRefreshing ? 'Updating...' : 'Update'}</span>
                </button>

                {mapTilesUnavailable && (
                    <div role="alert" className="absolute top-16 left-4 right-4 z-[400] mx-auto max-w-sm rounded-lg bg-slate-950/90 px-4 py-3 text-center text-sm text-amber-200 border border-amber-500/30">
                        Map tiles could not load. Flight details remain available above.
                    </div>
                )}
            </div>

            <div role="note" className="mt-3 px-1 flex flex-col gap-1 text-xs text-slate-400" aria-label="Map sources and data age">
                <p>
                    Position: {positionSource}{positionAge !== 'Unavailable' ? ` · observed ${positionAge}` : ' · age unavailable'}{positionMayBeStale ? ' · may be stale' : ''}
                </p>
                <p>Route: {routeSource} · {routeLabel}</p>
                {hasVrsReference && (
                    <p>
                        Route reference: <a className="underline hover:text-white" href="https://github.com/vradarserver/standing-data" target="_blank" rel="noreferrer">Virtual Radar standing data</a>, licensed <a className="underline hover:text-white" href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a>.
                    </p>
                )}
                {hasAdsbLolSource && (
                    <p>
                        Position data from <a className="underline hover:text-white" href="https://www.adsb.lol/" target="_blank" rel="noreferrer">adsb.lol</a> is shared under the <a className="underline hover:text-white" href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer">Open Data Commons ODbL 1.0</a>.
                    </p>
                )}
                <p>Map tiles © <a className="underline hover:text-white" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>.</p>
            </div>

            <style jsx global>{`
                .leaflet-popup-content-wrapper {
                    background: rgba(15, 23, 42, 0.9) !important;
                    color: white !important;
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px !important;
                    padding: 0 !important;
                }
                .leaflet-popup-tip {
                    background: rgba(15, 23, 42, 0.9) !important;
                }
                .leaflet-popup-content {
                    margin: 8px 12px !important;
                }
                .leaflet-control-zoom {
                    border: none !important;
                    margin: 20px !important;
                }
                .leaflet-control-zoom a {
                    width: 44px !important;
                    height: 44px !important;
                    line-height: 44px !important;
                    background: rgba(30, 41, 59, 0.8) !important;
                    color: #94a3b8 !important;
                    border: 1px solid rgba(255,255,255,0.05) !important;
                    backdrop-filter: blur(4px);
                    transition: all 0.2s !important;
                }
                .leaflet-control-zoom a:hover {
                    background: #3b82f6 !important;
                    color: white !important;
                }
                .leaflet-control-attribution {
                    background: rgba(15, 23, 42, 0.9) !important;
                    color: #cbd5e1 !important;
                }
                .leaflet-control-attribution a {
                    color: #93c5fd !important;
                }
            `}</style>
        </div>
    );
}
