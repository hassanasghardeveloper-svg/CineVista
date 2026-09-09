/**
 * Sitemap sharding.
 *
 * Google knows roughly 11,300 CineVista URLs but the old single sitemap listed
 * only 310, so almost the whole catalogue was left to be discovered by crawling
 * alone. The catalogue is far too large for one file (and far too large to
 * build in one request), so it is split into shards that are generated and
 * cached independently and tied together by a sitemap index.
 */

export const SITE_URL = 'https://cinevista.online';

/** TMDB pages fetched per shard. 20 pages x 20 results = 400 URLs per shard. */
export const TMDB_PAGES_PER_SHARD = 20;

/** TMDB refuses `page` above 500. */
const TMDB_MAX_PAGE = 500;

export type ShardKind = 'movies' | 'tv' | 'people';

/** How many TMDB pages to cover per kind, i.e. how deep the catalogue goes. */
const PAGES_PER_KIND: Record<ShardKind, number> = {
    movies: 500, // 10,000 titles
    tv: 300,     //  6,000 titles
    people: 200, //  4,000 artists
};

export interface Shard {
    /** URL segment, e.g. "movies-3". */
    id: string;
    kind: ShardKind;
    /** Inclusive 1-based TMDB page range this shard covers. */
    firstPage: number;
    lastPage: number;
}

export function listShards(): Shard[] {
    const shards: Shard[] = [];
    for (const kind of Object.keys(PAGES_PER_KIND) as ShardKind[]) {
        const totalPages = Math.min(PAGES_PER_KIND[kind], TMDB_MAX_PAGE);
        const shardCount = Math.ceil(totalPages / TMDB_PAGES_PER_SHARD);
        for (let i = 0; i < shardCount; i++) {
            shards.push({
                id: `${kind}-${i}`,
                kind,
                firstPage: i * TMDB_PAGES_PER_SHARD + 1,
                lastPage: Math.min((i + 1) * TMDB_PAGES_PER_SHARD, totalPages),
            });
        }
    }
    return shards;
}

export function findShard(id: string): Shard | undefined {
    return listShards().find(shard => shard.id === id);
}

export interface SitemapEntry {
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: number;
}

function escapeXml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export function renderUrlSet(entries: SitemapEntry[]): string {
    const urls = entries.map(entry => {
        const parts = [`    <loc>${escapeXml(entry.loc)}</loc>`];
        if (entry.lastmod) parts.push(`    <lastmod>${entry.lastmod}</lastmod>`);
        if (entry.changefreq) parts.push(`    <changefreq>${entry.changefreq}</changefreq>`);
        if (entry.priority !== undefined) parts.push(`    <priority>${entry.priority.toFixed(1)}</priority>`);
        return `  <url>\n${parts.join('\n')}\n  </url>`;
    });
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

export function renderSitemapIndex(locs: string[], lastmod: string): string {
    const items = locs.map(loc =>
        `  <sitemap>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
    );
    return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items.join('\n')}\n</sitemapindex>\n`;
}

export const XML_HEADERS = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
};
