'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FlightStatus } from '@/lib/api';
import { RefreshCw } from 'lucide-react';

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

    // Dynamic Plane Icon with rotation
    const getPlaneIcon = (heading: number) => L.divIcon({
        html: `<div style="transform: rotate(${heading}deg); display: flex; align-items: center; justify-content: center; width: 48px; height: 48px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 36px; height: 36px; color: #3b82f6; filter: drop-shadow(0 0 12px rgba(59,130,246,1)) drop-shadow(0 0 4px rgba(255,255,255,0.8));">
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
        </div>`,
        className: 'bg-transparent',
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });

    // Custom origin/destination icons
    const getAirportIcon = (type: 'origin' | 'destination') => L.divIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: ${type === 'origin' ? '#10b981' : '#ef4444'}; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style="width: 18px; height: 18px;">
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
        <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative z-0">
            <MapContainer
                center={planePos}
                zoom={5}
                scrollWheelZoom={false}
                zoomControl={true}
                className="w-full h-full bg-slate-100"
                attributionControl={false}
            >
                {/* Lighter, more visible map tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                <MapController center={planePos} />

                {/* Animated route line from origin to destination */}
                {hasOrigin && hasDest && (
                    <>
                        {/* Full route path (thin gray reference line) */}
                        <Polyline
                            positions={[originPos, destPos]}
                            pathOptions={{
                                color: '#cbd5e1',
                                weight: 1,
                                opacity: 0.3,
                            }}
                        />

                        {/* Traveled path (animated dash, from origin to plane) */}
                        <Polyline
                            positions={[originPos, planePos]}
                            pathOptions={{
                                color: '#3b82f6',
                                weight: 4,
                                opacity: 0.8,
                                lineCap: 'round',
                                className: 'animate-dash'
                            }}
                        />

                        {/* Future path (dotted, from destination to plane) */}
                        <Polyline
                            positions={[destPos, planePos]}
                            pathOptions={{
                                color: '#94a3b8',
                                weight: 2,
                                dashArray: '5, 10',
                                opacity: 0.6,
                            }}
                        />
                    </>
                )}

                {/* Origin Marker */}
                {hasOrigin && (
                    <Marker position={originPos} icon={getAirportIcon('origin')}>
                        <Popup className="text-slate-900">
                            <div className="font-bold text-emerald-600">🛫 {flight.departure.code}</div>
                            <div className="text-sm">{flight.departure.airport}</div>
                            <div className="text-xs text-slate-500 mt-1">Origin</div>
                        </Popup>
                    </Marker>
                )}

                {/* Destination Marker */}
                {hasDest && (
                    <Marker position={destPos} icon={getAirportIcon('destination')}>
                        <Popup className="text-slate-900">
                            <div className="font-bold text-red-600">🛬 {flight.arrival.code}</div>
                            <div className="text-sm">{flight.arrival.airport}</div>
                            <div className="text-xs text-slate-500 mt-1">Destination</div>
                        </Popup>
                    </Marker>
                )}

                {/* Plane Marker */}
                <Marker position={planePos} icon={getPlaneIcon(flight.aircraft.heading)}>
                    <Popup className="text-slate-900">
                        <div className="font-bold text-blue-600">✈️ {flight.flightNumber}</div>
                        <div className="text-sm">{flight.airline}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                            <div><span className="text-slate-500">Speed:</span> {flight.aircraft.speed} kts</div>
                            <div><span className="text-slate-500">Alt:</span> {flight.aircraft.altitude.toLocaleString()} ft</div>
                            <div className="col-span-2"><span className="text-slate-500">Heading:</span> {flight.aircraft.heading}°</div>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            {/* Refresh Button */}
            <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="absolute top-4 right-4 z-[400] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg shadow-lg border border-blue-500/30 flex items-center gap-2 transition-all duration-200 hover:scale-105 active:scale-95"
            >
                <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="text-sm font-medium">{isRefreshing ? 'Updating...' : 'Refresh Position'}</span>
            </button>

            {/* Map Info */}
            <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-300 shadow-lg">
                <div className="text-xs font-medium text-slate-700">Live Position Tracking</div>
                <div className="text-[10px] text-slate-500">Powered by OpenSky Network</div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-slate-300 shadow-lg">
                <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-0 border-t-2 border-dashed border-blue-500"></div>
                        <span className="text-slate-600">Traveled</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-8 h-0 border-t-2 border-dashed border-slate-400"></div>
                        <span className="text-slate-600">Remaining</span>
                    </div>
                </div>
            </div>

            {/* CSS for animated dashes and blue zoom controls */}
            <style jsx global>{`
                @keyframes dash {
                    to {
                        stroke-dashoffset: -40;
                    }
                }
                .animate-dash {
                    stroke-dasharray: 10, 10;
                    animation: dash 3s linear infinite;
                }
                
                /* Style zoom control buttons to be blue */
                .leaflet-control-zoom a {
                    background-color: #2563eb !important;
                    color: white !important;
                    border: 1px solid #1d4ed8 !important;
                    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3) !important;
                }
                .leaflet-control-zoom a:hover {
                    background-color: #1d4ed8 !important;
                }
            `}</style>
        </div>
    );
}
