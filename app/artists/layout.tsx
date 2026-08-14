import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cast & Crew Directory - CineVault',
    description: 'Browse profiles, biographies, and full filmographies of your favorite actors, directors, and crew members on CineVault.',
    alternates: {
        canonical: '/artists',
    },
};

export default function ArtistsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
