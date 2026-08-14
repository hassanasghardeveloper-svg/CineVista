'use client';

import { useRef } from 'react';
import { useEmbedProgress } from '@/lib/useEmbedProgress';

export type StreamServer = 'vidsrc' | 'smashy' | 'cineverse' | 'nxsha' | 'screenscape' | 'nhdapi' | 'peachify';

interface EmbedPlayerProps {
    server: StreamServer;
    tmdbId?: number | string;
    imdbId?: string | null;
    type: 'movie' | 'tv';
    season?: number | string;
    episode?: number | string;
    onProgress?: (progress: number) => void;
}

export default function EmbedPlayer({
    server,
    tmdbId,
    imdbId,
    type,
    season = 1,
    episode = 1,
    onProgress,
}: EmbedPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEmbedProgress(iframeRef, onProgress);

    const id = tmdbId || imdbId;
    if (!id) {
        return <div className="p-10 text-center text-white/40">No ID provided</div>;
    }

    let embedUrl = '';

    switch (server) {
        case 'vidsrc':
            if (type === 'movie') {
                embedUrl = `https://vidsrc.cc/v2/embed/movie/${tmdbId}`;
            } else {
                embedUrl = `https://vidsrc.cc/v2/embed/tv/${tmdbId}/${season}/${episode}`;
            }
            break;
        case 'smashy':
            if (type === 'movie') {
                embedUrl = `https://player.smashy.stream/movie/${tmdbId}`;
            } else {
                embedUrl = `https://player.smashy.stream/tv/${tmdbId}?s=${season}&e=${episode}`;
            }
            break;
        case 'cineverse':
            if (type === 'movie') {
                embedUrl = `https://cineverse.modiplay.xyz/embed/imdb/movie?id=${imdbId || tmdbId}`;
            } else {
                embedUrl = `https://rozgarlelo.modiplay.xyz/embed/tmdb/tv?id=${tmdbId}&s=${season}&e=${episode}`;
            }
            break;
        case 'nxsha':
            if (type === 'movie') {
                embedUrl = `https://web.nxsha.app/embed/movie/${tmdbId || imdbId}`;
            } else {
                embedUrl = `https://web.nxsha.app/embed/tv/${tmdbId}/${season}/${episode}`;
            }
            break;
        case 'screenscape':
            if (type === 'movie') {
                embedUrl = `https://screenscape.me/embed?imdb=${imdbId || tmdbId}&type=movie&lan=hindi`;
            } else {
                embedUrl = `https://screenscape.me/embed?tmdb=${tmdbId}&type=tv&s=${season}&e=${episode}&lan=hindi`;
            }
            break;
        case 'nhdapi':
            if (type === 'movie') {
                embedUrl = `https://nhdapi.com/embed/movie/${tmdbId}?autoplay`;
            } else {
                embedUrl = `https://nhdapi.com/embed/tv/${tmdbId}/${season}/${episode}?autoplay`;
            }
            break;
        case 'peachify':
            if (type === 'movie') {
                embedUrl = `https://peachify.top/embed/movie/${tmdbId}`;
            } else {
                embedUrl = `https://peachify.top/embed/tv/${tmdbId}/${season}/${episode}?dub=Hindi&sub=English`;
            }
            break;
        default:
            embedUrl = '';
    }

    if (!embedUrl) {
        return <div className="p-10 text-center text-white/40">Invalid Server Selection</div>;
    }

    // Peachify requires sandboxing to be disabled to initialize its player.
    const sandboxValue = server === 'peachify' ? undefined : "allow-scripts allow-same-origin allow-forms";

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
                sandbox={sandboxValue}
                title={`Stream Player - Server ${server}`}
            />
        </div>
    );
}
