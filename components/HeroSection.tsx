'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/app/page';

export default function HeroSection({ movies }: { movies: Movie[] }) {
    const [index, setIndex] = useState(0);

    const next = useCallback(() => setIndex((i: number) => (i + 1) % movies.length), [movies.length]);
    const prev = useCallback(() => setIndex((i: number) => (i - 1 + movies.length) % movies.length), [movies.length]);

    useEffect(() => {
        const timer = setInterval(next, 8000);
        return () => clearInterval(timer);
    }, [next]);

    if (!movies.length) return null;
    const movie = movies[index];

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] scale-105"
                        style={{ backgroundImage: `url(${movie.backdropPath})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40" />
                    </div>

                    <div className="relative h-full flex flex-col justify-end pb-24 md:pb-32 px-6 md:px-16 max-w-[1600px] mx-auto">
                        <div className="max-w-3xl">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex items-center gap-3 mb-6"
                            >
                                <span className="bg-accent-orange text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">
                                    {movie.type === 'tv_series' ? 'TV Series' : 'Movie'}
                                </span>
                                {movie.genres && movie.genres[0] && (
                                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                                        {movie.genres[0]}
                                    </span>
                                )}
                                {movie.rating > 0 && (
                                    <span className="text-accent-orange text-xs font-bold">
                                        ★ {movie.rating.toFixed(1)}
                                    </span>
                                )}
                            </motion.div>

                            <motion.h1
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-6 leading-[0.85]"
                            >
                                {movie.title}
                            </motion.h1>

                            <motion.p
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-white/60 text-lg md:text-xl line-clamp-3 max-w-xl mb-10 leading-relaxed font-medium"
                            >
                                {movie.overview}
                            </motion.p>

                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="flex items-center gap-4"
                            >
                                <Link
                                    href={`/watch/${movie.id}`}
                                    className="bg-white text-black px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-accent-orange hover:text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl shadow-white/10"
                                >
                                    <Play className="fill-current w-4 h-4" />
                                    Watch Now
                                </Link>
                                <button className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95">
                                    <Info className="w-4 h-4" />
                                    More Info
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Slider Navigation Controls */}
            <div className="absolute bottom-12 right-6 md:right-16 flex items-center gap-6 z-20">
                <div className="flex gap-2">
                    {movies.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            className={`h-1 transition-all duration-500 rounded-full ${i === index ? 'w-12 bg-accent-orange' : 'w-4 bg-white/20'}`}
                        />
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={prev} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-accent-orange transition-all active:scale-90">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={next} className="p-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-accent-orange transition-all active:scale-90">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
