'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight, Star, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/app/page';
import { BACKDROP_PLACEHOLDER } from '@/lib/placeholders';

export default function HeroSection({ movies }: { movies: Movie[] }) {
    const [index, setIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const next = useCallback(() => setIndex((i: number) => (i + 1) % movies.length), [movies.length]);
    const prev = useCallback(() => setIndex((i: number) => (i - 1 + movies.length) % movies.length), [movies.length]);

    useEffect(() => {
        if (isHovered) return;
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, [next, isHovered]);

    if (!movies.length) return null;
    const movie = movies[index];
    const mediaType = movie.type === 'tv' || movie.type === 'tv_series' ? 'tv' : 'movie';

    return (
        <section
            className="relative min-h-[85vh] md:h-screen w-full overflow-hidden bg-black flex flex-col justify-end pt-24 md:pt-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Images */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                        className="absolute inset-0"
                    >
                        <motion.img
                            src={movie.backdropPath}
                            alt=""
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1.0 }}
                            transition={{ duration: 8, ease: 'easeOut' }}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = BACKDROP_PLACEHOLDER;
                                target.onerror = null;
                            }}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/20 to-transparent z-10" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)] opacity-55 z-10" />
            </div>

            {/* Layout Container — Restricts content AND controls to the max-w-[1600px] box */}
            <div className="relative z-20 w-full md:h-full max-w-[1600px] mx-auto px-6 md:px-12 flex flex-col justify-end pb-28 sm:pb-24 md:pb-28 pt-24 md:pt-0">
                
                {/* Main Hero Metadata & Details */}
                <div className="max-w-2xl mb-8 md:mb-0">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Poster preview on mobile/tablet */}
                            <div className="md:hidden flex justify-center mb-6">
                                <div className="relative w-32 aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.6)] border border-white/10">
                                    <img
                                        src={movie.posterPath}
                                        alt=""
                                        className="w-full h-full object-cover animate-fade-in"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = BACKDROP_PLACEHOLDER;
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Badges/Meta */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-5">
                                <span className="bg-accent-orange text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-[0_2px_10px_rgba(232,124,0,0.3)]">
                                    {movie.type === 'tv_series' ? 'TV Series' : 'Movie'}
                                </span>
                                {movie.genres?.slice(0, 2).map(g => (
                                    <span key={g} className="bg-white/10 backdrop-blur-md text-white/90 text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                                        {g}
                                    </span>
                                ))}
                                {movie.rating > 0 && (
                                    <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-400 text-[9px] font-black px-3 py-1 rounded-full border border-yellow-500/20">
                                        <Star className="w-2.5 h-2.5 fill-current" />
                                        {movie.rating.toFixed(1)}
                                    </span>
                                )}
                                {movie.releaseDate && (
                                    <span className="flex items-center gap-1 text-white/50 text-[9px] font-black tracking-widest">
                                        <Clock className="w-2.5 h-2.5" />
                                        {movie.releaseDate.split('-')[0]}
                                    </span>
                                )}
                            </div>

                            {/* Heading */}
                            <h1 
                                className="text-3xl sm:text-6xl lg:text-7xl font-extrabold text-white uppercase tracking-tight mb-5 leading-[0.95] text-center md:text-left"
                                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
                            >
                                {movie.title}
                            </h1>

                            {/* Plot */}
                            <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-lg mb-8 font-medium line-clamp-3 text-center md:text-left mx-auto md:mx-0">
                                {movie.overview}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Link
                                    href={`/watch/${movie.id}?type=${mediaType}`}
                                    className="group bg-white hover:bg-accent-orange text-black hover:text-white px-8 md:px-10 py-3.5 md:py-4.5 rounded-full font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_20px_rgba(232,124,0,0.3)] duration-300"
                                >
                                    <Play className="fill-current w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                    Watch Now
                                </Link>
                                <Link
                                    href={`/watch/${movie.id}?type=${mediaType}`}
                                    className="bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md text-white px-8 md:px-10 py-3.5 md:py-4.5 rounded-full font-black uppercase tracking-widest text-[10px] md:text-[11px] transition-all active:scale-95 flex items-center justify-center gap-2.5 duration-300"
                                >
                                    <Info className="w-3.5 h-3.5" />
                                    More Info
                                </Link>
                                <Link
                                    href="/recommend"
                                    className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/20 backdrop-blur-md text-purple-300 px-6 py-3.5 rounded-full font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 flex items-center justify-center gap-2 duration-300"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                                    AI Picks
                                </Link>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Sleek Bottom-Right Navigation & Carousel Preview — Aligned to the absolute container edges within max-w-1600 */}
                <div className="absolute bottom-16 sm:bottom-24 md:bottom-28 right-6 md:right-12 z-30 flex items-center gap-6">
                    {/* Micro preview thumbnails */}
                    <div className="hidden lg:flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/5 p-2 rounded-2xl">
                        {movies.slice(0, 5).map((m, i) => (
                            <button
                                key={m.id}
                                onClick={() => setIndex(i)}
                                className={`relative w-12 aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 ${i === index ? 'ring-2 ring-accent-orange scale-105' : 'opacity-40 hover:opacity-80'}`}
                            >
                                <img src={m.posterPath} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>

                    {/* Direction Arrows */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prev}
                            className="p-3 rounded-full bg-white/5 hover:bg-accent-orange border border-white/10 hover:border-transparent text-white transition-all active:scale-90 shadow-lg"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={next}
                            className="p-3 rounded-full bg-white/5 hover:bg-accent-orange border border-white/10 hover:border-transparent text-white transition-all active:scale-90 shadow-lg"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </section>
    );
}
