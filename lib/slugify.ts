/**
 * SEO Slug Utilities for CineVista
 * 
 * Generates URL-safe, keyword-rich slugs for watch and artist pages.
 * Uses ID-prefixed slug pattern: the numeric ID comes first so the page
 * always works regardless of the slug text (cosmetic SEO benefit).
 */

/**
 * Convert a title/name string into a URL-safe slug.
 * Optionally append a year for movie/TV slugs.
 * 
 * @example slugify("The Dark Knight", "2008") → "the-dark-knight-2008"
 * @example slugify("Shah Rukh Khan") → "shah-rukh-khan"
 */
export function slugify(text: string, year?: string | number): string {
    if (!text) return '';

    let slug = text
        .toString()
        .normalize('NFD')                   // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '')    // Remove diacritics
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')      // Remove non-alphanumeric (except spaces & hyphens)
        .replace(/[\s_]+/g, '-')            // Spaces/underscores → hyphens
        .replace(/-+/g, '-')               // Collapse multiple hyphens
        .replace(/^-|-$/g, '');            // Trim leading/trailing hyphens

    // Append year if provided and valid
    if (year) {
        const yearStr = String(year).trim();
        if (/^\d{4}$/.test(yearStr) && !slug.endsWith(`-${yearStr}`)) {
            slug = `${slug}-${yearStr}`;
        }
    }

    return slug;
}

/**
 * Build a clean watch URL: /watch/movie/123-inception-2010
 */
export function createWatchUrl(
    id: string | number,
    type: string,
    title: string,
    year?: string | number
): string {
    const mediaType = type === 'tv' || type === 'tv_series' ? 'tv' : 'movie';
    const slug = slugify(title, year);
    return `/watch/${mediaType}/${id}${slug ? `-${slug}` : ''}`;
}

/**
 * Build a clean watch URL with season/episode query params for TV shows.
 */
export function createWatchEpisodeUrl(
    id: string | number,
    title: string,
    season: number,
    episode: number
): string {
    const slug = slugify(title);
    return `/watch/tv/${id}${slug ? `-${slug}` : ''}?s=${season}&e=${episode}`;
}

/**
 * Build a clean artist URL: /artist/581684-mike-lucock
 */
export function createArtistUrl(id: string | number, name: string): string {
    const slug = slugify(name);
    return `/artist/${id}${slug ? `-${slug}` : ''}`;
}

/**
 * Extract the numeric ID from a slug parameter.
 * "123-inception-2010" → "123"
 * "581684-mike-lucock" → "581684"
 * "581684" → "581684"
 */
export function extractIdFromSlug(slug: string): string {
    if (!slug) return '';
    const match = slug.match(/^(\d+)/);
    return match ? match[1] : slug;
}
