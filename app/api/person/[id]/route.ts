import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    try {
        // Fetch person details with credits and images
        const [detailRes, creditsRes, imagesRes] = await Promise.all([
            fetch(
                `${BASE_URL}/person/${id}?api_key=${API_KEY}&append_to_response=combined_credits,external_ids`,
                { next: { revalidate: 3600 } }
            ),
            fetch(
                `${BASE_URL}/person/${id}/combined_credits?api_key=${API_KEY}`,
                { next: { revalidate: 3600 } }
            ),
            fetch(
                `${BASE_URL}/person/${id}/images?api_key=${API_KEY}`,
                { next: { revalidate: 3600 } }
            ),
        ]);

        if (!detailRes.ok) {
            return NextResponse.json({ error: 'Person not found' }, { status: 404 });
        }

        const details = await detailRes.json();
        const images = imagesRes.ok ? await imagesRes.json() : { profiles: [] };

        // Sort credits by popularity
        const castCredits = details.combined_credits?.cast || [];
        const crewCredits = details.combined_credits?.crew || [];

        const sortedCast = castCredits
            .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))
            .slice(0, 24)
            .map((item: any) => ({
                id: item.id,
                title: item.title || item.name,
                media_type: item.media_type,
                character: item.character,
                poster: item.poster_path ? `${IMG_BASE}/w342${item.poster_path}` : null,
                backdrop: item.backdrop_path ? `${IMG_BASE}/w780${item.backdrop_path}` : null,
                year: (item.release_date || item.first_air_date || '').split('-')[0],
                user_rating: item.vote_average || 0,
                vote_count: item.vote_count || 0,
            }));

        // Notable crew credits (director, writer, etc.)
        const notableCrew = crewCredits
            .filter((c: any) => ['Director', 'Writer', 'Producer', 'Screenplay'].includes(c.job))
            .sort((a: any, b: any) => (b.vote_count || 0) - (a.vote_count || 0))
            .slice(0, 12)
            .map((item: any) => ({
                id: item.id,
                title: item.title || item.name,
                media_type: item.media_type,
                job: item.job,
                poster: item.poster_path ? `${IMG_BASE}/w342${item.poster_path}` : null,
                year: (item.release_date || item.first_air_date || '').split('-')[0],
                user_rating: item.vote_average || 0,
            }));

        const transformed = {
            id: details.id,
            name: details.name,
            biography: details.biography || '',
            birthday: details.birthday || null,
            deathday: details.deathday || null,
            place_of_birth: details.place_of_birth || null,
            gender: details.gender,
            known_for_department: details.known_for_department || 'Acting',
            popularity: details.popularity || 0,
            profile_path: details.profile_path
                ? `${IMG_BASE}/w500${details.profile_path}`
                : null,
            profile_path_large: details.profile_path
                ? `${IMG_BASE}/original${details.profile_path}`
                : null,
            imdb_id: details.external_ids?.imdb_id || null,
            instagram_id: details.external_ids?.instagram_id || null,
            twitter_id: details.external_ids?.twitter_id || null,
            // Gallery images
            images: images.profiles?.slice(0, 12).map((img: any) => ({
                file_path: `${IMG_BASE}/w342${img.file_path}`,
                aspect_ratio: img.aspect_ratio,
            })) || [],
            // Known for credits
            cast_credits: sortedCast,
            crew_credits: notableCrew,
        };

        return NextResponse.json(transformed);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch person' }, { status: 500 });
    }
}
