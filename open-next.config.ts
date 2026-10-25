import { defineCloudflareConfig, getCloudflareContext } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";

/**
 * Pages prerendered at build time, shipped as Workers static assets.
 *
 * Read-only: writes are dropped here and land in the regional Cache API layer
 * instead. Keeps the static-assets cache name so `opennextjs-cloudflare deploy`
 * still copies the build cache into the assets directory.
 */
const buildTimeCache = {
    name: staticAssetsIncrementalCache.name,
    get: staticAssetsIncrementalCache.get.bind(staticAssetsIncrementalCache),
    set: async () => {},
    delete: async () => {},
};

export default defineCloudflareConfig({
    // Free-plan cache stack, no KV. KV on the free plan allows 1 GB and 1,000
    // writes a day; by Oct 2026 the namespace held 3.27 GB, every write failed,
    // and the site served the 9 Sept build for six weeks.
    //
    // - Build-time pages (homepage, sitemaps, popular titles) come from static
    //   assets, which have no read or write limits. The daily rebuild in
    //   .github/workflows/deploy.yml refreshes them.
    // - Anything rendered at runtime goes into the Cache API of the data centre
    //   that rendered it, which is free and unmetered.
    //
    // Lazy updates are off. Otherwise every cache hit would overwrite a fresh
    // runtime render with the older build-time copy.
    incrementalCache: withRegionalCache(buildTimeCache, {
        mode: "long-lived",
        shouldLazilyUpdateOnCacheHit: false,
        defaultLongLivedTtlSec: 86400,
    }),
    // Revalidate stale pages in the background. The built-in "direct" queue is
    // awaited inside the visitor's request, so every STALE hit waited for a full
    // re-render (40s+ on the homepage in Oct 2026). memory-queue re-renders in a
    // separate invocation through the WORKER_SELF_REFERENCE binding, and handing
    // it to waitUntil lets the stale page go out immediately.
    queue: {
        name: "background-memory-queue",
        send: async (message) => {
            getCloudflareContext().ctx.waitUntil(memoryQueue.send(message));
        },
    },
    // Serve cached pages straight from the cache, skipping the Next.js server.
    enableCacheInterception: true,
});
