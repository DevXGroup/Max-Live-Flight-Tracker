// Flight tracking utility functions
export function calculateRemainingTime(arrivalTime: string): string {
    const now = new Date();
    const arrival = new Date(arrivalTime);
    const diffMs = arrival.getTime() - now.getTime();

    if (diffMs <= 0) return 'Arrived';

    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}
