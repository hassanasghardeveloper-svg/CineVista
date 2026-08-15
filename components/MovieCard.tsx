'use client';

import Link from 'next/link';
import { useState, useRef } from 'react';
import { Star, Play, Volume2, VolumeX } from 'lucide-react';
import { Movie } from '@/app/page';
import { POSTER_PLACEHOLDER } from '@/lib/placeholders';

export default function MovieCard({ movie }: { movie: Movie }) {
    const isPerson = movie.type === 'person';
    const mediaType = movie.type === 'tv' || movie.type === 'tv_series' ? 'tv' : 'movie';
    const href = isPerson ? `/artist/${movie.id}` : `/watch/${movie.id}?type=${mediaType}`;

    const badgeLabel = isPerson ? 'ARTIST' : (movie.type === 'tv' || movie.type === 'tv_series' ? 'TV' : 'HD');
    const badgeColor = isPerson ? 'bg-purple-600' : 'bg-accent-orange';

    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [loadingTrailer, setLoadingTrailer] = useState(false);
    const [muted, setMuted] = useState(true);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleMouseEnter = () => {
        if (isPerson || trailerKey) return;
        hoverTimerRef.current = setTimeout(async () => {
            setLoadingTrailer(true);
            try {
                const res = await fetch(`/api/trailer?id=${movie.id}&type=${mediaType}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.key) setTrailerKey(data.key);
                }
            } catch {
                // silent fail — show poster
            } finally {
                setLoadingTrailer(false);
            }
        }, 700);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        // Stop trailer when mouse leaves
        setTrailerKey(null);
        setLoadingTrailer(false);
    };

    return (
        <Link
            href={href}
            className="group relative block aspect-[2/3] w-full bg-dark-800 rounded-lg md:rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-accent-orange/10 hover:scale-[1.03] hover:z-10"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Poster Image */}
            <img
                src={movie.posterPath}
                alt={movie.title}
                className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${trailerKey ? 'opacity-0' : 'opacity-100 group-hover:scale-110'}`}
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = POSTER_PLACEHOLDER;
                    target.onerror = null;
                }}
            />

            {/* Trailer iframe (shown on hover after fetch) */}
            {trailerKey && (
                <div className="absolute inset-0 overflow-hidden">
                    <iframe
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&playlist=${trailerKey}&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&cc_load_policy=0`}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] pointer-events-none"
                        allow="autoplay; encrypted-media"
                        title={movie.title}
                    />
                    {/* Transparent overlay — blocks YouTube UI/title/logo */}
                    <div className="absolute inset-0 z-10" style={{ background: 'transparent' }} />
                </div>
            )}

            {/* Loading pulse */}
            {loadingTrailer && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Premium Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent transition-opacity duration-300 ${trailerKey ? 'opacity-30' : 'opacity-60 group-hover:opacity-100'}`} />

            {/* Mute toggle when trailer is playing */}
            {trailerKey && (
                <button
                    onClick={(e) => { e.preventDefault(); setMuted(m => !m); }}
                    className="absolute top-3 right-3 z-20 p-1.5 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-black/80 transition-all"
                >
                    {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
            )}

            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`${badgeColor} text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded text-white uppercase`}>
                            {badgeLabel}
                        </span>
                        {!isPerson && movie.rating > 0 && (
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-accent-orange fill-current" />
                                <span className="text-[10px] font-black text-white">{movie.rating.toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                    <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-tight line-clamp-1 mb-1">
                        {movie.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[8px] font-bold text-white/40 uppercase tracking-widest">
                        <span>{isPerson ? (movie.releaseDate || 'Actor') : (movie.releaseDate?.split('-')[0] || 'N/A')}</span>
                        {!isPerson && movie.genres && movie.genres[0] && (
                            <>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span>{movie.genres[0]}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white text-black p-2 rounded-full shadow-xl">
                    <Play className="w-3 h-3 fill-current" />
                </div>
            </div>
        </Link>
    );
}
