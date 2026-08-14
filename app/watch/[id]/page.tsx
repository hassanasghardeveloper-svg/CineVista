import type { Metadata } from 'next';
import WatchClient from './WatchClient';
import Link from 'next/link';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

interface Props {
    params: { id: string };
    searchParams: { type?: string };
}

async function fetchTitleDetails(id: string, type: string) {
    try {
        const mediaType = type === 'tv' || type === 'tv_series' ? 'tv' : 'movie';
        const detailRes = await fetch(
            `${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,recommendations,watch/providers`,
            { next: { revalidate: 3600 } }
        );

        if (!detailRes.ok) return null;
        const details = await detailRes.json();

        // Extract directors from crew
        const directors = details.credits?.crew
            ?.filter((c: any) => c.job === 'Director')
            .map((d: any) => d.name) || [];

        return {
            id: details.id,
            title: details.title || details.name,
            original_title: details.original_title || details.original_name,
            plot_overview: details.overview,
            type: mediaType === 'tv' ? 'tv_series' : 'movie',
            runtime_minutes: details.runtime || (details.episode_run_time?.[0] || 0),
            year: parseInt((details.release_date || details.first_air_date || '').split('-')[0]) || 0,
            release_date: details.release_date || details.first_air_date || '',
            imdb_id: details.imdb_id || null,
            tmdb_id: details.id,
            genre_names: details.genres?.map((g: any) => g.name) || [],
            user_rating: details.vote_average || 0,
            critic_score: details.vote_average ? Math.round(details.vote_average * 10) : 0,
            vote_count: details.vote_count || 0,
            poster: details.poster_path ? `${IMG_BASE}/w500${details.poster_path}` : '',
            backdrop: details.backdrop_path ? `${IMG_BASE}/w1280${details.backdrop_path}` : '',
            number_of_seasons: details.number_of_seasons || 0,
            number_of_episodes: details.number_of_episodes || 0,
            videos: details.videos?.results || [],
            directors,
            cast: details.credits?.cast?.slice(0, 12).map((c: any) => ({
                id: c.id,
                name: c.name,
                character: c.character,
                profile_path: c.profile_path ? `${IMG_BASE}/w185${c.profile_path}` : null,
            })) || [],
            recommendations: details.recommendations?.results?.slice(0, 12).map((item: any) => ({
                id: item.id,
                title: item.title || item.name,
                overview: item.overview,
                poster: item.poster_path ? `${IMG_BASE}/w500${item.poster_path}` : null,
                backdrop: item.backdrop_path ? `${IMG_BASE}/w1280${item.backdrop_path}` : null,
                year: (item.release_date || item.first_air_date || '').split('-')[0],
                user_rating: item.vote_average,
                type: item.media_type || (mediaType === 'tv' ? 'tv' : 'movie'),
            })) || [],
            streaming_sources: details['watch/providers']?.results?.US?.flatrate || [],
        };
    } catch (e) {
        console.error('Error fetching details in WatchPage:', e);
        return null;
    }
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const type = searchParams.type || 'movie';
    const titleDetails = await fetchTitleDetails(params.id, type);

    if (!titleDetails) {
        return {
            title: 'Stream Content - CineVault',
            description: 'Watch the latest movies and TV series online for free.',
        };
    }

    const titleText = titleDetails.title;
    const yearText = titleDetails.year ? `(${titleDetails.year})` : '';
    const mediaTypeText = titleDetails.type === 'tv_series' ? 'TV Series' : 'Movie';
    
    const pageTitle = `Watch ${titleText} ${yearText} Free Online - CineVault`;
    const pageDesc = titleDetails.plot_overview 
        ? `${titleDetails.plot_overview.slice(0, 150)}... Watch ${titleText} ${mediaTypeText} online for free in HD quality with multiple streaming servers.`
        : `Watch ${titleText} ${mediaTypeText} online for free on CineVault. Stream with high quality fallback players.`;

    const images = [];
    if (titleDetails.backdrop) {
        images.push({ url: titleDetails.backdrop, width: 1280, height: 720, alt: titleText });
    } else if (titleDetails.poster) {
        images.push({ url: titleDetails.poster, width: 500, height: 750, alt: titleText });
    }

    return {
        title: pageTitle,
        description: pageDesc,
        alternates: {
            canonical: `/watch/${titleDetails.id}?type=${type === 'tv' ? 'tv' : 'movie'}`,
        },
        openGraph: {
            title: pageTitle,
            description: pageDesc,
            url: `https://cinevistas.vercel.app/watch/${titleDetails.id}?type=${type === 'tv' ? 'tv' : 'movie'}`,
            siteName: 'CineVault',
            type: 'video.movie',
            images,
            actors: titleDetails.cast?.slice(0, 5).map((c: any) => c.name) as any,
            directors: titleDetails.directors as any,
            duration: titleDetails.runtime_minutes ? titleDetails.runtime_minutes * 60 : undefined,
            releaseDate: titleDetails.release_date || undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDesc,
            images: images.map(img => img.url),
        }
    };
}

