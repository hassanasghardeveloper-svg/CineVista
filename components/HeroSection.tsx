'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Movie } from '@/app/page'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroSectionProps {
    movies: Movie[]
}

export default function HeroSection({ movies }: HeroSectionProps) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState(0) // -1 for left, 1 for right

    const slideNext = useCallback(() => {
        setDirection(1)
        setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, [movies.length])

    const slidePrev = useCallback(() => {
        setDirection(-1)
        setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
    }, [movies.length])

    useEffect(() => {
        const timer = setInterval(slideNext, 8000)
        return () => clearInterval(timer)
    }, [slideNext])

    const currentMovie = movies[currentIndex]
    const backdropUrl = currentMovie.backdropPath
        ? (currentMovie.backdropPath.startsWith('http') ? currentMovie.backdropPath : `https://image.tmdb.org/t/p/original${currentMovie.backdropPath}`)
        : '/placeholder-backdrop.jpg'

    const variants = {
        enter: (direction: number) => ({
            opacity: 0,
            scale: 1.1,
            x: direction > 0 ? 100 : -100,
        }),
        center: {
            zIndex: 1,
            opacity: 1,
            scale: 1,
            x: 0,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            opacity: 0,
            scale: 0.9,
            x: direction < 0 ? 100 : -100,
        })
    }

    return (
        <section className="relative h-screen w-full overflow-hidden bg-black">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.6 },
                        scale: { duration: 0.8 }
                    }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${backdropUrl})` }}
                    >
                        {/* Immersive Overlays */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent shadow-[inset_0_-100px_100px_rgba(0,0,0,0.8)]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex items-center pt-20">
                        <div className="max-w-[1600px] mx-auto px-6 md:px-12 w-full">
                            <div className="max-w-2xl">
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                >
                                    {/* Subtitle / Badge */}
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-[#e87c00] text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase">
                                            Featured
                                        </span>
                                        <span className="text-zinc-400 text-sm font-medium">
                                            {currentMovie.releaseDate.split('-')[0]} • Movie
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h1 className="text-4xl sm:text-6xl md:text-8xl font-black mb-4 md:mb-6 leading-[0.9] text-white tracking-tighter drop-shadow-2xl">
                                        {currentMovie.title}
                                    </h1>

                                    {/* Overview */}
                                    <p className="text-base md:text-xl text-zinc-300 mb-6 md:mb-8 line-clamp-2 md:line-clamp-3 leading-relaxed max-w-xl drop-shadow-md">
                                        {currentMovie.overview || 'Experience the cinema at CineVault. Watch now in stunning high quality.'}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex flex-wrap items-center gap-3 md:gap-4">
                                        <Link
                                            href={`/watch/${currentMovie.id}`}
                                            className="group flex items-center gap-2 md:gap-3 bg-white text-black px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-sm md:text-lg transition-all hover:bg-[#e87c00] hover:text-white hover:scale-105 active:scale-95 shadow-2xl"
                                        >
                                            <Play className="fill-current w-4 h-4 md:w-6 md:h-6" />
                                            Play Now
                                        </Link>
                                        <button className="group flex items-center gap-2 md:gap-3 bg-white/10 backdrop-blur-md text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-sm md:text-lg border border-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                                            <Info className="w-4 h-4 md:w-6 md:h-6" />
                                            More Info
                                        </button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Smaller on mobile */}
            <div className="absolute inset-y-0 left-2 md:left-4 z-20 flex items-center">
                <button
                    onClick={slidePrev}
                    className="p-2 md:p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-[#e87c00] hover:border-transparent transition-all group"
                >
                    <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 transition-transform group-hover:-translate-x-1" />
                </button>
            </div>
            <div className="absolute inset-y-0 right-2 md:right-4 z-20 flex items-center">
                <button
                    onClick={slideNext}
                    className="p-2 md:p-3 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 text-white hover:bg-[#e87c00] hover:border-transparent transition-all group"
                >
                    <ChevronRight className="w-4 h-4 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
                </button>
            </div>

            {/* Premium Pagination Dock - Centered & Modern */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-3 px-6 py-3 bg-black/20 backdrop-blur-xl rounded-full border border-white/5 shadow-2xl">
                    {movies.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1)
                                setCurrentIndex(index)
                            }}
                            className="relative group h-6 flex items-center"
                        >
                            <div className={`h-[3px] transition-all duration-700 ease-in-out rounded-full overflow-hidden ${index === currentIndex ? 'w-12 bg-white/20' : 'w-6 bg-white/10 group-hover:bg-white/20'
                                }`}>
                                {index === currentIndex && (
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 8, ease: "linear" }}
                                        className="h-full bg-[#e87c00] shadow-[0_0_15px_rgba(232,124,0,0.9)]"
                                    />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Bottom Blur Transition to Content */}
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-10" />
        </section>
    )
}
