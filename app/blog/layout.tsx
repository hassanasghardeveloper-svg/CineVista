import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'CineVista Blog – Movie Reviews, Top Lists & Streaming Guides',
    description: 'Read movie reviews, top-10 lists, streaming guides, and entertainment news. Discover the best Pakistani dramas, Bollywood hits, Turkish series, and Hollywood blockbusters on the CineVista Blog.',
    alternates: {
        canonical: '/blog',
    },
    openGraph: {
        title: 'CineVista Blog – Movie Reviews, Top Lists & Streaming Guides',
        description: 'Read movie reviews, top-10 lists, streaming guides, and entertainment news on the CineVista Blog.',
        url: 'https://cinevista.online/blog',
        siteName: 'CineVista',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CineVista Blog – Movie Reviews & Streaming Guides',
        description: 'Movie reviews, top-10 lists, and streaming guides on CineVista.',
    },
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                'name': 'Blog',
                'item': 'https://cinevista.online/blog',
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            {children}
        </>
    );
}
