import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Movies & TV Shows - CineVista',
    description: 'Find free streaming options, cast details, reviews, and trailer links for your favorite movies and TV shows instantly on CineVista.',
    alternates: {
        canonical: '/search',
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
        'description': 'Find free streaming options, cast details, reviews, and trailer links for your favorite movies and TV shows instantly on CineVista.',
        'url': 'https://cinevista.online/search'
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            {children}
        </>
    );
}
