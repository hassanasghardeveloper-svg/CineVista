import { NextResponse } from 'next/server';

const API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = 'https://api.watchmode.com/v1';

async function fetchTitleDetails(id: number) {
    try {
        const res = await fetch(
            `${BASE_URL}/title/${id}/details/?apiKey=${API_KEY}`,
            { next: { revalidate: 86400 } }
        );
        if (res.ok) return res.json();
        return null;
    } catch {
        return null;
    }
}

async function fetchTitlesList(type: string, language: string | null, limit: number) {
    const params = new URLSearchParams({
        apiKey: API_KEY || '',
        types: type === 'tv' ? 'tv_series' : 'movie',
        limit: String(limit),
        sort_by: 'popularity_desc',
    });
    if (language) params.append('languages', language);

    const res = await fetch(`${BASE_URL}/list-titles/?${params}`, {
        next: { revalidate: 3600 }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.titles || [];
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all'; // all, indian, pakistani, hollywood
    const type = searchParams.get('type') || 'movie';
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        let allTitles: any[] = [];

        if (category === 'trending') {
            allTitles = await fetchTitlesList(type, null, limit);
        } else if (category === 'pakistani') {
            allTitles = await fetchTitlesList(type, 'ur', limit);
        } else if (category === 'indian') {
            allTitles = await fetchTitlesList(type, 'hi', limit);
        } else if (category === 'hollywood') {
            allTitles = await fetchTitlesList(type, 'en', limit);
        } else if (category === 'new') {
            // Fetch and sort by year/release date
            const params = new URLSearchParams({
                apiKey: API_KEY || '',
                types: type === 'tv' ? 'tv_series' : 'movie',
                limit: String(limit),
                sort_by: 'release_date_desc',
            });
            const res = await fetch(`${BASE_URL}/list-titles/?${params}`);
            const data = await res.json();
            allTitles = data.titles || [];
        } else {
            // Default to trending/all
            allTitles = await fetchTitlesList(type, null, limit);
        }

        // Fetch details for all titles (in batches to avoid rate limiting)
        const batchSize = 30;
        const titlesWithDetails: any[] = [];

        for (let i = 0; i < allTitles.length; i += batchSize) {
            const batch = allTitles.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map((title: any) => fetchTitleDetails(title.id))
            );
            titlesWithDetails.push(...batchResults.filter(Boolean));

            // Small delay between batches to avoid rate limiting
            if (i + batchSize < allTitles.length) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
        }

        return NextResponse.json({
            titles: titlesWithDetails,
            total: titlesWithDetails.length,
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}
