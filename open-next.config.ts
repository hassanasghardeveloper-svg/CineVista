import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

export default defineCloudflareConfig({
    // Persist rendered ISR pages in R2 so Googlebot's crawl of ~11k pages does not
    // re-render every URL in the Worker (the cause of the 5xx wave in Sept 2026).
    // The regional wrapper keeps a Cache API copy per data centre in front of R2.
    incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
    // Revalidate in the same request instead of running a separate queue Worker.
    queue: "direct",
    // Serve cached pages straight from the cache, skipping the Next.js server.
    enableCacheInterception: true,
});
