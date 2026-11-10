import { NextResponse } from 'next/server';
import { FlightLookupError } from '@/lib/flight-types';
import { getFlightDataServer } from '@/lib/flight-server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const data = await getFlightDataServer('WN1918');
        return NextResponse.json(data, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (error) {
        if (error instanceof FlightLookupError) {
            const status = error.code === 'INVALID_FLIGHT' ? 400 : error.code === 'NOT_OBSERVED' ? 404 : 503;
            return NextResponse.json({ error: error.message, code: error.code }, { status, headers: { 'Cache-Control': 'private, no-store' } });
        }
        return NextResponse.json({ error: 'Flight lookup failed. Please try again.' }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } });
    }
}
