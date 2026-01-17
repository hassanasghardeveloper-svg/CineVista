const API_KEY = process.env.WATCHMODE_API_KEY;
const BASE_URL = 'https://api.watchmode.com/v1';

export interface WatchmodeTitle {
    id: number;
    title: string;
    year: number;
    imdb_id: string;
    tmdb_id: number;
    tmdb_type: string;
    type: string;
}

export interface TitleDetails {
    id: number;
    title: string;
    original_title: string;
    plot_overview: string;
    type: string;
    runtime_minutes: number;
    year: number;
    release_date: string;
    imdb_id: string;
    tmdb_id: number;
    genres: number[];
    genre_names: string[];
    user_rating: number;
    critic_score: number;
    poster: string;
    backdrop: string;
}

export interface TitleSource {
    source_id: number;
    name: string;
    type: string;
    region: string;
    web_url: string;
    format: string;
    price: number | null;
}

// Search for titles
export async function searchTitles(query: string, type?: string) {
    const searchType = type === 'tv' ? 4 : type === 'movie' ? 3 : 2;
    const res = await fetch(
        `${BASE_URL}/autocomplete-search/?apiKey=${API_KEY}&search_value=${encodeURIComponent(query)}&search_type=${searchType}`
    );
    if (!res.ok) throw new Error('Search failed');
    return res.json();
}

// Get list of titles (movies or TV)
export async function listTitles(options: {
    types?: string;
    genres?: string;
    limit?: number;
    page?: number;
    sort_by?: string;
}) {
    const params = new URLSearchParams({
        apiKey: API_KEY || '',
        types: options.types || 'movie',
        limit: String(options.limit || 20),
        page: String(options.page || 1),
        sort_by: options.sort_by || 'popularity_desc',
    });
    if (options.genres) params.append('genres', options.genres);

    const res = await fetch(`${BASE_URL}/list-titles/?${params}`);
    if (!res.ok) throw new Error('Failed to fetch titles');
    return res.json();
}

// Get title details
export async function getTitleDetails(id: number | string) {
    const res = await fetch(
        `${BASE_URL}/title/${id}/details/?apiKey=${API_KEY}&append_to_response=sources`
    );
    if (!res.ok) throw new Error('Failed to fetch title details');
    return res.json();
}

// Get title streaming sources
export async function getTitleSources(id: number | string, region = 'US') {
    const res = await fetch(
        `${BASE_URL}/title/${id}/sources/?apiKey=${API_KEY}&regions=${region}`
    );
    if (!res.ok) throw new Error('Failed to fetch sources');
    return res.json();
}

// Get popular/trending titles for hero
export async function getPopularTitles(type = 'movie', limit = 10) {
    return listTitles({
        types: type,
        limit,
        sort_by: 'popularity_desc',
    });
}

// Get genres list
export async function getGenres() {
    const res = await fetch(`${BASE_URL}/genres/?apiKey=${API_KEY}`);
    if (!res.ok) throw new Error('Failed to fetch genres');
    return res.json();
}
