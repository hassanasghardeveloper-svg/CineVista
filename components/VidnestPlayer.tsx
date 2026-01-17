'use client';

import { useEffect, useRef } from 'react';

interface VidnestPlayerProps {
    tmdbId?: number | string;
    imdbId?: string;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
    color?: string; // Hex color for Vidnest
    onProgress?: (progress: number) => void;
    autoplay?: boolean;
}

export default function VidnestPlayer({
    tmdbId,
    imdbId,
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
            // Vidnest (VidLink) uses vidlink.pro
            if (event.origin !== 'https://vidlink.pro') return;

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

    const baseUrl = 'https://vidlink.pro/embed';
    const id = tmdbId || imdbId;

    if (!id) return <div className="p-10 text-center text-white/40">No ID provided</div>;

    const embedUrl = type === 'movie'
        ? `${baseUrl}/movie/${id}`
        : `${baseUrl}/tv/${id}/${season}/${episode}`;

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
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-downloads allow-pointer-lock"
                referrerPolicy="no-referrer"
                loading="lazy"
                title={`Vidnest Player - ${type === 'movie' ? 'Movie' : 'TV Series'}`}
            />
        </div>
    );
}
