import { NextResponse } from 'next/server';

const API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = 'https://api.watchmode.com/v1';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        // Fetch title details with sources
        const detailRes = await fetch(
            `${BASE_URL}/title/${id}/details/?apiKey=${API_KEY}&append_to_response=sources`,
            { next: { revalidate: 3600 } }
        );

        if (!detailRes.ok) {
            return NextResponse.json({ error: 'Title not found' }, { status: 404 });
        }

        const details = await detailRes.json();

        // Also fetch sources separately for more detailed info
        const sourcesRes = await fetch(
            `${BASE_URL}/title/${id}/sources/?apiKey=${API_KEY}&regions=US`,
            { next: { revalidate: 3600 } }
        );

        let sources = [];
        if (sourcesRes.ok) {
            sources = await sourcesRes.json();
        }

        return NextResponse.json({
            ...details,
            streaming_sources: sources
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch title' }, { status: 500 });
    }
}
