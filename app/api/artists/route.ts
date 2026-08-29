import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const category = searchParams.get('category') || 'popular';

    try {
        let endpoint = '';
        if (category === 'popular') {
            endpoint = `${BASE_URL}/person/popular?api_key=${API_KEY}&page=${page}`;
        } else if (category === 'trending') {
            endpoint = `${BASE_URL}/trending/person/week?api_key=${API_KEY}&page=${page}`;
        } else {
            endpoint = `${BASE_URL}/person/popular?api_key=${API_KEY}&page=${page}`;
        }

        const res = await fetch(endpoint, { next: { revalidate: 3600 } });
        if (!res.ok) throw new Error('Failed to fetch people');

        const data = await res.json();

        const people = data.results?.map((p: any) => ({
            id: p.id,
            name: p.name,
            known_for_department: p.known_for_department || 'Acting',
            profile_path: p.profile_path ? `${IMG_BASE}/w342${p.profile_path}` : null,
            popularity: p.popularity || 0,
            known_for: p.known_for?.slice(0, 2).map((item: any) => ({
                id: item.id,
                title: item.title || item.name,
                media_type: item.media_type,
            })) || [],
        })) || [];

        return NextResponse.json({ people, total_pages: data.total_pages });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch artists' }, { status: 500 });
    }
}
