import type { Metadata } from 'next';
import HomeClient from './HomeClient';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export interface Movie {
    id: string;
    title: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    releaseDate: string;
    rating: number;
    type: string;
    genres: string[];
}

const POSTER_PLACEHOLDER = '/images/poster-placeholder.png';
const BACKDROP_PLACEHOLDER = '/images/backdrop-placeholder.png';

function transformMovie(apiMovie: any, typeOverride?: string): Movie {
    return {
        id: String(apiMovie.id),
        title: apiMovie.title || apiMovie.name || 'Unknown Title',
        overview: apiMovie.overview || 'No description available.',
        posterPath: apiMovie.poster_path ? `${IMG_BASE}/w500${apiMovie.poster_path}` : POSTER_PLACEHOLDER,
        backdropPath: apiMovie.backdrop_path ? `${IMG_BASE}/w1280${apiMovie.backdrop_path}` : BACKDROP_PLACEHOLDER,
        releaseDate: apiMovie.release_date || apiMovie.first_air_date || apiMovie.year?.toString() || '',
        rating: apiMovie.vote_average || 0,
        type: typeOverride || apiMovie.media_type || 'movie',
        genres: apiMovie.genre_names || [],
    };
}

async function fetchCategory(url: string, typeOverride?: string): Promise<Movie[]> {
    try {
        if (!API_KEY) return [];
        const res = await fetch(url, { next: { revalidate: 3600 } });
        if (!res.ok) return [];
        const data = await res.json();
        return (data.results || []).map((item: any) => transformMovie(item, typeOverride));
    } catch (e) {
        console.error(`Error fetching from ${url}:`, e);
        return [];
    }
}

export const metadata: Metadata = {
    title: 'CineVault - Stream Movies & TV Shows Online Free',
    description: 'Stream trending movies, popular TV series, Pakistani dramas, and Turkish series for free on CineVault. Watch high-quality fallback streams with zero registration.',
    alternates: {
        canonical: '/',
    },
};

export default async function HomePage() {
    // Fetch all categories in parallel on the server
    const [
        trending,
        newest,
        tvSeries,
        topRated,
        action,
        comedy,
        horror,
        indian,
        pakistani,
        punjabi,
        turkish,
        korean
    ] = await Promise.all([
        fetchCategory(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`),
        fetchCategory(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`),
        fetchCategory(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`, 'tv'),
        fetchCategory(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`),
        fetchCategory(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28`),
        fetchCategory(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35`),
        fetchCategory(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27`),
        fetchCategory(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=hi&sort_by=popularity.desc`),
        fetchCategory(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=ur&sort_by=popularity.desc`),
        fetchCategory(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=pa&sort_by=popularity.desc`),
        fetchCategory(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=tr&sort_by=popularity.desc`),
        fetchCategory(`${BASE_URL}/discover/tv?api_key=${API_KEY}&with_original_language=ko&sort_by=popularity.desc`, 'tv'),
    ]);

    // Structured SEO Schemas
    const websiteSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'CineVault',
        'alternateName': 'CineVista',
        'url': 'https://cinevistas.vercel.app/',
        'potentialAction': {
            '@type': 'SearchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': 'https://cinevistas.vercel.app/search?q={search_term_string}'
            },
            'query-input': 'required name=search_term_string'
        }
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': 'Is CineVault completely free to use?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Yes! CineVault is 100% free to access. We do not charge subscriptions, rental fees, or require any form of payment. Our catalog indexes embed links from public, independent video hosting servers.'
                }
            },
            {
                '@type': 'Question',
                'name': 'Do I need to sign up or create an account?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'No registration is required. You can watch any movie or TV series instantly without creating an email account. Your bookmarks and watch history are stored strictly on your local browser cache to preserve your privacy.'
                }
            },
            {
                '@type': 'Question',
                'name': "How does the 'Continue Watching' watchlist resume progress work?",
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': "We utilize client-side HTML5 LocalStorage technology. When you stream content on our server options, our players update your progress percentage locally in your browser. This enables you to resume playback exactly where you left off."
                }
            },
            {
                '@type': 'Question',
                'name': 'What types of regional movies and TV series are available?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'CineVault features specialized categories for Pakistani Cinema, Bollywood Hits, Punjabi Cinema, and Turkish Drama series (often dubbed in Hindi or Urdu). We also provide standard Hollywood releases, action, horror, and comedy content.'
                }
            },
            {
                '@type': 'Question',
                'name': 'How can I prevent unwanted popup ads from streaming servers?',
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': 'Because streams are loaded via third-party iframe codes, these providers occasionally trigger redirects. For the best ad-free streaming experience, we recommend accessing CineVault using privacy-focused browsers like Brave, or installing extensions such as uBlock Origin.'
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <HomeClient
                initialTrending={trending}
                initialNewest={newest}
                initialTvSeries={tvSeries}
                initialTopRated={topRated}
                initialAction={action}
                initialComedy={comedy}
                initialHorror={horror}
                initialIndian={indian}
                initialPakistani={pakistani}
                initialPunjabi={punjabi}
                initialTurkish={turkish}
                initialKorean={korean}
            />
        </>
    );
}
