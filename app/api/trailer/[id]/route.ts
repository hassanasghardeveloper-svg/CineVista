import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'movie';

    try {
        const mediaType = type === 'tv' || type === 'tv_series' ? 'tv' : 'movie';
        const res = await fetch(
            `${BASE_URL}/${mediaType}/${id}/videos?api_key=${API_KEY}`,
            { next: { revalidate: 86400 } }
        );

        if (!res.ok) {
            return NextResponse.json({ videos: [] });
        }

        const data = await res.json();

        // Filter for YouTube trailers and teasers
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
