import { FlightStatus } from "@/lib/api";
import { useEffect, useState } from "react";
import { Plane, Clock, MapPin, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";
import { format, differenceInMinutes } from "date-fns";
import { CutePlane } from "./icons/CutePlane";

interface FlightCardProps {
    flight: FlightStatus;
}

export default function FlightCard({ flight }: FlightCardProps) {
    const scheduledArrival = new Date(flight.arrival.scheduledTime);
    const estimatedArrival = new Date(flight.arrival.estimatedTime);

    // Calculate delay in minutes
    const delayMinutes = differenceInMinutes(estimatedArrival, scheduledArrival);
    const isDelayed = delayMinutes > 15; // Consider delayed if > 15 mins
    const isOnTime = delayMinutes <= 15; // Industry standard: within 15 mins is "On Time"

    // Format delay string
    const getDelayText = () => {
        if (flight.liveData.remainingTime === 'Live Tracking') return null;
        if (delayMinutes < 0) return "Early";
        if (isOnTime) return "On Time";

        const hours = Math.floor(delayMinutes / 60);
        const mins = delayMinutes % 60;
        return `Delayed +${hours > 0 ? `${hours}h ` : ''}${mins}m`;
    };

    const delayText = getDelayText();

    return (
        <div className="glass-panel rounded-2xl p-6 md:p-8 w-full max-w-4xl mx-auto text-white shadow-2xl animate-fade-in">
            {/* Header */}
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
                            {flight.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold tracking-tight">{flight.flightNumber}</h2>
                        <span className="text-gray-400 text-lg">•</span>
                        <p className="text-gray-400 text-lg">{flight.airline}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-sm">{flight.aircraft.model}</p>
                        <span className="text-gray-600">•</span>
                        <p className="text-gray-500 text-sm">{(() => {
                            const [y, m, d] = flight.flightDate.split('-').map(Number);
                            return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        })()}</p>
                    </div>
                    {/* Timezone and Update Info */}
                    <div className="flex items-center gap-2 mt-2">
                        <div className="text-xs text-gray-500 bg-slate-800/50 px-2 py-1 rounded">
                            <span className="text-gray-400">Departure:</span> {flight.departure.timezone || 'Local Time'}
                        </div>
                        <span className="text-gray-600">•</span>
                        <div className="text-xs text-gray-500 bg-slate-800/50 px-2 py-1 rounded">
                            <span className="text-gray-400">Arrival:</span> {flight.arrival.timezone || 'Local Time'}
                        </div>
                    </div>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                    <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Time Remaining</p>
                    {flight.liveData.remainingTime === 'Live Tracking' ? (
                        <p className="text-2xl font-mono font-bold text-blue-400 min-w-[140px] text-right">Live Tracking</p>
                    ) : (
                        <p className="text-2xl font-mono font-bold text-blue-400 min-w-[140px] text-right">{flight.liveData.remainingTime}</p>
                    )}
                    {/* Auto-refresh indicator */}
                    <div className="mt-2 text-xs text-gray-500 flex items-center justify-end gap-1">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span>Auto-updates every 30s</span>
                    </div>
                </div>
            </div>

            {/* Route Info */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 relative">
                {/* Departure */}
                <div className="flex-1 text-center md:text-left">
                    <div className={`text-5xl font-black mb-1 ${flight.departure.code === '---' ? 'text-gray-600' : 'text-white'}`}>{flight.departure.code}</div>
                    <p className="text-sm text-gray-400 mb-2">{flight.departure.airport}</p>
                    <div className="text-lg text-blue-400 font-medium mb-1">
                        {flight.departure.actualTime ? format(new Date(flight.departure.actualTime), 'HH:mm') : format(new Date(flight.departure.scheduledTime), 'HH:mm')}
                        <span className="text-xs text-gray-500 ml-1">{flight.departure.timezone ? flight.departure.timezone.split('/').pop()?.replace('_', ' ') : ''}</span>
                    </div>
                    <div className="mt-2 inline-block bg-white/5 px-3 py-1 rounded text-xs text-gray-300">
                        Term {flight.departure.terminal} • Gate {flight.departure.gate}
                    </div>
                </div>

                {/* Visual Route Line */}
                <div className="flex-1 flex flex-col items-center w-full">
                    <div className="w-full relative h-8 mb-3">
                        {/* Track */}
                        <div className="absolute top-1/2 left-0 w-full h-[3px] bg-gray-700 rounded-full -translate-y-1/2" />

                        {/* Progress Fill */}
                        <div
                            className="absolute top-1/2 left-0 h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 shadow-[0_0_12px_rgba(59,130,246,0.6)] rounded-full -translate-y-1/2 transition-all duration-1000"
                            style={{ width: `${flight.liveData.progress}%` }}
                        />

                        {/* Plane Icon */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-1000 z-10"
                            style={{ left: `${flight.liveData.progress}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div className="bg-slate-900 rounded-full p-1 border border-blue-500/30">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] rotate-90"
                                >
                                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <p className="text-sm font-semibold text-blue-400">{flight.liveData.progress.toFixed(1)}% Complete</p>
                    </div>
                </div>

                {/* Arrival */}
                <div className="flex-1 text-center md:text-right">
                    <div className={`text-5xl font-black mb-1 ${flight.arrival.code === '---' ? 'text-gray-600' : 'text-white'}`}>{flight.arrival.code}</div>
                    <p className="text-sm text-gray-400 mb-2">{flight.arrival.airport}</p>
                    <div className={`text-lg font-medium mb-1 ${isDelayed ? 'text-red-400' : 'text-emerald-400'}`}>
                        {format(new Date(flight.arrival.estimatedTime), 'HH:mm')}
                        <span className="text-xs text-gray-500 ml-1">{flight.arrival.timezone ? flight.arrival.timezone.split('/').pop()?.replace('_', ' ') : ''}</span>
                    </div>
                    <div className="mt-2 inline-block bg-white/5 px-3 py-1 rounded text-xs text-gray-300">
                        Term {flight.arrival.terminal} • Gate {flight.arrival.gate}
                    </div>
                </div>
            </div>

            {/* Flight Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                        <Clock size={16} />
                        <span>Scheduled Arrival</span>
                    </div>
                    <p className="text-lg font-semibold">{format(new Date(flight.arrival.scheduledTime), 'HH:mm')}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                        <MapPin size={16} />
                        <span>Altitude</span>
                    </div>
                    <p className="text-lg font-semibold">{flight.aircraft.altitude.toLocaleString()} ft</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                        <ArrowRight size={16} />
                        <span>Ground Speed</span>
                    </div>
                    <p className="text-lg font-semibold">{flight.aircraft.speed} kts</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-2 text-gray-400 mb-1 text-sm">
                        <Plane size={16} />
                        <span>Aircraft</span>
                    </div>
                    <p className="text-lg font-semibold truncate" title={flight.aircraft.registration}>{flight.aircraft.registration}</p>
                </div>
            </div>
        </div>
    );
}

function TimeRemaining({ targetDate }: { targetDate: string }) {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime();
            const target = new Date(targetDate).getTime();
            const diff = target - now;

            if (diff <= 0) {
                setTimeLeft('Arrived');
                return;
            }

            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            if (hours > 0) {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            } else {
                setTimeLeft(`${minutes}m ${seconds}s`);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    return (
        <p className="text-2xl font-mono font-bold text-emerald-400 min-w-[140px] text-right">
            {timeLeft || '--'}
        </p>
    );
}
