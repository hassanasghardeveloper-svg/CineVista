import { MetadataRoute } from 'next';

const BASE_URL = 'https://api.themoviedb.org/3';
const SITE_URL = 'https://cine-vista-seven.vercel.app';
const API_KEY = process.env.TMDB_API_KEY;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemaps: MetadataRoute.Sitemap = [
        { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${SITE_URL}/movies`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${SITE_URL}/tv`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
        { url: `${SITE_URL}/artists`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    ];

    if (!API_KEY) {
        return sitemaps;
    }

    try {
        // Fetch trending movies (revalidate after 1 hour)
        const movieRes = await fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`, {
            next: { revalidate: 3600 }
        });
        if (movieRes.ok) {
            const movieData = await movieRes.json();
            const movieUrls = (movieData.results || []).slice(0, 50).map((movie: any) => ({
                url: `${SITE_URL}/watch/${movie.id}?type=movie`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
            sitemaps.push(...movieUrls);
        }

        // Fetch trending TV shows
        const tvRes = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`, {
            next: { revalidate: 3600 }
        });
        if (tvRes.ok) {
            const tvData = await tvRes.json();
            const tvUrls = (tvData.results || []).slice(0, 50).map((tv: any) => ({
                url: `${SITE_URL}/watch/${tv.id}?type=tv`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.7,
            }));
            sitemaps.push(...tvUrls);
        }

        // Fetch popular people
        const peopleRes = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}`, {
            next: { revalidate: 3600 }
        });
        if (peopleRes.ok) {
            const peopleData = await peopleRes.json();
            const peopleUrls = (peopleData.results || []).slice(0, 50).map((person: any) => ({
                url: `${SITE_URL}/artist/${person.id}`,
                lastModified: new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.5,
            }));
            sitemaps.push(...peopleUrls);
        }
    } catch (e) {
        console.error('Error generating sitemap:', e);
    }

    return sitemaps;
}
