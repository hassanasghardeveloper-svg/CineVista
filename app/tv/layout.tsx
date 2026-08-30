import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Watch Free TV Shows & Series Online – Pakistani Dramas, Turkish Series & More | CineVista',
    description: 'Stream trending, popular, and top-rated TV series for free. Explore Pakistani dramas, Turkish drama series dubbed in Urdu/Hindi, Korean K-Dramas, Bollywood web series, and more on CineVista.',
    alternates: {
        canonical: '/tv',
    },
    openGraph: {
        title: 'Watch Free TV Shows & Series Online | CineVista',
        description: 'Stream trending, popular, and top-rated TV series for free. Explore Pakistani dramas, Turkish drama series, Korean K-Dramas, and more.',
        url: 'https://cinevista.online/tv',
        siteName: 'CineVista',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Watch Free TV Shows & Series Online | CineVista',
        description: 'Stream Pakistani dramas, Turkish series, Korean K-Dramas & more free on CineVista.',
    },
};

export default function TvLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Watch Free TV Shows & Series Online – CineVista',
        'description': 'Stream trending, popular, and top-rated TV series. Explore Pakistani dramas, Turkish drama series, Korean K-Dramas, and more on CineVista.',
        'url': 'https://cinevista.online/tv',
        'isPartOf': {
            '@type': 'WebSite',
            'name': 'CineVista',
            'url': 'https://cinevista.online',
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://cinevista.online',
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': 'TV Shows',
                'item': 'https://cinevista.online/tv',
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {children}
        </>
    );
}

