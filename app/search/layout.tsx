import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search Movies & TV Shows - CineVault',
    description: 'Find free streaming options, cast details, reviews, and trailer links for your favorite movies and TV shows instantly on CineVault.',
    alternates: {
        canonical: '/search',
    },
};

export default function SearchLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
