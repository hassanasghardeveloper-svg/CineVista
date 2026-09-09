import { listShards, renderSitemapIndex, SITE_URL, XML_HEADERS } from '@/lib/sitemap-shards';

// Regenerated daily; served from cache in between.
export const revalidate = 86400;

/**
 * Sitemap index. Points at the static/blog shard plus one shard per slice of
 * the TMDB catalogue, so Google can discover the whole site instead of the 310
 * URLs the previous single-file sitemap listed.
 */
export async function GET() {
    const locs = [
        `${SITE_URL}/sitemaps/static`,
        ...listShards().map(shard => `${SITE_URL}/sitemaps/${shard.id}`),
    ];
    return new Response(renderSitemapIndex(locs, new Date().toISOString()), {
        headers: XML_HEADERS,
    });
}
