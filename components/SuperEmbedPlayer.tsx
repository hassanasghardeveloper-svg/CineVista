'use client';

import { useRef } from 'react';

interface SuperEmbedPlayerProps {
    tmdbId?: number | string;
    imdbId?: string;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
}

export default function SuperEmbedPlayer({
    tmdbId,
    imdbId,
    type,
    season = 1,
    episode = 1,
}: SuperEmbedPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // VidSrc.me - Good for regional content including Bollywood
    const id = tmdbId || imdbId;

    if (!id) return <div className="p-10 text-center text-white/40">No ID provided</div>;

    let embedUrl = '';
    if (type === 'movie') {
        embedUrl = `https://vidsrc.me/embed/movie?tmdb=${tmdbId}`;
    } else {
        embedUrl = `https://vidsrc.me/embed/tv?tmdb=${tmdbId}&season=${season}&episode=${episode}`;
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
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-presentation allow-popups-to-escape-sandbox"
                title={`South Asian Player - ${type === 'movie' ? 'Movie' : 'TV Series'}`}
            />
        </div>
    );
}
