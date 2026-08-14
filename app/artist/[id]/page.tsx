import type { Metadata } from 'next';
import ArtistClient from './ArtistClient';
import Link from 'next/link';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

interface Props {
    params: { id: string };
}

async function fetchPersonDetails(id: string) {
    try {
        const [detailRes, imagesRes] = await Promise.all([
            fetch(
                `${BASE_URL}/person/${id}?api_key=${API_KEY}&append_to_response=combined_credits,external_ids`,
                { next: { revalidate: 3600 } }
            ),
            fetch(
                `${BASE_URL}/person/${id}/images?api_key=${API_KEY}`,
                { next: { revalidate: 3600 } }
            ),
        ]);

        if (!detailRes.ok) return null;

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
                character: item.character || '',
                poster: item.poster_path ? `${IMG_BASE}/w342${item.poster_path}` : null,
                backdrop: item.backdrop_path ? `${IMG_BASE}/w780${item.backdrop_path}` : null,
                year: (item.release_date || item.first_air_date || '').split('-')[0] || '',
                user_rating: item.vote_average || 0,
                vote_count: item.vote_count || 0,
            }));

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
                year: (item.release_date || item.first_air_date || '').split('-')[0] || '',
                user_rating: item.vote_average || 0,
            }));

        return {
            id: details.id,
            name: details.name,
            biography: details.biography || '',
            birthday: details.birthday || null,
            deathday: details.deathday || null,
            place_of_birth: details.place_of_birth || null,
            gender: details.gender,
            known_for_department: details.known_for_department || 'Acting',
            popularity: details.popularity || 0,
            profile_path: details.profile_path ? `${IMG_BASE}/w500${details.profile_path}` : null,
            profile_path_large: details.profile_path ? `${IMG_BASE}/original${details.profile_path}` : null,
            imdb_id: details.external_ids?.imdb_id || null,
            instagram_id: details.external_ids?.instagram_id || null,
            twitter_id: details.external_ids?.twitter_id || null,
            images: images.profiles?.slice(0, 12).map((img: any) => ({
                file_path: `${IMG_BASE}/w342${img.file_path}`,
                aspect_ratio: img.aspect_ratio,
            })) || [],
            cast_credits: sortedCast,
            crew_credits: notableCrew,
        };
    } catch (e) {
        console.error('Error fetching artist details:', e);
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const person = await fetchPersonDetails(params.id);

    if (!person) {
        return {
            title: 'Artist Profile - CineVault',
            description: 'Learn more about cast & crew members of your favorite shows.',
        };
    }

    const titleText = `${person.name} - Filmography, Biography & Movies - CineVault`;
    const bioText = person.biography
        ? `${person.biography.slice(0, 150)}... Read ${person.name}'s full biography, age, filmography, pictures and free streaming options on CineVault.`
        : `Explore biography, pictures, full filmography and credits list of ${person.name} on CineVault.`;

    const images = [];
    if (person.profile_path) {
        images.push({ url: person.profile_path, width: 500, height: 750, alt: person.name });
    }

    return {
        title: titleText,
        description: bioText,
        alternates: {
            canonical: `/artist/${person.id}`,
        },
        openGraph: {
            title: titleText,
            description: bioText,
            url: `https://cinevistas.vercel.app/artist/${person.id}`,
            siteName: 'CineVault',
            type: 'profile',
            images,
        },
        twitter: {
            card: 'summary',
            title: titleText,
            description: bioText,
            images: images.map(img => img.url),
        }
    };
}

export default async function ArtistPage({ params }: Props) {
    const person = await fetchPersonDetails(params.id);

    if (!person) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/40 text-xl mb-4">Artist profile not found</p>
                    <Link href="/" className="text-accent-orange hover:underline">← Back to Home</Link>
                </div>
            </main>
        );
    }

    // Injected structured data (Person schema)
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        'name': person.name,
        'description': person.biography,
        'image': person.profile_path_large || person.profile_path,
        'birthDate': person.birthday,
        'deathDate': person.deathday,
        'birthPlace': person.place_of_birth,
        'jobTitle': person.known_for_department,
        'sameAs': [
            person.imdb_id ? `https://www.imdb.com/name/${person.imdb_id}` : null,
            person.instagram_id ? `https://www.instagram.com/${person.instagram_id}` : null,
            person.twitter_id ? `https://twitter.com/${person.twitter_id}` : null
        ].filter(Boolean)
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <ArtistClient key={person.id} initialPerson={person as any} />
        </>
    );
}
