'use client';

import { useRef } from 'react';

interface VidsrcPlayerProps {
    tmdbId?: number | string;
    imdbId?: string;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
    color?: string;
}

export default function VidsrcPlayer({
    tmdbId,
    imdbId,
    type,
    season = 1,
    episode = 1,
}: VidsrcPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Use vidsrc.xyz - Alternative server for Asian content
    if (!tmdbId && !imdbId) {
        return (
            <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center border border-white/10">
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No Streaming ID Available</p>
            </div>
        );
    }

    let embedUrl = '';
    if (type === 'movie') {
        embedUrl = `https://vidsrc.xyz/embed/movie/${tmdbId}`;
    } else {
        embedUrl = `https://vidsrc.xyz/embed/tv/${tmdbId}/${season}/${episode}`;
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
                title={`Asian Server - ${type === 'movie' ? 'Movie' : 'TV Series'}`}
            />
        </div>
    );
}
