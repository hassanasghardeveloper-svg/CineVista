'use client';

import { useRef } from 'react';

interface VidsrcPlayerProps {
    tmdbId?: number | string;
    imdbId?: string;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
    color?: string; // Hex color
}

export default function VidsrcPlayer({
    tmdbId,
    imdbId,
    type,
    season = 1,
    episode = 1,
    color = 'f97316' // orange
}: VidsrcPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Vidsrc typically follows this format:
    // https://vidsrc.me/embed/movie?tmdb=TMDB_ID or ?imdb=IMDB_ID
    const baseUrl = 'https://vidsrc.me/embed';

    let embedUrl = '';
    if (type === 'movie') {
        const idParam = tmdbId ? `tmdb=${tmdbId}` : `imdb=${imdbId}`;
        embedUrl = `${baseUrl}/movie?${idParam}`;
    } else {
        const idParam = tmdbId ? `tmdb=${tmdbId}` : `imdb=${imdbId}`;
        embedUrl = `${baseUrl}/tv?${idParam}&season=${season}&episode=${episode}`;
    }

    // Add UI customization if supported
    if (color) {
        embedUrl += `&color=${color.replace('#', '')}`;
    }

    if (!tmdbId && !imdbId) {
        return (
            <div className="w-full aspect-video bg-black rounded-xl flex items-center justify-center border border-white/10">
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No Streaming ID Available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <iframe
                ref={iframeRef}
                src={embedUrl}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="no-referrer"
                loading="lazy"
                title={`Vidsrc Player - ${type === 'movie' ? 'Movie' : 'TV Series'}`}
            />
        </div>
    );
}
