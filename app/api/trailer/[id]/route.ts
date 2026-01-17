import { NextResponse } from 'next/server';

const TMDB_API_KEY = '2a4bd64ad04540668cb10286c3fd3d5f'; // Free public key for demo
const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const { searchParams } = new URL(request.url);
    const tmdbId = searchParams.get('tmdb_id');
    const type = searchParams.get('type') || 'movie';

    if (!tmdbId) {
        return NextResponse.json({ error: 'TMDB ID required' }, { status: 400 });
    }

    try {
        // Fetch videos (trailers) from TMDB
        const mediaType = type === 'tv_series' ? 'tv' : 'movie';
        const res = await fetch(
            `${TMDB_BASE}/${mediaType}/${tmdbId}/videos?api_key=${TMDB_API_KEY}`,
            { next: { revalidate: 86400 } }
        );

        if (!res.ok) {
            return NextResponse.json({ videos: [] });
        }

        const data = await res.json();

        // Filter for YouTube trailers
        const trailers = data.results?.filter((v: any) =>
            v.site === 'YouTube' &&
            (v.type === 'Trailer' || v.type === 'Teaser')
        ) || [];

        return NextResponse.json({
            videos: trailers.map((v: any) => ({
                key: v.key,
                name: v.name,
                type: v.type,
                url: `https://www.youtube.com/embed/${v.key}`,
            }))
        });
    } catch (error) {
        console.error('TMDB Error:', error);
        return NextResponse.json({ videos: [] });
    }
}
