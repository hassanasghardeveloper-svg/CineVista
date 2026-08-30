import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'CineVista – Free Movies & TV Streaming',
        short_name: 'CineVista',
        description: 'Stream free movies, TV shows, Pakistani dramas, Bollywood, Turkish series, and Korean dramas on CineVista.',
        start_url: '/',
        display: 'standalone',
        background_color: '#050505',
        theme_color: '#E87C00',
        icons: [
            {
                src: '/icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
            },
            {
                src: '/apple-icon.svg',
                sizes: 'any',
                type: 'image/svg+xml',
                purpose: 'maskable',
            },
        ],
    };
}
