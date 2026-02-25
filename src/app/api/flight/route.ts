import { NextRequest, NextResponse } from 'next/server';
import { getFlightData } from '@/lib/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const flightNumber = searchParams.get('flightNumber');

    if (!flightNumber) {
        return NextResponse.json({ error: 'Flight number is required' }, { status: 400 });
    }

    try {
        console.log(`🌐 [API Route] Fetching data for: ${flightNumber}`);
        const data = await getFlightData(flightNumber);

        if (!data) {
            return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('[API Route] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
