'use client'

import { useRef, useState } from 'react'
import { Movie } from '@/app/page'
import MovieCard from './MovieCard'

interface MovieRowProps {
    title: string
    movies: Movie[]
}

export default function MovieRow({ title, movies }: MovieRowProps) {
    const rowRef = useRef<HTMLDivElement>(null)
    const [hoveredMovieId, setHoveredMovieId] = useState<number | string | null>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const scrollAmount = 420
            rowRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <section className="px-4 md:px-12 mb-6 md:mb-10">
            <div className="max-w-[1600px] mx-auto">
                {/* Title - simple like Thinkora */}
                <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>

                {/* Row Container */}
                <div className="relative group/row">
                    {/* Left Arrow - Hidden on mobile */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:bg-[#e87c00] hover:scale-110 active:scale-90"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Movies - horizontal scroll */}
                    <div
                        ref={rowRef}
                        className="flex gap-3 md:gap-2 overflow-x-auto hide-scrollbar py-6 md:py-10 px-0 md:px-4 scroll-smooth"
                    >
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                isDimmed={hoveredMovieId !== null && hoveredMovieId !== movie.id}
                                onHoverStart={() => setHoveredMovieId(movie.id)}
                                onHoverEnd={() => setHoveredMovieId(null)}
                            />
                        ))}
                    </div>

                    {/* Right Arrow - Hidden on mobile */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hidden md:flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all hover:bg-[#e87c00] hover:scale-110 active:scale-90"
                    >
                        <svg className="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </section>
    )
}
