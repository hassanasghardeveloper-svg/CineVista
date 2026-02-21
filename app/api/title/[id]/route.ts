import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';

    try {
        const mediaType = type === 'tv' ? 'tv' : 'movie';

        // Fetch title details with videos and credits
        const detailRes = await fetch(
            `${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,watch/providers`,
            { next: { revalidate: 3600 } }
        );

        if (!detailRes.ok) {
            return NextResponse.json({ error: 'Title not found' }, { status: 404 });
        }

        const details = await detailRes.json();

        // Transform to our format
        const transformed = {
            id: details.id,
            title: details.title || details.name,
            original_title: details.original_title || details.original_name,
            plot_overview: details.overview,
            type: mediaType === 'tv' ? 'tv_series' : 'movie',
            runtime_minutes: details.runtime || (details.episode_run_time?.[0] || 0),
            year: (details.release_date || details.first_air_date || '').split('-')[0],
            release_date: details.release_date || details.first_air_date,
            imdb_id: details.imdb_id || null,
            tmdb_id: details.id,
            genre_names: details.genres?.map((g: any) => g.name) || [],
            user_rating: details.vote_average,
            vote_count: details.vote_count,
            poster: details.poster_path ? `${IMG_BASE}/w500${details.poster_path}` : null,
            backdrop: details.backdrop_path ? `${IMG_BASE}/w1280${details.backdrop_path}` : null,
            tagline: details.tagline,
            status: details.status,
            budget: details.budget,
            revenue: details.revenue,
            // TV specific
            number_of_seasons: details.number_of_seasons,
            number_of_episodes: details.number_of_episodes,
            // Videos/Trailers
            videos: details.videos?.results || [],
            // Cast
            cast: details.credits?.cast?.slice(0, 10) || [],
            // Streaming sources (from watch providers)
            streaming_sources: details['watch/providers']?.results?.US?.flatrate || [],
        };

        return NextResponse.json(transformed);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch title' }, { status: 500 });
    }
}
