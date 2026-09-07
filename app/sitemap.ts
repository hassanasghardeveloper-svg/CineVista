import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { createWatchUrl, createArtistUrl } from '@/lib/slugify';

const BASE_URL = 'https://api.themoviedb.org/3';
const SITE_URL = 'https://cinevista.online';
const API_KEY = process.env.TMDB_API_KEY;

// Helper to get blog slugs from content directory
function getBlogSlugs(): string[] {
    try {
        const blogDir = path.join(process.cwd(), 'content', 'blog');
        if (!fs.existsSync(blogDir)) return [];
        return fs.readdirSync(blogDir)
            .filter(file => file.endsWith('.md') || file.endsWith('.mdx'))
            .map(file => file.replace(/\.(md|mdx)$/, ''));
    } catch {
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemaps: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${SITE_URL}/movies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/tv`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${SITE_URL}/recommend`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
        { url: `${SITE_URL}/artists`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
        { url: `${SITE_URL}/dmca`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
        { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
        { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.2 },
    ];

    // Add blog post URLs
    const blogSlugs = getBlogSlugs();
    blogSlugs.forEach(slug => {
        sitemaps.push({
            url: `${SITE_URL}/blog/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        });
    });

    if (!API_KEY) {
        return sitemaps;
    }

    try {
        // Fetch multiple pages of trending movies for broader sitemap coverage
        const moviePages = [1, 2, 3, 4, 5];
        const movieResults = await Promise.all(
            moviePages.map(page =>
                fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`, {
                    next: { revalidate: 3600 }
                }).then(res => res.ok ? res.json() : { results: [] })
                  .catch(() => ({ results: [] }))
            )
        );

        movieResults.forEach(data => {
            const movieUrls = (data.results || []).map((movie: any) => {
                const year = movie.release_date ? movie.release_date.split('-')[0] : '';
                const path = createWatchUrl(movie.id, 'movie', movie.title || movie.original_title || '', year);
                return {
                    url: `${SITE_URL}${path}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                };
            });
            sitemaps.push(...movieUrls);
        });

        // Fetch multiple pages of trending TV shows
        const tvPages = [1, 2, 3, 4, 5];
        const tvResults = await Promise.all(
            tvPages.map(page =>
                fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`, {
                    next: { revalidate: 3600 }
                }).then(res => res.ok ? res.json() : { results: [] })
                  .catch(() => ({ results: [] }))
            )
        );

        tvResults.forEach(data => {
            const tvUrls = (data.results || []).map((tv: any) => {
                const year = tv.first_air_date ? tv.first_air_date.split('-')[0] : '';
                const path = createWatchUrl(tv.id, 'tv', tv.name || tv.original_name || '', year);
                return {
                    url: `${SITE_URL}${path}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.7,
                };
            });
            sitemaps.push(...tvUrls);
        });

        // Fetch popular people (multiple pages)
        const peoplePages = [1, 2];
        const peopleResults = await Promise.all(
            peoplePages.map(page =>
                fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&page=${page}`, {
                    next: { revalidate: 3600 }
                }).then(res => res.ok ? res.json() : { results: [] })
                  .catch(() => ({ results: [] }))
            )
        );

        peopleResults.forEach(data => {
            const peopleUrls = (data.results || []).map((person: any) => {
                const path = createArtistUrl(person.id, person.name || '');
                return {
                    url: `${SITE_URL}${path}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.5,
                };
            });
            sitemaps.push(...peopleUrls);
        });

        // Fetch popular Indian/Pakistani/Turkish content for regional SEO
        const regionalLanguages = ['hi', 'ur', 'tr', 'ko'];
        const regionalResults = await Promise.all(
            regionalLanguages.map(lang =>
                fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=${lang}&sort_by=popularity.desc&page=1`, {
                    next: { revalidate: 3600 }
                }).then(res => res.ok ? res.json() : { results: [] })
                  .catch(() => ({ results: [] }))
            )
        );

        regionalResults.forEach(data => {
            const urls = (data.results || []).slice(0, 20).map((movie: any) => {
                const year = movie.release_date ? movie.release_date.split('-')[0] : '';
                const path = createWatchUrl(movie.id, 'movie', movie.title || movie.original_title || '', year);
                return {
                    url: `${SITE_URL}${path}`,
                    lastModified: new Date(),
                    changeFrequency: 'weekly' as const,
                    priority: 0.6,
                };
            });
            sitemaps.push(...urls);
        });

    } catch (e) {
        console.error('Error generating sitemap:', e);
    }

    // Deduplicate URLs
    const seen = new Set<string>();
    const deduplicated = sitemaps.filter(entry => {
        if (seen.has(entry.url)) return false;
        seen.add(entry.url);
        return true;
    });

    return deduplicated;
}
