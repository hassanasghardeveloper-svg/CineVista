import fs from 'fs';
import path from 'path';
import { createWatchUrl, createArtistUrl } from '@/lib/slugify';
import {
    findShard,
    renderUrlSet,
    SITE_URL,
    XML_HEADERS,
    type Shard,
    type SitemapEntry,
} from '@/lib/sitemap-shards';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

// Each shard is rebuilt at most once a day.
export const revalidate = 86400;

// Empty on purpose: shards are rendered on first request and then cached,
// so the build does not have to make hundreds of TMDB calls.
export async function generateStaticParams() {
    return [];
}

function staticEntries(): SitemapEntry[] {
    const now = new Date().toISOString();
    const entries: SitemapEntry[] = [
        { loc: SITE_URL, changefreq: 'daily', priority: 1.0 },
        { loc: `${SITE_URL}/movies`, changefreq: 'daily', priority: 0.9 },
        { loc: `${SITE_URL}/tv`, changefreq: 'daily', priority: 0.9 },
        { loc: `${SITE_URL}/blog`, changefreq: 'weekly', priority: 0.8 },
        { loc: `${SITE_URL}/search`, changefreq: 'weekly', priority: 0.7 },
        { loc: `${SITE_URL}/recommend`, changefreq: 'weekly', priority: 0.7 },
        { loc: `${SITE_URL}/artists`, changefreq: 'weekly', priority: 0.6 },
        { loc: `${SITE_URL}/dmca`, changefreq: 'monthly', priority: 0.2 },
        { loc: `${SITE_URL}/privacy`, changefreq: 'monthly', priority: 0.2 },
        { loc: `${SITE_URL}/terms`, changefreq: 'monthly', priority: 0.2 },
    ].map(entry => ({ ...entry, lastmod: now }));

    try {
        const blogDir = path.join(process.cwd(), 'content', 'blog');
        if (fs.existsSync(blogDir)) {
            for (const file of fs.readdirSync(blogDir)) {
                if (!/\.mdx?$/.test(file)) continue;
                entries.push({
                    loc: `${SITE_URL}/blog/${file.replace(/\.mdx?$/, '')}`,
                    lastmod: now,
                    changefreq: 'monthly',
                    priority: 0.7,
                });
            }
        }
    } catch {
        // A missing content directory just means no blog URLs.
    }
    return entries;
}

function endpointFor(kind: Shard['kind'], page: number): string {
    switch (kind) {
        case 'movies':
            return `${TMDB_BASE}/discover/movie?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&page=${page}`;
        case 'tv':
            return `${TMDB_BASE}/discover/tv?api_key=${API_KEY}&sort_by=popularity.desc&include_adult=false&page=${page}`;
        case 'people':
            return `${TMDB_BASE}/person/popular?api_key=${API_KEY}&page=${page}`;
    }
}

function toEntry(kind: Shard['kind'], item: any, lastmod: string): SitemapEntry | null {
    if (!item?.id) return null;
    if (kind === 'people') {
        if (!item.name) return null;
        return { loc: `${SITE_URL}${createArtistUrl(item.id, item.name)}`, lastmod, changefreq: 'weekly', priority: 0.6 };
    }
    const isTv = kind === 'tv';
    const title = isTv ? (item.name || item.original_name) : (item.title || item.original_title);
    if (!title) return null;
    const date = isTv ? item.first_air_date : item.release_date;
    const year = date ? String(date).split('-')[0] : '';
    return {
        loc: `${SITE_URL}${createWatchUrl(item.id, isTv ? 'tv' : 'movie', title, year)}`,
        lastmod,
        changefreq: 'weekly',
        priority: 0.7,
    };
}

async function catalogueEntries(shard: Shard): Promise<SitemapEntry[]> {
    if (!API_KEY) return [];
    const lastmod = new Date().toISOString();
    const pages: number[] = [];
    for (let page = shard.firstPage; page <= shard.lastPage; page++) pages.push(page);

    const responses = await Promise.all(
        pages.map(page =>
            fetch(endpointFor(shard.kind, page), { next: { revalidate: 86400 } })
                .then(res => (res.ok ? res.json() : { results: [] }))
                .catch(() => ({ results: [] }))
        )
    );

    const entries: SitemapEntry[] = [];
    const seen = new Set<string>();
    for (const body of responses) {
        for (const item of body?.results || []) {
            const entry = toEntry(shard.kind, item, lastmod);
            if (!entry || seen.has(entry.loc)) continue;
            seen.add(entry.loc);
            entries.push(entry);
        }
    }
    return entries;
}

export async function GET(_request: Request, { params }: { params: { shard: string } }) {
    const id = params.shard.replace(/\.xml$/, '');

    if (id === 'static') {
        return new Response(renderUrlSet(staticEntries()), { headers: XML_HEADERS });
    }

    const shard = findShard(id);
    if (!shard) {
        return new Response('Not found', { status: 404 });
    }

    return new Response(renderUrlSet(await catalogueEntries(shard)), { headers: XML_HEADERS });
}
