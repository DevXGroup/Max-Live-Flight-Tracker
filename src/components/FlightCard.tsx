import type { FlightStatus } from "@/lib/api";
import { Plane, Clock, MapPin, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

import { formatFlightAge, formatFlightDate, formatFlightTime, isFlightPositionStale, isValidFlightDate, resolveFlightTimeZone } from '@/lib/flightUtils';

interface FlightCardProps {
    flight: FlightStatus;
    lastSuccessfulUpdate?: Date | null;
    refreshError?: string | null;
}

export default function FlightCard({ flight, lastSuccessfulUpdate = null, refreshError = null }: FlightCardProps) {
    const scheduledArrival = flight.arrival.scheduledTime;
    const estimatedArrival = flight.arrival.estimatedTime;
    const delayMinutes = isValidFlightDate(scheduledArrival) && isValidFlightDate(estimatedArrival)
        ? Math.round((Date.parse(estimatedArrival) - Date.parse(scheduledArrival)) / 60000)
        : null;
    const isDelayed = delayMinutes !== null && delayMinutes > 15;
    const showDelay = delayMinutes !== null && !['Landed', 'Cancelled', 'Unknown'].includes(flight.status);
    const delayText = showDelay
        ? delayMinutes < 0
            ? 'Early'
            : delayMinutes > 15
                ? `Delayed +${Math.floor(delayMinutes / 60) > 0 ? `${Math.floor(delayMinutes / 60)}h ` : ''}${delayMinutes % 60}m`
                : 'On Time'
        : null;

    const actualArrival = flight.arrival.actualTime;
    const arrivalTime = isValidFlightDate(actualArrival)
        ? actualArrival
        : isValidFlightDate(estimatedArrival)
            ? estimatedArrival
            : isValidFlightDate(scheduledArrival)
                ? scheduledArrival
                : null;
    const arrivalTimeLabel = isValidFlightDate(actualArrival)
        ? 'Actual arrival'
        : isValidFlightDate(estimatedArrival)
            ? 'Estimated arrival'
            : 'Scheduled arrival';
    const departureTime = isValidFlightDate(flight.departure.actualTime)
        ? flight.departure.actualTime
        : isValidFlightDate(flight.departure.estimatedTime)
            ? flight.departure.estimatedTime
            : flight.departure.scheduledTime;
    const departureTimeLabel = isValidFlightDate(flight.departure.actualTime)
        ? 'Actual departure'
        : isValidFlightDate(flight.departure.estimatedTime)
            ? 'Estimated departure'
            : 'Scheduled departure';
    const progress = typeof flight.liveData.progress === 'number' && Number.isFinite(flight.liveData.progress)
        ? Math.max(0, Math.min(100, flight.liveData.progress))
        : null;
    const remainingTime = flight.liveData.remainingTime?.trim() || null;
    const flightDate = formatFlightDate(flight.flightDate);
    const positionSource = flight.dataSources.position || 'Unavailable';
    const routeSource = flight.dataSources.route || 'Unavailable';
    const scheduleSource = flight.dataSources.schedule || 'Unavailable';
    const positionAge = formatFlightAge(flight.dataQuality.positionUpdatedAt);
    const hasPosition = typeof flight.liveData.latitude === 'number' && Number.isFinite(flight.liveData.latitude)
        && flight.liveData.latitude >= -90 && flight.liveData.latitude <= 90
        && typeof flight.liveData.longitude === 'number' && Number.isFinite(flight.liveData.longitude)
        && flight.liveData.longitude >= -180 && flight.liveData.longitude <= 180;
    const positionMayBeStale = hasPosition && (
        !isValidFlightDate(flight.dataQuality.positionUpdatedAt)
        || isFlightPositionStale(flight.dataQuality.positionUpdatedAt)
    );
    const showStaleNotice = Boolean(refreshError) || positionMayBeStale;
    const requestCompletedAt = lastSuccessfulUpdate
        ? formatFlightTime(lastSuccessfulUpdate.toISOString())
        : formatFlightTime(flight.dataQuality.fetchedAt);
    const routeNote = flight.dataQuality.routeConfidence === 'callsign'
        ? 'Route is based on a callsign and may not be the current trip.'
        : flight.dataQuality.routeConfidence === 'schedule'
            ? 'Route is based on schedule data.'
            : 'Route details are unavailable.';
    const warnings = flight.dataQuality.warnings.filter(Boolean);

    return (
        <div className="glass-panel rounded-2xl p-6 md:p-8 w-full max-w-4xl mx-auto text-white shadow-2xl animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/10 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        {delayText && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-2 ${isDelayed
                                ? 'bg-red-500/20 text-red-400 border-red-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                }`}>
                                {isDelayed ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
                                {delayText}
                            </span>
                        )}
                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold border border-blue-500/30">
                            {flight.status || 'Unknown'}
                        </span>
                    </div>
                    <div className="flex items-center gap-3 min-w-0">
                        <h2 className="text-3xl font-bold tracking-tight">{flight.flightNumber}</h2>
                        <span className="text-gray-400 text-lg">•</span>
                        <p className="text-gray-400 text-lg truncate">{flight.airline || 'Unknown airline'}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-sm">{flight.aircraft.model || 'Unknown aircraft'}</p>
                        <span className="text-gray-600">•</span>
                        <p className="text-gray-500 text-sm">{flightDate}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-gray-400">
                        <span className="bg-slate-800/50 px-2 py-1 rounded">Departure: {flight.departure.timezone ? resolveFlightTimeZone(flight.departure.timezone) : 'Unavailable'}</span>
                        <span className="bg-slate-800/50 px-2 py-1 rounded">Arrival: {flight.arrival.timezone ? resolveFlightTimeZone(flight.arrival.timezone) : 'Unavailable'}</span>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 md:text-right">
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Time remaining</p>
                    <p className="text-2xl font-mono font-bold text-blue-400 min-w-[140px] md:text-right">
                        {remainingTime && remainingTime !== 'Unavailable' ? remainingTime : 'Unavailable'}
                    </p>
                    <p className="mt-2 text-xs text-gray-500">
                        {showStaleNotice
                            ? `Position may be stale. Last request succeeded ${requestCompletedAt} UTC.`
                            : `Last request succeeded ${requestCompletedAt} UTC.`}
                    </p>
                </div>
            </div>

            {showStaleNotice && (
                <div role="status" className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                    {refreshError
                        ? `Refresh failed. Showing the last successful result. ${refreshError}`
                        : `Position may be stale. Last observed ${positionAge}.`}
                </div>
            )}

            {(warnings.length > 0 || flight.dataQuality.missingFields.length > 0) && (
                <div className="mb-6 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
                    {warnings.length > 0 ? warnings.join(' ') : 'Some flight details are unavailable.'}
                </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 relative">
                <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className={`${flight.departure.code ? 'text-5xl' : 'text-2xl'} font-black mb-1 ${flight.departure.code ? 'text-white' : 'text-gray-500'}`}>
                        {flight.departure.code || 'Unavailable'}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{flight.departure.airport || 'Airport unavailable'}</p>
                    <div className="text-lg text-blue-400 font-medium mb-1">
                        {formatFlightTime(departureTime, flight.departure.timezone)}
                        <span className="block text-xs text-gray-500">{isValidFlightDate(departureTime) ? `${departureTimeLabel} · ${resolveFlightTimeZone(flight.departure.timezone)}` : 'Departure time unavailable'}</span>
                    </div>
                    <div className="mt-2 inline-block bg-white/5 px-3 py-1 rounded text-xs text-gray-300">
                        Terminal {flight.departure.terminal || 'Unavailable'} · Gate {flight.departure.gate || 'Unavailable'}
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center w-full min-w-0">
                    {progress !== null ? (
                        <>
                            <div className="w-full relative h-8 mb-3" role="img" aria-label={`Flight progress ${progress.toFixed(0)} percent`}>
                                <div className="absolute top-1/2 left-0 w-full h-[3px] bg-gray-700 rounded-full -translate-y-1/2" />
                                <div
                                    className="absolute top-1/2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full -translate-y-1/2 transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                />
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 z-10"
                                    style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                    <div className="bg-slate-900 rounded-full p-1 border border-blue-500/30">
                                        <Plane aria-hidden="true" className="w-6 h-6 text-blue-400" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                                <span className="w-2 h-2 bg-blue-400 rounded-full" />
                                <p className="text-sm font-semibold text-blue-400">{progress.toFixed(1)}% complete</p>
                            </div>
                        </>
                    ) : (
                        <p className="text-sm text-slate-500">Route progress unavailable</p>
                    )}
                    <p className="mt-3 text-xs text-slate-500 text-center">{routeNote}</p>
                </div>

                <div className="flex-1 min-w-0 text-center md:text-right">
                    <div className={`${flight.arrival.code ? 'text-5xl' : 'text-2xl'} font-black mb-1 ${flight.arrival.code ? 'text-white' : 'text-gray-500'}`}>
                        {flight.arrival.code || 'Unavailable'}
                    </div>
                    <p className="text-sm text-gray-400 mb-2">{flight.arrival.airport || 'Airport unavailable'}</p>
                    <div className={`text-lg font-medium mb-1 ${isDelayed ? 'text-red-400' : 'text-emerald-400'}`}>
                        {formatFlightTime(arrivalTime, flight.arrival.timezone)}
                        <span className="block text-xs text-gray-500">
                            {arrivalTime ? arrivalTimeLabel : 'Arrival time unavailable'}
                            {arrivalTime ? ` · ${resolveFlightTimeZone(flight.arrival.timezone)}` : ''}
                        </span>
                    </div>
                    <div className="mt-2 inline-block bg-white/5 px-3 py-1 rounded text-xs text-gray-300">
                        Terminal {flight.arrival.terminal || 'Unavailable'} · Gate {flight.arrival.gate || 'Unavailable'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                        <Clock size={16} aria-hidden="true" />
                        <span>Scheduled arrival</span>
                    </div>
                    <p className="text-lg font-semibold">{formatFlightTime(scheduledArrival, flight.arrival.timezone)}{isValidFlightDate(scheduledArrival) ? ` ${resolveFlightTimeZone(flight.arrival.timezone)}` : ""}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                        <MapPin size={16} aria-hidden="true" />
                        <span>Altitude</span>
                    </div>
                    <p className="text-lg font-semibold">{flight.aircraft.altitude === null ? 'Unavailable' : `${flight.aircraft.altitude.toLocaleString()} ft`}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                        <ArrowRight size={16} aria-hidden="true" />
                        <span>Ground speed</span>
                    </div>
                    <p className="text-lg font-semibold">{flight.aircraft.speed === null ? 'Unavailable' : `${flight.aircraft.speed} kts`}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 min-w-0">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                        <Plane size={16} aria-hidden="true" />
                        <span>Aircraft registration</span>
                    </div>
                    <p className="text-lg font-semibold truncate" title={flight.aircraft.registration || undefined}>{flight.aircraft.registration || 'Unavailable'}</p>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500" aria-label="Flight data sources">
                <span>Position: {positionSource}{positionAge !== 'Unavailable' ? ` · observed ${positionAge}` : ''}</span>
                <span>Route: {routeSource}{routeSource.toLowerCase().includes('virtual radar') && <> · <a className="underline hover:text-white" href="https://github.com/vradarserver/standing-data" target="_blank" rel="noreferrer">reference</a> · <a className="underline hover:text-white" href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0</a></>}</span>
                <span>Schedule: {scheduleSource}</span>
            </div>
        </div>
    );
}
