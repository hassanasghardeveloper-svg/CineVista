import { NextResponse } from 'next/server';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

const GENRE_MAP: { [key: number]: string } = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
    10759: 'Action & Adventure',
    10762: 'Kids',
    10763: 'News',
    10764: 'Reality',
    10765: 'Sci-Fi & Fantasy',
    10766: 'Soap',
    10767: 'Talk',
    10768: 'War & Politics'
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'trending';
    const type = searchParams.get('type') || 'movie';
    const page = searchParams.get('page') || '1';

    try {
        let endpoint = '';
        const mediaType = type === 'tv' ? 'tv' : 'movie';

        // Build endpoint based on category
        switch (category) {
            case 'trending':
                endpoint = `${BASE_URL}/trending/${mediaType}/week?api_key=${API_KEY}&page=${page}`;
                break;
            case 'new':
                endpoint = mediaType === 'movie'
                    ? `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`
                    : `${BASE_URL}/tv/on_the_air?api_key=${API_KEY}&page=${page}`;
                break;
            case 'popular':
                endpoint = `${BASE_URL}/${mediaType}/popular?api_key=${API_KEY}&page=${page}`;
                break;
            case 'top_rated':
                endpoint = `${BASE_URL}/${mediaType}/top_rated?api_key=${API_KEY}&page=${page}`;
                break;
            case 'action':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=28&page=${page}`;
                break;
            case 'comedy':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=35&page=${page}`;
                break;
            case 'horror':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=27&page=${page}`;
                break;
            case 'animation':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=16&page=${page}`;
                break;
            case 'documentary':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=99&page=${page}`;
                break;
            case 'indian':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=hi&page=${page}&sort_by=popularity.desc`;
                break;
            case 'pakistani':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=ur&page=${page}&sort_by=popularity.desc`;
                break;
            case 'punjabi':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=pa&page=${page}&sort_by=popularity.desc`;
                break;
            case 'turkish':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=tr&page=${page}&sort_by=popularity.desc`;
                break;
            case 'hollywood':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=en&page=${page}&sort_by=popularity.desc`;
                break;
            case 'korean':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=ko&page=${page}&sort_by=popularity.desc`;
                break;
            case 'tollywood':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=te&page=${page}&sort_by=popularity.desc`;
                break;
            case 'tamil':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=ta&page=${page}&sort_by=popularity.desc`;
                break;
            case 'webseries':
                // Web series = TV shows with multiple seasons, use TV discover
                endpoint = `${BASE_URL}/discover/tv?api_key=${API_KEY}&page=${page}&sort_by=popularity.desc&with_type=2|4`;
                break;
            case 'arabic':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=ar&page=${page}&sort_by=popularity.desc`;
                break;
            case 'french':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_original_language=fr&page=${page}&sort_by=popularity.desc`;
                break;
            case 'horror':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=27&page=${page}&sort_by=popularity.desc`;
                break;
            case 'romance':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=10749&page=${page}&sort_by=popularity.desc`;
                break;
            case 'thriller':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=53&page=${page}&sort_by=popularity.desc`;
                break;
            case 'drama':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=18&page=${page}&sort_by=popularity.desc`;
                break;
            case 'animation':
                endpoint = `${BASE_URL}/discover/${mediaType}?api_key=${API_KEY}&with_genres=16&page=${page}&sort_by=popularity.desc`;
                break;
            default:
                endpoint = `${BASE_URL}/trending/${mediaType}/week?api_key=${API_KEY}&page=${page}`;
        }

        const res = await fetch(endpoint, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!res.ok) {
            throw new Error(`TMDB API error: ${res.status}`);
        }

        const data = await res.json();

        // Transform TMDB response to our format
        const titles = data.results.map((item: any) => ({
            id: item.id,
            title: item.title || item.name,
            original_title: item.original_title || item.original_name,
            plot_overview: item.overview,
            type: item.media_type || mediaType,
            year: (item.release_date || item.first_air_date || '').split('-')[0],
            release_date: item.release_date || item.first_air_date,
            poster: item.poster_path ? `${IMG_BASE}/w500${item.poster_path}` : null,
            backdrop: item.backdrop_path ? `${IMG_BASE}/w1280${item.backdrop_path}` : null,
            user_rating: item.vote_average,
            vote_count: item.vote_count,
            genre_ids: item.genre_ids,
            genre_names: item.genre_ids ? item.genre_ids.map((id: number) => GENRE_MAP[id]).filter(Boolean) : [],
            popularity: item.popularity,
            tmdb_id: item.id,
        }));

        return NextResponse.json({
            titles,
            total: data.total_results,
            page: data.page,
            total_pages: data.total_pages,
        });
    } catch (error: any) {
        console.error('TMDB API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 });
    }
}
