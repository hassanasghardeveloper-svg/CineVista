'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '@/app/page';

export default function HeroSection({ movies }: { movies: Movie[] }) {
    const [index, setIndex] = useState(0);

    const next = useCallback(() => setIndex(i => (i + 1) % movies.length), [movies.length]);
    const prev = useCallback(() => setIndex(i => (i - 1 + movies.length) % movies.length), [movies.length]);

    useEffect(() => {
        const timer = setInterval(next, 10000);
        return () => clearInterval(timer);
    }, [next]);

    const movie = movies[index];

    return (
        <section className="relative h-[90vh] w-full overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${movie.backdropPath})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-transparent to-transparent" />
                    </div>

                    <div className="relative h-full flex flex-col justify-center px-6 md:px-12 max-w-4xl">
                        <motion.span
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-accent-orange text-xs font-black uppercase tracking-[0.3em] mb-4 block"
                        >
                            Featured Spotlight
                        </motion.span>
                        <motion.h1
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-6 leading-none"
                        >
                            {movie.title}
                        </motion.h1>
                        <motion.p
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-zinc-400 text-lg md:text-xl line-clamp-2 max-w-xl mb-10 leading-relaxed"
                        >
                            {movie.overview}
                        </motion.p>
                        <motion.div
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-4"
                        >
                            <Link
                                href={`/watch/${movie.id}`}
                                className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-accent-orange hover:text-white transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                            >
                                <Play className="fill-current w-4 h-4" />
                                Play Now
                            </Link>
                            <button className="bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all flex items-center gap-3">
                                <Info className="w-4 h-4" />
                                Details
                            </button>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-12 right-12 flex items-center gap-4 z-20">
                <button onClick={prev} className="p-4 rounded-full bg-black/40 border border-white/10 text-white hover:bg-accent-orange transition-all">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={next} className="p-4 rounded-full bg-black/40 border border-white/10 text-white hover:bg-accent-orange transition-all">
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </section>
    );
}
