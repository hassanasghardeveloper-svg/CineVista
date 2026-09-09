import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                // /_next/static holds the CSS and JS bundles. Blocking those
                // stops Google rendering the page, which feeds straight into
                // "Crawled - currently not indexed".
                allow: ['/', '/_next/static/'],
                disallow: ['/api/', '/_next/'],
            },
        ],
        sitemap: 'https://cinevista.online/sitemap.xml',
        host: 'https://cinevista.online',
    };
}
