import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MobileNav from '@/components/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'CineVault - Premium Streaming',
    description: 'Your premium destination for movies and TV shows',
    metadataBase: new URL('https://cinevistas.vercel.app'),
    alternates: {
        canonical: '/',
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'Lc4q4doroRftf5io6k6n8w7vt1R3NPW5I1segzQ7d-0',
        yandex: process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION || '',
        other: {
            'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
        }
    },
    icons: {
        icon: '/icon.svg',
        apple: '/apple-icon.svg',
    },
    openGraph: {
        title: 'CineVault - Premium Streaming',
        description: 'Your premium destination for movies and TV shows',
        url: 'https://cinevistas.vercel.app',
        siteName: 'CineVault',
        images: [
            {
                url: '/opengraph-image.jpg',
                width: 1200,
                height: 630,
                alt: 'CineVault - Premium Streaming',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CineVault - Premium Streaming',
        description: 'Your premium destination for movies and TV shows',
        images: ['/opengraph-image.jpg'],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} antialiased`}>
                {children}
                <MobileNav />
            </body>
        </html>
    );
}
