import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Watch Free Movies Online - CineVista',
    description: 'Stream trending, popular, and top-rated movies. Explore Pakistani, Bollywood, Punjabi, and Turkish films for free on CineVista.',
    alternates: {
        canonical: '/movies',
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
        'name': 'Watch Free Movies Online - CineVista',
        'description': 'Stream trending, popular, and top-rated movies. Explore Pakistani, Bollywood, Punjabi, and Turkish films for free on CineVista.',
        'url': 'https://cinevista.online/movies'
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
