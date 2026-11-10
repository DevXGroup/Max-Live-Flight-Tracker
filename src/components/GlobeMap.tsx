'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';
import { FlightStatus } from '@/lib/api';
import { interpolatePosition } from '@/lib/airports';
import { formatFlightAge, isFlightPositionStale, isValidFlightDate } from '@/lib/flightUtils';

interface GlobeMapProps {
    flight: FlightStatus;
}

export default function GlobeMap({ flight }: GlobeMapProps) {
    const globeEl = useRef<GlobeMethods | undefined>(undefined);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
    const [mounted, setMounted] = useState(false);

    const toCoordinates = (latitude: number | null, longitude: number | null) => {
        if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
        return { lat: latitude, lng: longitude };
    };

    const currentPosition = toCoordinates(flight.liveData.latitude, flight.liveData.longitude);
    const departure = toCoordinates(flight.departure.latitude, flight.departure.longitude);
    const arrival = toCoordinates(flight.arrival.latitude, flight.arrival.longitude);
    const routeKnown = departure !== null && arrival !== null;

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, []);

    useEffect(() => {
        if (!globeEl.current || !mounted) return;

        let center = currentPosition;
        if (!center && departure && arrival) {
            center = interpolatePosition(departure.lat, departure.lng, arrival.lat, arrival.lng, 0.5);
        }
        if (center) {
            globeEl.current.pointOfView({ lat: center.lat, lng: center.lng, altitude: 2.0 }, 1000);
            const timer = window.setTimeout(() => {
                if (globeEl.current) {
                    globeEl.current.controls().autoRotate = true;
                    globeEl.current.controls().autoRotateSpeed = 0.5;
                }
            }, 2000);
            return () => window.clearTimeout(timer);
        }
    }, [
        arrival?.lat,
        arrival?.lng,
        currentPosition?.lat,
        currentPosition?.lng,
        departure?.lat,
        departure?.lng,
        mounted,
    ]);

    const arcsData = useMemo(() => routeKnown && departure && arrival ? [{
        startLat: departure.lat,
        startLng: departure.lng,
        endLat: arrival.lat,
        endLng: arrival.lng,
        color: ['#3b82f6', '#60a5fa'],
    }] : [], [arrival?.lat, arrival?.lng, departure?.lat, departure?.lng, routeKnown]);

    const pointsData = useMemo(() => [
        ...(departure ? [{ lat: departure.lat, lng: departure.lng, name: flight.departure.code || 'Departure', color: '#10b981', size: 0.5 }] : []),
        ...(arrival ? [{ lat: arrival.lat, lng: arrival.lng, name: flight.arrival.code || 'Arrival', color: '#ef4444', size: 0.5 }] : []),
    ], [arrival?.lat, arrival?.lng, departure?.lat, departure?.lng, flight.arrival.code, flight.departure.code]);

    const ringsData = useMemo(() => currentPosition ? [{
        lat: currentPosition.lat,
        lng: currentPosition.lng,
        color: '#ffffff',
        maxRadius: 5,
        propagationSpeed: 5,
        repeatPeriod: 800,
    }] : [], [currentPosition?.lat, currentPosition?.lng]);

    interface PlaneData {
        lat: number;
        lng: number;
        heading: number | null;
        color: string;
    }

    const planeData = useMemo(() => currentPosition ? [{
        lat: currentPosition.lat,
        lng: currentPosition.lng,
        heading: typeof flight.aircraft.heading === 'number' && Number.isFinite(flight.aircraft.heading)
            ? flight.aircraft.heading
            : null,
        color: '#3b82f6',
    }] : [], [currentPosition?.lat, currentPosition?.lng, flight.aircraft.heading]);

    const labelsData = useMemo(() => [
        ...(departure ? [{
            lat: departure.lat,
            lng: departure.lng,
            text: flight.departure.code || 'Departure',
            size: 0.8,
            color: '#10b981',
        }] : []),
        ...(arrival ? [{
            lat: arrival.lat,
            lng: arrival.lng,
            text: flight.arrival.code || 'Arrival',
            size: 0.8,
            color: '#ef4444',
        }] : []),
    ], [arrival?.lat, arrival?.lng, departure?.lat, departure?.lng, flight.arrival.code, flight.departure.code]);

    const positionSource = flight.dataSources.position || 'Unavailable';
    const routeSource = flight.dataSources.route || 'Unavailable';
    const hasVrsReference = routeSource.toLowerCase().includes('virtual radar');
    const positionAge = formatFlightAge(flight.dataQuality.positionUpdatedAt);
    const positionMayBeStale = Boolean(currentPosition) && (
        !isValidFlightDate(flight.dataQuality.positionUpdatedAt)
        || isFlightPositionStale(flight.dataQuality.positionUpdatedAt)
    );
    const hasAdsbLolSource = positionSource.toLowerCase().includes('adsb.lol');

    if (!mounted) return null;

    return (
        <div ref={containerRef} className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative z-0 bg-slate-900">
            <Globe
                ref={globeEl}
                width={dimensions.width}
                height={dimensions.height}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                arcsData={arcsData}
                arcColor="color"
                arcDashLength={0.6}
                arcDashGap={0.1}
                arcDashAnimateTime={1500}
                arcStroke={0.8}
                arcAltitude={0.3}
                arcAltitudeAutoScale={0.5}
                pointsData={pointsData}
                pointColor="color"
                pointAltitude={0}
                pointRadius="size"
                ringsData={ringsData}
                ringColor="color"
                ringMaxRadius="maxRadius"
                ringPropagationSpeed="propagationSpeed"
                ringRepeatPeriod="repeatPeriod"
                htmlElementsData={planeData}
                htmlElement={(d: object) => {
                    const data = d as PlaneData;
                    const el = document.createElement('div');
                    const rotation = data.heading === null ? 'none' : `rotate(${data.heading}deg)`;
                    el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 28px; height: 28px; color: ${data.color}; filter: drop-shadow(0 0 6px ${data.color});">
                        <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                    </svg>`;
                    el.style.transform = `translate(-50%, -50%) ${rotation}`;
                    el.style.width = '28px';
                    el.style.height = '28px';
                    el.style.pointerEvents = 'none';
                    return el;
                }}
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

            <div className="absolute bottom-4 left-4 z-[10] bg-slate-900/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-700 text-xs text-slate-300 pointer-events-auto max-w-[min(80%,34rem)]">
                <p className="font-semibold">{currentPosition ? 'Current position' : 'Position unavailable'}</p>
                <p>Position: {positionSource}{positionAge !== 'Unavailable' ? ` · observed ${positionAge}` : ''}{positionMayBeStale ? ' · may be stale' : ''}</p>
                <p>Route: {routeSource}{flight.dataQuality.routeConfidence === 'callsign' ? ' · callsign reference, not confirmed' : ''}</p>
                {hasVrsReference && (
                    <p>
                        Route reference: <a className="underline hover:text-white" href="https://github.com/vradarserver/standing-data" target="_blank" rel="noreferrer">Virtual Radar standing data</a>, licensed <a className="underline hover:text-white" href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a>.
                    </p>
                )}
                {!currentPosition && routeKnown && <p>Showing the available route.</p>}
                {!currentPosition && !routeKnown && <p>No flight location is available.</p>}
                {hasAdsbLolSource && (
                    <p className="mt-1">
                        Data from <a className="underline hover:text-white" href="https://www.adsb.lol/" target="_blank" rel="noreferrer">adsb.lol</a> is shared under the <a className="underline hover:text-white" href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer">Open Data Commons ODbL</a>.
                    </p>
                )}
            </div>
        </div>
    );
}
