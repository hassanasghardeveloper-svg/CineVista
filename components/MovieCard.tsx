'use client';

import Link from 'next/link';
import { Star, Play } from 'lucide-react';
import { Movie } from '@/app/page';

export default function MovieCard({ movie }: { movie: Movie }) {
    return (
        <Link
            href={`/watch/${movie.id}`}
            className="group relative block aspect-[2/3] w-full bg-dark-800 rounded-lg md:rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-accent-orange/10"
        >
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${movie.posterPath})` }}
            />

            {/* Premium Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="absolute inset-0 flex flex-col justify-end p-4 md:p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-3 md:p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-95 group-hover:scale-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="bg-accent-orange text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded text-white uppercase">
                            {movie.type === 'tv_series' ? 'TV' : 'HD'}
                        </span>
                        {movie.rating > 0 && (
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
                        <span>{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
                        {movie.genres && movie.genres[0] && (
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
