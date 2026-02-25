'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { FlightStatus } from '@/lib/api';
import { interpolatePosition } from '@/lib/airports';

interface GlobeMapProps {
    flight: FlightStatus;
}

export default function GlobeMap({ flight }: GlobeMapProps) {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (globeEl.current && mounted) {
            // Center the camera on the flight path using geodesic midpoint
            const startLat = flight.departure.latitude;
            const startLng = flight.departure.longitude;
            const endLat = flight.arrival.latitude;
            const endLng = flight.arrival.longitude;

            // Calculate accurate midpoint along the great circle path
            const midPoint = interpolatePosition(startLat, startLng, endLat, endLng, 0.5);

            // Set initial point of view
            globeEl.current.pointOfView({
                lat: midPoint.lat,
                lng: midPoint.lng,
                altitude: 2.0
            }, 1000);

            // Enable auto-rotation after a slight delay
            setTimeout(() => {
                if (globeEl.current) {
                    globeEl.current.controls().autoRotate = true;
                    globeEl.current.controls().autoRotateSpeed = 0.5;
                }
            }, 2000);
        }
    }, [flight, mounted]);

    const arcsData = useMemo(() => [{
        startLat: flight.departure.latitude,
        startLng: flight.departure.longitude,
        endLat: flight.arrival.latitude,
        endLng: flight.arrival.longitude,
        color: ['#3b82f6', '#60a5fa']
    }], [flight]);

    const pointsData = useMemo(() => [
        { lat: flight.departure.latitude, lng: flight.departure.longitude, name: flight.departure.code, color: '#10b981', size: 0.5 },
        { lat: flight.arrival.latitude, lng: flight.arrival.longitude, name: flight.arrival.code, color: '#ef4444', size: 0.5 }
    ], [flight]);

    // Use a ring to show the plane's current position
    const ringsData = useMemo(() => [{
        lat: flight.liveData.latitude,
        lng: flight.liveData.longitude,
        color: '#ffffff',
        maxRadius: 5,
        propagationSpeed: 5,
        repeatPeriod: 800
    }], [flight]);

    // Plane data for HTML marker
    interface PlaneData {
        lat: number;
        lng: number;
        heading: number;
        color: string;
    }

    const planeData = useMemo(() => [{
        lat: flight.liveData.latitude,
        lng: flight.liveData.longitude,
        heading: flight.aircraft.heading,
        color: '#3b82f6'
    }], [flight]);

    // Labels for airports only
    const labelsData = useMemo(() => [
        {
            lat: flight.departure.latitude,
            lng: flight.departure.longitude,
            text: flight.departure.code,
            size: 0.8,
            color: '#10b981'
        },
        {
            lat: flight.arrival.latitude,
            lng: flight.arrival.longitude,
            text: flight.arrival.code,
            size: 0.8,
            color: '#ef4444'
        }
    ], [flight]);

    if (!mounted) return null;

    return (
        <div ref={containerRef} className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative z-0 bg-slate-900">
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                // High-res satellite imagery
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"

                // Flight Path
                arcsData={arcsData}
                arcColor="color"
                arcDashLength={0.6}
                arcDashGap={0.1}
                arcDashAnimateTime={1500}
                arcStroke={0.8}
                arcAltitude={0.3}
                arcAltitudeAutoScale={0.5}

                // Airports
                pointsData={pointsData}
                pointColor="color"
                pointAltitude={0}
                pointRadius="size"

                // Plane Pulse
                ringsData={ringsData}
                ringColor="color"
                ringMaxRadius="maxRadius"
                ringPropagationSpeed="propagationSpeed"
                ringRepeatPeriod="repeatPeriod"

                // Plane HTML Marker
                htmlElementsData={planeData}
                htmlElement={(d: object) => {
                    const data = d as PlaneData;
                    const el = document.createElement('div');
                    // Better airplane icon - Material Design style
                    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 28px; height: 28px; color: ${data.color}; filter: drop-shadow(0 0 6px ${data.color});">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>`;
                    // Rotate based on heading (0 = North, 90 = East, etc.)
                    // The SVG naturally points up (North), so we just rotate by heading
                    el.style.transform = `translate(-50%, -50%) rotate(${data.heading}deg)`;
                    el.style.width = '28px';
                    el.style.height = '28px';
                    el.style.pointerEvents = 'none';
                    el.style.transition = 'transform 0.3s ease';
                    return el;
                }}

                // Airport Labels
                labelsData={labelsData}
                labelLat="lat"
                labelLng="lng"
                labelText="text"
                labelSize="size"
                labelColor="color"
                labelDotRadius={0.3}
                labelAltitude={0.01}

                atmosphereColor="#3b82f6"
                atmosphereAltitude={0.15}
            />

            {/* Overlay Info */}
            <div className="absolute bottom-4 left-4 z-[10] bg-slate-900/80 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-400 pointer-events-none flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-black text-[8px]">DX</span>
                </div>
                <span>Interactive 3D Globe • Devx Group LLC</span>
            </div>
        </div>
    );
}
