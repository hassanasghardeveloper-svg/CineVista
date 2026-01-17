'use client';

import { useEffect, useRef } from 'react';

interface VidkingPlayerProps {
    tmdbId?: number | string;
    imdbId?: string;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
    theme?: string; // Hex color
    onProgress?: (progress: number) => void;
    autoplay?: boolean;
}

export default function VidkingPlayer({
    tmdbId,
    imdbId,
    type,
    season = 1,
    episode = 1,
    theme = '#00d1ff',
    onProgress,
    autoplay = true
}: VidkingPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // Recommendation: Check event.origin for security
            if (event.origin !== 'https://vidking.net') return;

            const data = event.data;

            // Check if data contains progress information
            // According to documentation, data includes: progress, time, duration, etc.
            if (data && typeof data.progress !== 'undefined') {
                if (onProgress) {
                    onProgress(data.progress);
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [onProgress]);

    const baseUrl = 'https://vidking.net/embed';
    const id = tmdbId || imdbId;

    if (!id) return <div className="p-10 text-center text-white/40">No ID provided</div>;

    const embedUrl = type === 'movie'
        ? `${baseUrl}/movie/${id}`
        : `${baseUrl}/tv/${id}/${season}/${episode}`;

    const params = new URLSearchParams();
    if (autoplay) params.append('autoplay', '1');
    if (theme) params.append('theme', theme);

    const finalUrl = `${embedUrl}?${params.toString()}`;

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <iframe
                ref={iframeRef}
                src={finalUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                referrerPolicy="origin"
                title={`Vidking Player - ${type === 'movie' ? 'Movie' : 'TV Series'}`}
            />
        </div>
    );
}