export default async function WatchPage({ params, searchParams }: Props) {
    const type = searchParams.type || 'movie';
    const titleDetails = await fetchTitleDetails(params.id, type);

    if (!titleDetails) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/40 text-xl mb-4">Content not found</p>
                    <Link href="/" className="text-accent-orange hover:underline">← Back to Home</Link>
                </div>
            </main>
        );
    }

    // Process trailers on the server
    const trailers = (titleDetails.videos || [])
        .filter((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
        .map((v: any) => ({
            key: v.key,
            name: v.name,
            type: v.type,
            url: `https://www.youtube.com/embed/${v.key}`,
        })) || [];

    // Inject structured data
    const schema = titleDetails.type === 'tv_series' ? {
        '@context': 'https://schema.org',
        '@type': 'TVSeries',
        'name': titleDetails.title,
        'description': titleDetails.plot_overview,
        'image': titleDetails.poster || titleDetails.backdrop,
        'dateCreated': titleDetails.release_date,
        'genre': titleDetails.genre_names,
        'numberOfSeasons': titleDetails.number_of_seasons,
        'numberOfEpisodes': titleDetails.number_of_episodes,
        'actor': titleDetails.cast?.slice(0, 8).map((c: any) => ({
            '@type': 'Person',
            'name': c.name
        })),
        'aggregateRating': titleDetails.vote_count > 0 ? {
            '@type': 'AggregateRating',
            'ratingValue': titleDetails.user_rating,
            'bestRating': '10',
            'ratingCount': titleDetails.vote_count
        } : undefined,
        'potentialAction': {
            '@type': 'WatchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `https://cinevistas.vercel.app/watch/${titleDetails.id}?type=tv`
            },
            'actionAccessibilityRequirement': {
                '@type': 'ActionAccessSpecification',
                'category': 'free',
                'availabilityStarts': titleDetails.release_date
            }
        }
    } : {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        'name': titleDetails.title,
        'description': titleDetails.plot_overview,
        'image': titleDetails.poster || titleDetails.backdrop,
        'dateCreated': titleDetails.release_date,
        'genre': titleDetails.genre_names,
        'duration': titleDetails.runtime_minutes ? `PT${titleDetails.runtime_minutes}M` : undefined,
        'director': titleDetails.directors?.map((name: string) => ({
            '@type': 'Person',
            'name': name
        })),
        'actor': titleDetails.cast?.slice(0, 8).map((c: any) => ({
            '@type': 'Person',
            'name': c.name
        })),
        'aggregateRating': titleDetails.vote_count > 0 ? {
            '@type': 'AggregateRating',
            'ratingValue': titleDetails.user_rating,
            'bestRating': '10',
            'ratingCount': titleDetails.vote_count
        } : undefined,
        'potentialAction': {
            '@type': 'WatchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `https://cinevistas.vercel.app/watch/${titleDetails.id}?type=movie`
            },
            'actionAccessibilityRequirement': {
                '@type': 'ActionAccessSpecification',
                'category': 'free',
                'availabilityStarts': titleDetails.release_date
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <WatchClient 
                key={titleDetails.id} 
                initialTitle={titleDetails as any} 
                initialTrailers={trailers} 
            />
        </>
    );
}
