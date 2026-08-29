import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export async function GET(
    request: Request,
    { params }: { params: { id: string; seasonNum: string } }
) {
    const id = params.id;
    const seasonNum = params.seasonNum;

    try {
        const res = await fetch(
            `${BASE_URL}/tv/${id}/season/${seasonNum}?api_key=${API_KEY}`,
            { next: { revalidate: 3600 } }
        );

        if (!res.ok) {
            return NextResponse.json({ error: 'Season not found' }, { status: 404 });
        }

        const data = await res.json();

        // Transform episodes to a clean format for our UI
        const episodes = data.episodes?.map((ep: any) => ({
            id: ep.id,
            episode_number: ep.episode_number,
            name: ep.name || `Episode ${ep.episode_number}`,
            overview: ep.overview || 'No description available.',
            air_date: ep.air_date,
            still_path: ep.still_path ? `${IMG_BASE}/w300${ep.still_path}` : null,
            vote_average: ep.vote_average || 0,
        })) || [];

        return NextResponse.json({
            id: data.id,
            name: data.name,
            overview: data.overview,
            season_number: data.season_number,
            poster_path: data.poster_path ? `${IMG_BASE}/w300${data.poster_path}` : null,
            episodes,
        });
    } catch (error) {
        console.error('TV Season API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch season details' }, { status: 500 });
    }
}
