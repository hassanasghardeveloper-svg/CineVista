'use client';

import { useRef } from 'react';

interface VidlinkPlayerProps {
    tmdbId?: number | string;
    imdbId?: string;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
    color?: string;
    onProgress?: (progress: number) => void;
    autoplay?: boolean;
}

export default function VidlinkPlayer({
    tmdbId,
    imdbId,
    type,
    season = 1,
    episode = 1,
}: VidlinkPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Use 2embed - reliable embed source
    const id = tmdbId || imdbId;

    if (!id) return <div className="p-10 text-center text-white/40">No ID provided</div>;

    let embedUrl = '';
    if (type === 'movie') {
        embedUrl = `https://www.2embed.cc/embed/${tmdbId || imdbId}`;
    } else {
        embedUrl = `https://www.2embed.cc/embedtv/${tmdbId || imdbId}&s=${season}&e=${episode}`;
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
                title={`Stream Player 2 - ${type === 'movie' ? 'Movie' : 'TV Series'}`}
            />
        </div>
    );
}
