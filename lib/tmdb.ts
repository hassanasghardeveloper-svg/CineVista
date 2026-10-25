/**
 * Shared TMDB API fetch utilities for watch pages.
 * Used by both /watch/movie/[id] and /watch/tv/[id] routes.
 */

import { slugify } from './slugify';

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

/**
 * Thrown when TMDB is reachable but unhappy (rate limit, outage, network blip).
 *
 * This has to stay separate from "TMDB says this id does not exist". A missing
 * id is a real 404, but a rate limit is temporary -- and answering a temporary
 * problem with a 404 tells Google the page is permanently gone and gets it
 * deindexed. Callers let this bubble up so the request fails with a 5xx, which
 * Google retries instead.
 */
export class TmdbUnavailableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TmdbUnavailableError';
    }
}

/**
 * Returns for a TMDB response: `null` only for a genuine 404, otherwise throws
 * on any other failure.
 */
export function assertTmdbOk(res: Response, what: string): null | void {
    if (res.ok) return;
    if (res.status === 404) return null;
    throw new TmdbUnavailableError(`TMDB ${res.status} for ${what}`);
}

export async function fetchTitleDetails(id: string, type: string) {
    if (!id || !/^\d+$/.test(id)) return null;
    try {
        const mediaType = type === 'tv' || type === 'tv_series' ? 'tv' : 'movie';
        const detailRes = await fetch(
            `${BASE_URL}/${mediaType}/${id}?api_key=${API_KEY}&append_to_response=videos,credits,recommendations,watch/providers`,
            { next: { revalidate: 86400 } }
        );

        if (assertTmdbOk(detailRes, `${mediaType}/${id}`) === null) return null;
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
        // A transient TMDB problem must not be reported as "this title does not
        // exist" -- rethrow so the route 5xx's and keeps its place in the index.
        if (e instanceof TmdbUnavailableError) throw e;
        console.error('Error fetching details:', e);
        throw new TmdbUnavailableError(`TMDB request failed for ${type}/${id}`);
    }
}

/** Fallback thumbnail for titles TMDB has no artwork for. */
export const FALLBACK_THUMBNAIL = 'https://cinevista.online/opengraph-image.jpg';

/**
 * Google rejects a bare `YYYY-MM-DD` uploadDate: it wants full ISO 8601 with a
 * time zone. Returns undefined for anything unparseable so the property is
 * omitted rather than emitted invalid.
 */
export function toSchemaDate(date?: string | null): string | undefined {
    if (!date) return undefined;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
    if (match) return `${date.trim()}T00:00:00+00:00`;
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

/**
 * TMDB list endpoints whose titles are prerendered at build time, as
 * [path, extra query, page count]. Regional lists come first because that is
 * where most of CineVista's search traffic lands.
 */
const PRERENDER_LISTS: Record<'movie' | 'tv', [string, string, number][]> = {
    movie: [
        ['/discover/movie', '&with_original_language=ur&sort_by=popularity.desc', 3],
        ['/discover/movie', '&with_original_language=hi&sort_by=popularity.desc', 5],
        ['/discover/movie', '&with_original_language=pa&sort_by=popularity.desc', 2],
        ['/movie/now_playing', '', 3],
        ['/trending/movie/week', '', 5],
        ['/movie/popular', '', 10],
    ],
    tv: [
        ['/discover/tv', '&with_original_language=ur&sort_by=popularity.desc', 3],
        ['/discover/tv', '&with_original_language=hi&sort_by=popularity.desc', 3],
        ['/discover/tv', '&with_original_language=tr&sort_by=popularity.desc', 3],
        ['/discover/tv', '&with_original_language=ko&sort_by=popularity.desc', 2],
        ['/trending/tv/week', '', 3],
        ['/tv/popular', '', 5],
    ],
};

/**
 * `generateStaticParams` for the watch routes: the most-visited titles, keyed
 * by their canonical slug so the build renders the page, not a redirect.
 *
 * Prerendered pages ship as static assets and never touch the Worker's CPU
 * limit, which on the free plan is what turned crawls into 5xx errors. A list
 * that fails to load is skipped instead of failing the build.
 */
export async function fetchPrerenderParams(type: 'movie' | 'tv'): Promise<{ id: string }[]> {
    if (!API_KEY) return [];
    const requests = PRERENDER_LISTS[type].flatMap(([path, query, pages]) =>
        Array.from({ length: pages }, (_, i) =>
            fetch(`${BASE_URL}${path}?api_key=${API_KEY}&page=${i + 1}${query}`, { next: { revalidate: 86400 } })
                .then(res => (res.ok ? res.json() : { results: [] }))
                .then(data => (data.results || []) as any[])
                .catch(() => [] as any[])
        )
    );
    const seen = new Set<string>();
    const params: { id: string }[] = [];
    for (const item of (await Promise.all(requests)).flat()) {
        const id = String(item.id);
        if (seen.has(id)) continue;
        seen.add(id);
        // Must match each route's canonical slug: movies carry the year, TV
        // shows do not.
        const slug = type === 'movie'
            ? slugify(item.title, (item.release_date || '').split('-')[0])
            : slugify(item.name);
        params.push({ id: `${id}${slug ? `-${slug}` : ''}` });
    }
    return params;
}
