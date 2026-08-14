import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import MobileNav from '@/components/MobileNav';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'CineVault - Premium Streaming',
    description: 'Your premium destination for movies and TV shows',
    metadataBase: new URL('https://cinevault.vercel.app'),
    icons: {
        icon: '/icon.svg',
        apple: '/apple-icon.svg',
    },
    openGraph: {
        title: 'CineVault - Premium Streaming',
        description: 'Your premium destination for movies and TV shows',
        url: 'https://cinevault.vercel.app',
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
