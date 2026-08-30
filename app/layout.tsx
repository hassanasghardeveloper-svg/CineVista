import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MobileNav from '@/components/MobileNav';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'CineVista - Premium Streaming',
    description: 'Your premium destination for movies and TV shows',
    metadataBase: new URL('https://cinevista.online'),
    alternates: {
        canonical: '/',
    },
    verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '7VHmGJtya1aKOksZksfyK8Pugvj7nYEVHAAZEXzhV6c',
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
        title: 'CineVista - Premium Streaming',
        description: 'Your premium destination for movies and TV shows',
        url: 'https://cinevista.online',
        siteName: 'CineVista',
        images: [
            {
                url: '/opengraph-image.jpg',
                width: 1200,
                height: 630,
                alt: 'CineVista - Premium Streaming',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CineVista - Premium Streaming',
        description: 'Your premium destination for movies and TV shows',
        images: ['/opengraph-image.jpg'],
    },
};

const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'CineVista',
    'url': 'https://cinevista.online',
    'logo': 'https://cinevista.online/icon.svg',
    'description': 'CineVista is a premium free streaming guide for movies, TV series, Pakistani dramas, Bollywood, Turkish series, and Korean dramas.',
    'sameAs': [],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
                />
            </head>
            <body className={`${inter.className} antialiased`}>
                <GoogleAnalytics />
                {children}
                <MobileNav />
            </body>
        </html>
    );
}
