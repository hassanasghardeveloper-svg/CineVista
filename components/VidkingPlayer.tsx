'use client';

import { useRef } from 'react';

interface VidkingPlayerProps {
    tmdbId?: number | string;
    imdbId?: string;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
    theme?: string;
    onProgress?: (progress: number) => void;
    autoplay?: boolean;
}

export default function VidkingPlayer({
    tmdbId,
    imdbId,
    type,
    season = 1,
    episode = 1,
}: VidkingPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Use vidsrc.xyz - reliable embed source
    const id = tmdbId || imdbId;

    if (!id) return <div className="p-10 text-center text-white/40">No ID provided</div>;

    let embedUrl = '';
    if (type === 'movie') {
        embedUrl = `https://vidsrc.xyz/embed/movie/${tmdbId || imdbId}`;
    } else {
        embedUrl = `https://vidsrc.xyz/embed/tv/${tmdbId || imdbId}/${season}/${episode}`;
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <iframe
                ref={iframeRef}
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                referrerPolicy="origin"
                loading="lazy"
                title={`Stream Player - ${type === 'movie' ? 'Movie' : 'TV Series'}`}
            />
        </div>
    );
}
