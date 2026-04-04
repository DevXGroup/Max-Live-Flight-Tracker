'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FlightStatus } from '@/lib/api';
import { RefreshCw } from 'lucide-react';
import { calculateDistance, interpolatePosition, calculateBearing } from '@/lib/airports';

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
    onRefresh?: () => void;
}

// Component to recenter map when flight position changes
function MapController({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, map.getZoom(), {
            animate: true,
            duration: 1
        });
    }, [center, map]);

    return null;
}

export default function FlightMap({ flight, onRefresh }: FlightMapProps) {
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Coordinates
    const planePos: [number, number] = [flight.liveData.latitude, flight.liveData.longitude];
    const originPos: [number, number] = [flight.departure.latitude, flight.departure.longitude];
    const destPos: [number, number] = [flight.arrival.latitude, flight.arrival.longitude];

    // Check if coordinates are valid (not 0,0)
    const hasOrigin = originPos[0] !== 0 || originPos[1] !== 0;
    const hasDest = destPos[0] !== 0 || destPos[1] !== 0;

    // Generate curved path segments (Great Circle)
    const getCurvedPath = (start: [number, number], end: [number, number], points = 20) => {
        const path: [number, number][] = [];
        for (let i = 0; i <= points; i++) {
            const pos = interpolatePosition(start[0], start[1], end[0], end[1], i / points);
            path.push([pos.lat, pos.lng]);
        }
        return path;
    };

    const fullRoute = hasOrigin && hasDest ? getCurvedPath(originPos, destPos) : [];
    
    // For the traveled path, we need to find the point on the great circle closest to the plane, 
    // or just interpolate from origin to plane (though it might not align perfectly with the full route)
    // A better way: interpolate from origin to plane for the traveled blue line
    const traveledPath = hasOrigin ? getCurvedPath(originPos, planePos) : [];
    const remainingPath = hasDest ? getCurvedPath(planePos, destPos) : [];

    // Calculate heading (bearing) if the API doesn't provide one
    const visualHeading = flight.aircraft.heading || (hasDest ? calculateBearing(planePos[0], planePos[1], destPos[0], destPos[1]) : 0);

    // Dynamic Plane Icon with rotation
    const getPlaneIcon = (heading: number) => L.divIcon({
        html: `<div style="transform: rotate(${heading}deg); display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
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
        setIsRefreshing(true);
        if (onRefresh) {
            await onRefresh();
        }
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    return (
        <div className="w-full h-[400px] md:h-[500px] rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative z-0 group">
            <MapContainer
                center={planePos}
                zoom={4}
                scrollWheelZoom={false}
                zoomControl={true}
                className="w-full h-full bg-[#0b1120]"
                attributionControl={false}
            >
                {/* Premium Dark Theme Map */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                <MapController center={planePos} />

                {/* Curved Great Circle paths */}
                {hasOrigin && hasDest && (
                    <>
                        {/* Remaining path (dotted) */}
                        <Polyline
                            positions={remainingPath}
                            pathOptions={{
                                color: '#475569',
                                weight: 2,
                                dashArray: '8, 12',
                                opacity: 0.5,
                            }}
                        />

                        {/* Traveled path (glowing blue) */}
                        <Polyline
                            positions={traveledPath}
                            pathOptions={{
                                color: '#3b82f6',
                                weight: 3,
                                opacity: 0.8,
                                lineCap: 'round',
                                className: 'animate-dash shadow-blue'
                            }}
                        />
                    </>
                )}

                {/* Origin Marker */}
                {hasOrigin && (
                    <Marker position={originPos} icon={getAirportIcon('origin')}>
                        <Popup className="text-slate-100 bg-slate-900 border-slate-700">
                            <div className="font-bold text-emerald-400">🛫 {flight.departure.code}</div>
                            <div className="text-xs text-slate-300">{flight.departure.airport}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Destination Marker */}
                {hasDest && (
                    <Marker position={destPos} icon={getAirportIcon('destination')}>
                        <Popup className="text-slate-100 bg-slate-900 border-slate-700">
                            <div className="font-bold text-rose-400">🛬 {flight.arrival.code}</div>
                            <div className="text-xs text-slate-300">{flight.arrival.airport}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Plane Marker */}
                <Marker position={planePos} icon={getPlaneIcon(visualHeading)}>
                    <Popup>
                        <div className="p-1 min-w-[150px]">
                            <div className="font-bold text-blue-400 flex items-center justify-between mb-1">
                                <span>✈️ {flight.flightNumber}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${flight.status === 'Active' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                    {flight.status}
                                </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mb-2 border-b border-slate-700 pb-1">{flight.airline}</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                                <div className="text-slate-500 uppercase tracking-tighter">Speed</div>
                                <div className="text-slate-300 font-medium text-right">{flight.aircraft.speed} kts</div>
                                <div className="text-slate-500 uppercase tracking-tighter">Altitude</div>
                                <div className="text-slate-300 font-medium text-right">{flight.aircraft.altitude.toLocaleString()} ft</div>
                                <div className="text-slate-500 uppercase tracking-tighter">Heading</div>
                                <div className="text-slate-300 font-medium text-right">{flight.aircraft.heading}°</div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Premium Overlay Controls */}
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="absolute top-4 right-4 z-[400] bg-slate-900/80 hover:bg-blue-600 backdrop-blur-md text-white px-4 py-2 rounded-xl border border-slate-700/50 shadow-2xl flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
                <RefreshCw size={14} className={`${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                <span className="text-xs font-semibold tracking-wide uppercase">{isRefreshing ? 'Syncing...' : 'Update'}</span>
            </button>

            {/* Map Info Box */}
            <div className="absolute bottom-6 left-6 z-[400] bg-slate-900/40 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/5 shadow-2xl pointer-events-none">
                <div className="flex items-center gap-2 mb-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="text-[10px] font-bold text-slate-200 uppercase tracking-widest">Live Pos</div>
                </div>
                <div className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">Source: Multi-Chain ADSB</div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute bottom-6 right-6 z-[400] overflow-hidden">
                <div className="bg-slate-900/40 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4 text-[9px] font-bold text-slate-400 tracking-widest uppercase">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                            <span>Traveled</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-0.5 border-t border-dashed border-slate-500"></div>
                            <span>To Go</span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes dash {
                    to { stroke-dashoffset: -40; }
                }
                .animate-dash {
                    stroke-dasharray: 10, 10;
                    animation: dash 3s linear infinite;
                }
                .leaflet-container {
                    background: #0b1120 !important;
                }
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
            `}</style>
        </div>
    );
}
