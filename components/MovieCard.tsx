'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Movie } from '@/app/page'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, Star } from 'lucide-react'

interface MovieCardProps {
    movie: Movie
    isDimmed?: boolean
    onHoverStart?: () => void
    onHoverEnd?: () => void
}

export default function MovieCard({ movie, isDimmed, onHoverStart, onHoverEnd }: MovieCardProps) {
    const [isHovered, setIsHovered] = useState(false)

    const posterUrl = movie.posterPath
        ? (movie.posterPath.startsWith('http') ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.posterPath}`)
        : '/placeholder-poster.jpg'

    const year = movie.releaseDate?.split('-')[0] || '2024'

    return (
        <div className="flex-shrink-0 relative py-6 px-2 overflow-visible">
            <motion.div
                onMouseEnter={() => {
                    setIsHovered(true)
                    onHoverStart?.()
                }}
                onMouseLeave={() => {
                    setIsHovered(false)
                    onHoverEnd?.()
                }}
                whileHover={{
                    scale: 1.05,
                    y: -8,
                }}
                transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25
                }}
                className={`w-[180px] md:w-[220px] aspect-[2/3] relative rounded-lg group cursor-pointer obsidian-halo transition-all duration-700 ${isDimmed ? 'opacity-20 grayscale scale-95' : 'opacity-100'
                    }`}
            >
                {/* Main Image Container */}
                <div className="absolute inset-0 bg-zinc-900 rounded-lg overflow-hidden border border-white/5">
                    <Link href={`/watch/${movie.id}`}>
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            className="w-full h-full object-cover transition-all duration-700 group-hover:brightness-[0.4] group-hover:scale-105"
                            loading="lazy"
                        />
                    </Link>

                    {/* Light Sweep Shimmer */}
                    <div className="obsidian-shimmer pointer-events-none" />

                    {/* Inner Content Reveal */}
                    <AnimatePresence>
                        {isHovered && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4 }}
                                className="absolute inset-0 z-30 p-5 flex flex-col justify-end pointer-events-none"
                            >
                                <motion.div
                                    initial={{ y: 10 }}
                                    animate={{ y: 0 }}
                                    className="pointer-events-auto"
                                >
                                    {/* Minimal Title */}
                                    <h3 className="text-white font-bold text-sm mb-1 uppercase tracking-wider">
                                        {movie.title}
                                    </h3>

                                    {/* Ratings & Year */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-2.5 h-2.5 text-[#e87c00] fill-current" />
                                            <span className="text-zinc-200 text-[10px] font-bold">{movie.rating.toFixed(1)}</span>
                                        </div>
                                        <span className="text-zinc-500 text-[10px]">{year}</span>
                                    </div>

                                    {/* Action Row */}
                                    <div className="flex items-center gap-3">
                                        <Link
                                            href={`/watch/${movie.id}`}
                                            className="px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-black uppercase hover:bg-[#e87c00] hover:text-white transition-colors duration-300"
                                        >
                                            Play
                                        </Link>
                                        <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/10">
                                            <Info className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Subtle Quality Badge */}
                <div className="absolute top-2 right-2 z-40 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[9px] font-black text-zinc-500 tracking-tighter">PREMIUM</span>
                </div>
            </motion.div>
        </div>
    )
}
