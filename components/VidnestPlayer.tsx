'use client';

import { useEffect, useRef } from 'react';

interface VidnestPlayerProps {
    tmdbId: number | string;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
    color?: string; // Hex color for Vidnest
    onProgress?: (progress: number) => void;
    autoplay?: boolean;
}

export default function VidnestPlayer({
    tmdbId,
    type,
    season = 1,
    episode = 1,
    color = '#f97316',
    onProgress,
    autoplay = true
}: VidnestPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Vidnest typically uses vidnest.net
            if (event.origin !== 'https://vidnest.net') return;

            const data = event.data;
            if (data && typeof data.progress !== 'undefined') {
                if (onProgress) {
                    onProgress(data.progress);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onProgress]);

    const baseUrl = 'https://vidnest.net/embed';
    const embedUrl = type === 'movie'
        ? `${baseUrl}/movie/${tmdbId}`
        : `${baseUrl}/tv/${tmdbId}/${season}/${episode}`;

    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    if (color) params.append('color', color.replace('#', '')); // Vidnest sometimes expects hex without #

    const finalUrl = `${embedUrl}?${params.toString()}`;

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <iframe
                ref={iframeRef}
                src={finalUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Vidnest Player - ${type === 'movie' ? 'Movie' : 'TV Series'}`}
            />
        </div>
    );
}
