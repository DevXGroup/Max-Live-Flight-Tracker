// Flight tracking utility functions
export function isValidFlightDate(value: string | null | undefined): value is string {
    return typeof value === 'string' && value.trim() !== '' && Number.isFinite(new Date(value).getTime());
}

export function resolveFlightTimeZone(value: string | null | undefined): string {
    if (!value || value.trim() === '' || value.toLowerCase() === 'local') return 'UTC';
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date(0));
        return value;
    } catch {
        return 'UTC';
    }
}

export function formatFlightTime(value: string | null | undefined, timeZone?: string | null): string {
    if (!isValidFlightDate(value)) return 'Unavailable';
    return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone: resolveFlightTimeZone(timeZone),
    }).format(new Date(value));
}

export function formatFlightDate(value: string | null | undefined): string {
    if (!isValidFlightDate(value)) return 'Unavailable';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`));
}

export function formatFlightAge(value: string | null | undefined, now = Date.now()): string {
    if (!isValidFlightDate(value)) return 'Unavailable';
    const ageMs = Math.max(0, now - Date.parse(value));
    if (ageMs < 60_000) return `${Math.floor(ageMs / 1000)}s ago`;
    const minutes = Math.floor(ageMs / 60_000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m ago` : `${hours}h ago`;
}

export function isFlightPositionStale(value: string | null | undefined, now = Date.now()): boolean {
    return isValidFlightDate(value) && now - Date.parse(value) > 120_000;
}

export function calculateRemainingTime(arrivalTime: string | null | undefined): string {
    if (typeof arrivalTime !== 'string' || arrivalTime.trim() === '') return 'Unavailable';

    const arrival = new Date(arrivalTime);
    if (!Number.isFinite(arrival.getTime())) return 'Unavailable';

    const diffMs = arrival.getTime() - Date.now();
    if (diffMs <= 0) return 'Unavailable';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
