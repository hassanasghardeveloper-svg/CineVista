'use client';

import MovieCard from './MovieCard';
import { Movie } from '@/app/page';

export default function MovieRow({ title, movies }: { title: string; movies: Movie[] }) {
    if (movies.length === 0) return null;

    return (
        <section className="px-6 md:px-12">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 mb-6 flex items-center gap-4">
                {title}
                <div className="h-[1px] flex-1 bg-white/5" />
            </h2>
            <div className="relative group/row">
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 hide-scrollbar scroll-smooth">
                    {movies.map(movie => (
                        <div key={movie.id} className="min-w-[160px] md:min-w-[240px] transition-transform duration-300 hover:scale-105 active:scale-95">
                            <MovieCard movie={movie} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
