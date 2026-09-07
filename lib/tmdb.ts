/**
 * Shared TMDB API fetch utilities for watch pages.
 * Used by both /watch/movie/[id] and /watch/tv/[id] routes.
 */

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

export async function fetchTitleDetails(id: string, type: string) {
    if (!id || !/^\d+$/.test(id)) return null;
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
        console.error('Error fetching details:', e);
        return null;
    }
}
