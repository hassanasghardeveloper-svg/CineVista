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

async function fetchTitlesList(type: string, language: string | null, limit: number, genre?: string) {
    const params = new URLSearchParams({
        apiKey: API_KEY || '',
        types: type === 'tv' ? 'tv_series' : 'movie',
        limit: String(limit),
        sort_by: 'popularity_desc',
    });
    if (language) params.append('languages', language);
    if (genre) params.append('genres', genre);

    const res = await fetch(`${BASE_URL}/list-titles/?${params}`, {
        next: { revalidate: 3600 }
    });

    if (!res.ok) {
        if (res.status === 429) throw new Error('QUOTA_EXCEEDED');
        return [];
    }
    const data = await res.json();
    return data.titles || [];
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'all';
    const type = searchParams.get('type') || 'movie';
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

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
        } else if (category === 'action') {
            allTitles = await fetchTitlesList(type, null, limit, '1');
        } else if (category === 'comedy') {
            allTitles = await fetchTitlesList(type, null, limit, '4');
        } else if (category === 'horror') {
            allTitles = await fetchTitlesList(type, null, limit, '11');
        } else if (category === 'animation') {
            allTitles = await fetchTitlesList(type, null, limit, '3');
        } else if (category === 'documentary') {
            allTitles = await fetchTitlesList(type, null, limit, '6');
        } else if (category === 'new') {
            const params = new URLSearchParams({
                apiKey: API_KEY || '',
                types: type === 'tv' ? 'tv_series' : 'movie',
                limit: String(limit),
                sort_by: 'release_date_desc',
            });
            const res = await fetch(`${BASE_URL}/list-titles/?${params}`, {
                next: { revalidate: 3600 }
            });
            if (res.ok) {
                const data = await res.json();
                allTitles = data.titles || [];
            }
        } else {
            allTitles = await fetchTitlesList(type, null, limit);
        }

        // Fetch details from Watchmode (includes posters)
        const batchSize = 5;
        const titlesWithDetails: any[] = [];

        for (let i = 0; i < allTitles.length; i += batchSize) {
            const batch = allTitles.slice(i, i + batchSize);
            const batchResults = await Promise.all(
                batch.map((title: any) => fetchTitleDetails(title.id))
            );
            titlesWithDetails.push(...batchResults.filter(Boolean));

            if (i + batchSize < allTitles.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return NextResponse.json({
            titles: titlesWithDetails,
            total: titlesWithDetails.length,
        });
    } catch (error: any) {
        console.error('API Error:', error);
        if (error.message === 'QUOTA_EXCEEDED') {
            return NextResponse.json({ error: 'Quota exceeded', code: '429' }, { status: 429 });
        }
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}
