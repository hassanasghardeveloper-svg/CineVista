import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';

    if (!query) {
        return NextResponse.json({ results: [] });
    }

    try {
        const res = await fetch(
            `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`,
            { next: { revalidate: 300 } }
        );

        if (!res.ok) {
            throw new Error(`TMDB API error: ${res.status}`);
        }

        const data = await res.json();

        // Transform and filter results (movies, TV shows, and people/artists)
        const results = data.results
            .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv' || item.media_type === 'person')
            .map((item: any) => {
                const isPerson = item.media_type === 'person';
                const posterUrl = isPerson
                    ? (item.profile_path ? `${IMG_BASE}/w500${item.profile_path}` : null)
                    : (item.poster_path ? `${IMG_BASE}/w500${item.poster_path}` : null);
                const thumbUrl = isPerson
                    ? (item.profile_path ? `${IMG_BASE}/w200${item.profile_path}` : null)
                    : (item.poster_path ? `${IMG_BASE}/w200${item.poster_path}` : null);
                return {
                    id: item.id,
                    title: item.title || item.name,
                    name: item.title || item.name,
                    type: item.media_type,
                    year: isPerson ? (item.known_for_department || 'Actor') : (item.release_date || item.first_air_date || '').split('-')[0],
                    poster: posterUrl,
                    image_url: thumbUrl,
                    tmdb_id: item.id,
                };
            });

        return NextResponse.json({
            results,
            total_results: data.total_results,
        });
    } catch (error) {
        console.error('Search Error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
