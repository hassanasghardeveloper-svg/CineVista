'use client';

import { useState } from 'react';
import { Play, Info, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Movie } from '@/app/page';

export default function MovieCard({ movie }: { movie: Movie }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="flex-shrink-0 w-48 md:w-56 group cursor-pointer"
        >
            <Link href={`/watch/${movie.id}`}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/5 mb-3 bg-zinc-900">
                    <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:brightness-50"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
                            <Play className="fill-current w-6 h-6 ml-1" />
                        </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent-orange fill-current" />
                        <span className="text-[10px] font-bold text-white">{movie.rating.toFixed(1)}</span>
                    </div>
                </div>
                <h3 className="text-white text-sm font-bold truncate group-hover:text-accent-orange transition-colors">
                    {movie.title}
                </h3>
                <p className="text-zinc-500 text-[10px] mt-1 uppercase font-bold tracking-widest">
                    {movie.releaseDate.split('-')[0]}
                </p>
            </Link>
        </motion.div>
    );
}
