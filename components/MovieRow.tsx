'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { Movie } from '@/app/page';

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(true);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const { clientWidth } = scrollRef.current;
        const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    };

    if (movies.length === 0) return null;

    return (
        <section className="px-6 md:px-12 relative group/row">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-4">
                {title}
                <div className="h-[1px] flex-1 bg-white/5" />
            </h2>

            <div className="relative">
                {/* Navigation Buttons - Laptop/PC Only */}
                {showLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-accent-orange transition-all active:scale-90 group-hover/row:opacity-100 opacity-0"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                )}

                {showRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white hover:bg-accent-orange transition-all active:scale-90 group-hover/row:opacity-100 opacity-0"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                )}

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scroll-smooth"
                >
                    {movies.map(movie => (
                        <div key={movie.id} className="min-w-[140px] md:min-w-[240px] transition-transform duration-300 hover:scale-105 active:scale-95">
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
