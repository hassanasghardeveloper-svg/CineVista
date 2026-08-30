import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Movies & TV Shows | CineVista',
    description: 'Search and discover thousands of movies and TV series on CineVista. Find Hollywood, Bollywood, Pakistani, Turkish, Korean dramas and more instantly.',
    alternates: {
        canonical: '/search',
    },
    openGraph: {
        title: 'Search Movies & TV Shows | CineVista',
        description: 'Search and discover thousands of movies and TV series on CineVista. Find Hollywood, Bollywood, Pakistani, Turkish, Korean dramas and more instantly.',
        url: 'https://cinevista.online/search',
        siteName: 'CineVista',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Search Movies & TV Shows | CineVista',
        description: 'Find any movie or TV show instantly on CineVista.',
    },
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SearchResultsPage',
        'name': 'Search Movies & TV Shows - CineVista',
        'description': 'Search and discover thousands of movies and TV series on CineVista.',
        'url': 'https://cinevista.online/search',
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
                'name': 'Search',
                'item': 'https://cinevista.online/search',
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

