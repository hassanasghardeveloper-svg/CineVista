import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Watch Free TV Shows & Series Online - CineVault',
    description: 'Stream trending, popular, and top-rated TV series. Explore Pakistani dramas and Turkish drama series dubbed in Urdu and Hindi on CineVault.',
    alternates: {
        canonical: '/tv',
    },
};

export default function TvLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
