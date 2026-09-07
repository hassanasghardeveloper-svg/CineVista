import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Watch Free Movies Online – Hindi Dubbed, Bollywood, Hollywood | CineVista',
    description: 'Browse and stream free movies online in HD. Explore trending Hollywood, Hindi dubbed movies, Bollywood hits, Pakistani & Turkish films on CineVista.',
    alternates: {
        canonical: '/movies',
    },
    openGraph: {
        title: 'Watch Free Movies Online – Hindi Dubbed, Bollywood & Hollywood | CineVista',
        description: 'Browse and stream free movies online in HD. Explore trending Hollywood, Hindi dubbed movies, Bollywood hits, Pakistani & Turkish films on CineVista.',
        url: 'https://cinevista.online/movies',
        siteName: 'CineVista',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Watch Free Movies Online | CineVista',
        description: 'Browse and stream free movies. Hollywood, Hindi Dubbed, Bollywood, Pakistani & more.',
    },
};

export default function MoviesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'Watch Free Movies Online – CineVista',
        'description': 'Browse and stream 200+ free movies online including trending Hollywood, Bollywood, Pakistani, Turkish, and Korean content.',
        'url': 'https://cinevista.online/movies',
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
                'name': 'Movies',
                'item': 'https://cinevista.online/movies',
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
