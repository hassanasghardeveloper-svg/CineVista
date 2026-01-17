'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Calendar, ShieldCheck, Server, AlertCircle, X } from 'lucide-react'
import { Movie } from '@/app/page'

const SERVERS = [
    { id: 'alpha', name: 'Server Alpha', provider: 'Embed-API', icon: '🚀', quality: '4K', url: (id: number) => `https://player.embed-api.stream/?id=${id}` },
    { id: 'beta', name: 'Server Beta', provider: 'Vidsrc', icon: '⚡', quality: '1080p', url: (id: number) => `https://vidsrc.to/embed/movie/${id}` },
    { id: 'gamma', name: 'Server Gamma', provider: 'SuperEmbed', icon: '💎', quality: 'Auto', url: (id: number) => `https://multiembed.mov/directstream.php?video_id=${id}&tmdb=1` }
]

export default function WatchPage() {
    const params = useParams()
    const router = useRouter()
    const [movie, setMovie] = useState<Movie | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [selectedServer, setSelectedServer] = useState(SERVERS[0])
    const [showAdTip, setShowAdTip] = useState(true)

    useEffect(() => {
        const saved = localStorage.getItem('cinevault_movies')
        if (saved) {
            const movies: Movie[] = JSON.parse(saved)
            const found = movies.find(m => m.id === params.id)
            if (found) {
                setMovie(found)
            }
        }
        setIsLoading(false)
    }, [params.id])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#e87c00]/20 border-t-[#e87c00] rounded-full animate-spin" />
            </div>
        )
    }

    if (!movie) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-6">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Movie Not Found</h1>
                <Link href="/" className="px-8 py-3 bg-[#e87c00] text-white rounded-full font-bold hover:scale-110 transition-transform">
                    Back to Cinema
                </Link>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
            {/* Top Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-wider">Back</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-[#46d369]/10 border border-[#46d369]/20">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#46d369]" />
                        <span className="text-[10px] font-bold text-[#46d369] uppercase tracking-widest">Secure Connection</span>
                    </div>
                </div>
            </nav>

            {/* Video Player Section */}
            <section className="relative w-full h-[70vh] md:h-[85vh] pt-24 px-4 md:px-12 lg:px-24 flex flex-col items-center">
                <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black shadow-[0_0_100px_rgba(232,124,0,0.15)] group">
                    <iframe
                        key={selectedServer.id}
                        src={selectedServer.url(movie.tmdbId)}
                        className="w-full h-full border-0"
                        allowFullScreen
                        allow="autoplay; encrypted-media"
                    />

                    {/* Ambient Glow behind player */}
                    <div className="absolute -inset-20 bg-[#e87c00]/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                </div>

                {/* Server Switcher Dock - Scrollable on mobile */}
                <div className="mt-8 flex items-center gap-2 md:gap-3 p-1.5 bg-white/5 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl max-w-full overflow-x-auto hide-scrollbar">
                    <div className="px-3 md:px-4 flex items-center gap-2 border-r border-white/10 mr-1 md:mr-2 flex-shrink-0">
                        <Server className="w-3 md:w-4 h-3 md:h-4 text-zinc-500" />
                        <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tighter text-zinc-400">Servers</span>
                    </div>
                    {SERVERS.map((server) => (
                        <button
                            key={server.id}
                            onClick={() => setSelectedServer(server)}
                            className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-xl transition-all duration-500 relative group flex-shrink-0 ${selectedServer.id === server.id
                                ? 'bg-[#e87c00] text-white shadow-lg shadow-[#e87c00]/20'
                                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                }`}
                        >
                            <span className="text-base md:text-lg">{server.icon}</span>
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-0.5">{server.name}</span>
                                <span className={`text-[7px] md:text-[8px] font-medium opacity-50 ${selectedServer.id === server.id ? 'text-white' : 'text-zinc-500'}`}>
                                    {server.provider}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            {/* Ad-Tip Overlay */}
            <AnimatePresence>
                {showAdTip && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-md p-4 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#e87c00]/20 flex items-center justify-center flex-shrink-0">
                                <AlertCircle className="w-5 h-5 text-[#e87c00]" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold uppercase tracking-wider text-white">Clean Mode Hack</h4>
                                    <button onClick={() => setShowAdTip(false)} className="text-zinc-500 hover:text-white transition-colors">
                                        <X size={16} />
                                    </button>
                                </div>
                                <p className="text-xs text-zinc-400 leading-relaxed">
                                    Free servers use popups to survive. <span className="text-white font-bold underline">Click twice</span>:
                                    the 1st click triggers the popup (close it), the 2nd click starts the movie!
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Movie Details Section */}
            <section className="max-w-[1200px] mx-auto py-8 md:py-16 px-6 md:px-8 mt-12 flex flex-col md:flex-row gap-8 md:gap-12 relative z-10">
                {/* Poster Side */}
                <div className="hidden md:block w-64 flex-shrink-0">
                    <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/5 obsidian-halo">
                        <img
                            src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Info Side */}
                <div className="flex-1 space-y-8 text-left">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4"
                        >
                            {movie.title}
                        </motion.h1>

                        <div className="flex flex-wrap items-center gap-6 text-zinc-400">
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-[#e87c00] fill-current" />
                                <span className="text-white font-bold">{movie.rating.toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm uppercase tracking-widest">
                                <Calendar className="w-4 h-4" />
                                <span>{movie.releaseDate?.split('-')[0]}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-[#e87c00]">Overview</h3>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl">
                            {movie.overview}
                        </p>
                    </div>
                </div>
            </section>

            {/* Background Decorative Element */}
            <div className="fixed top-0 right-0 w-[50vw] h-screen bg-gradient-to-l from-[#e87c00]/[0.02] to-transparent pointer-events-none -z-10" />
        </main>
    )
}
