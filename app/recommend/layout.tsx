import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'AI Movie Recommendations – Get Personalized Picks | CineVista',
    description: 'Get AI-powered movie and TV show recommendations in Urdu, Hindi, or English. Tell us your mood and our Groq AI will find the perfect movie, drama, or series for you.',
    alternates: {
        canonical: '/recommend',
    },
    openGraph: {
        title: 'AI Movie Recommendations – Get Personalized Picks | CineVista',
        description: 'Get AI-powered movie and TV show recommendations. Tell us your mood and our AI will find the perfect movie, drama, or series for you.',
        url: 'https://cinevista.online/recommend',
        siteName: 'CineVista',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Movie Recommendations | CineVista',
        description: 'Get personalized movie & TV show recommendations powered by AI.',
    },
};

export default function RecommendLayout({
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
                'name': 'AI Recommendations',
                'item': 'https://cinevista.online/recommend',
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
