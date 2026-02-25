import { NextRequest, NextResponse } from 'next/server';
import { getFlightData } from '@/lib/api';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const flightNumber = searchParams.get('flightNumber');

    if (!flightNumber) {
        return NextResponse.json({ error: 'Flight number is required' }, { status: 400 });
    }

    try {
        console.log(`🌐 [API Route] Incoming request for flight: ${flightNumber}`);
        const data = await getFlightData(flightNumber);

        if (!data) {
            console.log(`ℹ️ [API Route] No data found for flight: ${flightNumber}`);
            // Return 200 with an error object instead of 404 to avoid scary red console errors
            // The client will handle the null data/error message
            return NextResponse.json({
                error: `Flight ${flightNumber} not found or currently inactive.`,
                notFound: true
            }, { status: 200 });
        }

        console.log(`✅ [API Route] Returning data for flight: ${flightNumber}`);
        return NextResponse.json(data);
    } catch (error) {
        console.error('[API Route] Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
