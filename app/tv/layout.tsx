import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Watch Free TV Shows & Series Online - CineVista',
    description: 'Stream trending, popular, and top-rated TV series. Explore Pakistani dramas and Turkish drama series dubbed in Urdu and Hindi on CineVista.',
    alternates: {
        canonical: '/tv',
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
        'name': 'Watch Free TV Shows & Series Online - CineVista',
        'description': 'Stream trending, popular, and top-rated TV series. Explore Pakistani dramas and Turkish drama series dubbed in Urdu and Hindi on CineVista.',
        'url': 'https://cinevista.online/tv'
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
