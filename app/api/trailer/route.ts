import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type') || 'movie';

    if (!id) return NextResponse.json({ key: null });

    try {
        const mediaType = type === 'tv' ? 'tv' : 'movie';
        const res = await fetch(
            `${BASE_URL}/${mediaType}/${id}/videos?api_key=${API_KEY}`,
            { next: { revalidate: 86400 } } // cache 24h
        );
        if (!res.ok) return NextResponse.json({ key: null });

        const data = await res.json();
        const trailer = data.results?.find(
            (v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
        );

        return NextResponse.json({ key: trailer?.key || null });
    } catch {
        return NextResponse.json({ key: null });
    }
}
