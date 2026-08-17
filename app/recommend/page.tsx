'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { Sparkles, Send, Film, Tv, Star, ChevronLeft, ChevronRight, Loader2, Bot, HelpCircle, RotateCcw, Play, ArrowRight } from 'lucide-react';
import { POSTER_PLACEHOLDER, BACKDROP_PLACEHOLDER } from '@/lib/placeholders';
import { motion, AnimatePresence } from 'framer-motion';

interface MovieResult {
    id: number;
    title: string;
    type: string;
    year: string;
    poster: string | null;
    backdrop: string | null;
    rating: number;
    overview: string;
}

const MOOD_PRESETS = [
    { label: '💔 Broken Heart', prompt: 'Emotional Pakistani romantic drama series' },
    { label: '🍿 Popcorn Thrills', prompt: 'High rated action thriller movies post 2021' },
    { label: '👻 Late Night Spooky', prompt: 'Scary horror movies with good plot twists' },
    { label: '🇰🇷 K-Drama Craze', prompt: 'Cute rom-com Korean drama series' },
    { label: '😂 Family Laughs', prompt: 'Bollywood comedy movies for family time' },
    { label: '🛡️ Historical Epic', prompt: 'Historical or action Turkish drama series' },
];

export default function RecommendPage() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [movies, setMovies] = useState<MovieResult[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [userQuery, setUserQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const activeMovie = movies[activeIndex];

    const generateRecommendation = async (queryText: string) => {
        const message = queryText.trim();
        if (!message || loading) return;

        setLoading(true);
        setError('');
        setUserQuery(message);

        try {
            const res = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, history: [] }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Request failed');
            }

            if (data.movies && data.movies.length > 0) {
                setMovies(data.movies);
                setActiveIndex(0);
            } else {
                setError('Kuch matching nahi mila. Try search query differently.');
            }
        } catch (err: any) {
            setError(err.message || 'Kuch error aaya, try again!');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            generateRecommendation(input);
        }
    };

    const reset = () => {
        setMovies([]);
        setInput('');
        setError('');
        setUserQuery('');
        setActiveIndex(0);
    };

    return (
        <main className="relative min-h-screen bg-black text-white overflow-hidden flex flex-col justify-between">
            <Header />

            {/* IMMERSIVE BACKDROP (Dynamic blurring background / Sharp Netflix backdrop) */}
            <div className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeMovie ? activeMovie.id : 'idle-bg'}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: movies.length > 0 ? 0.55 : 0.35 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0"
                    >
                        <img
                            src={activeMovie?.backdrop || BACKDROP_PLACEHOLDER}
                            alt=""
                            className={`w-full h-full object-cover transition-all duration-1000 ${
                                movies.length > 0 ? 'scale-100 blur-0' : 'scale-110 blur-[80px]'
                            }`}
                        />
                    </motion.div>
                </AnimatePresence>
                {/* Dark Vignette & radial mask for perfect readability */}
                <div className={`absolute inset-0 transition-all duration-1000 ${
                    movies.length > 0 
                        ? 'bg-gradient-to-r from-black via-black/85 to-transparent' 
                        : 'bg-gradient-to-t from-black via-black/60 to-black/80'
                }`} />
                <div className={`absolute inset-0 transition-all duration-1000 ${
                    movies.length > 0
                        ? 'bg-gradient-to-t from-black via-black/40 to-transparent'
                        : 'bg-[radial-gradient(circle_at_center,transparent_10%,black_90%)]'
                }`} />
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="relative z-10 flex-1 flex flex-col justify-center items-center w-full max-w-[1600px] mx-auto px-6 md:px-12 pt-28 pb-8">
                
                <AnimatePresence mode="wait">
                    {/* STATE A: IDLE (Prompt Orb & Input) */}
                    {movies.length === 0 && !loading && (
                        <motion.div
                            key="idle-state"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="w-full max-w-3xl flex flex-col items-center text-center space-y-12 py-12"
                        >
                            {/* Glowing AI Core */}
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-accent-orange via-purple-600 to-pink-500 animate-spin blur-2xl opacity-40 duration-10000" />
                                <div className="absolute inset-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center z-10 shadow-2xl">
                                    <Sparkles className="w-10 h-10 text-accent-orange animate-pulse" />
                                </div>
                            </div>

                            {/* Headline */}
                            <div className="space-y-3">
                                <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
                                    Describe Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-purple-500">Vibe Tonight</span>
                                </h1>
                                <p className="text-white/40 text-xs md:text-sm uppercase tracking-widest font-black">
                                    No genres, no filters. Describe what you feel in Urdu or English.
                                </p>
                            </div>

                            {/* Large Search Capsule */}
                            <div className="w-full max-w-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 focus-within:border-accent-orange/50 focus-within:shadow-[0_0_30px_rgba(232,124,0,0.15)] rounded-full p-2 flex items-center gap-2 transition-all duration-300">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. Acha horror web series recommend karo blockbusters mein se..."
                                    className="flex-1 bg-transparent text-sm sm:text-base font-bold text-white placeholder:text-white/20 focus:outline-none pl-6"
                                />
                                <button
                                    onClick={() => generateRecommendation(input)}
                                    disabled={!input.trim()}
                                    className="w-12 h-12 rounded-full bg-accent-orange hover:bg-amber-500 text-white flex items-center justify-center transition-all duration-300 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-accent-orange/20"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Suggested Vibes */}
                            <div className="space-y-4 w-full">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                                    Or Pick A Cosmic Direction
                                </span>
                                <div className="flex flex-wrap items-center justify-center gap-3 max-w-2xl mx-auto">
                                    {MOOD_PRESETS.map((m, i) => (
                                        <button
                                            key={i}
                                            onClick={() => generateRecommendation(m.prompt)}
                                            className="px-4 py-2 text-xs font-bold rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-white/5 hover:border-accent-orange/40 transition-all duration-300 hover:scale-105 active:scale-95 text-white/70 hover:text-white"
                                        >
                                            {m.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE B: LOADING (Cosmic Loader) */}
                    {loading && (
                        <motion.div
                            key="loading-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center text-center space-y-6 py-20"
                        >
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full border-4 border-accent-orange/10 border-t-accent-orange animate-spin" />
                                <div className="absolute inset-3 rounded-full border-4 border-purple-500/10 border-b-purple-500 animate-spin duration-3000" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-black uppercase tracking-widest animate-pulse">Syncing Cosmos</h3>
                                <p className="text-xs text-white/40 font-bold uppercase tracking-wider">
                                    Groq parsing intent & fetching TMDB posters...
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* STATE C: THE SHOWCASE (Netflix-style Hero Layout) */}
                    {movies.length > 0 && !loading && (
                        <motion.div
                            key="results-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="w-full flex-1 flex flex-col justify-between items-stretch space-y-8"
                        >
                            {/* Top Info Banner */}
                            <div className="flex flex-wrap items-center justify-between gap-4 bg-black/40 backdrop-blur-md border border-white/5 px-6 py-3 rounded-2xl">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-orange opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-orange"></span>
                                    </span>
                                    <span className="text-xs font-black uppercase tracking-wider text-white/50">
                                        Vibe match for: <span className="text-white font-black italic">"{userQuery}"</span>
                                    </span>
                                </div>
                                <button
                                    onClick={reset}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-2 rounded-full text-xs font-black text-white/80 hover:text-white transition-all uppercase tracking-widest active:scale-95"
                                >
                                    <RotateCcw className="w-3.5 h-3.5 text-accent-orange" /> Start Over
                                </button>
                            </div>

                            {/* Middle Section: Active Info & Refinement */}
                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 items-center min-h-[300px]">
                                
                                {/* Active Details */}
                                <div className="space-y-6 text-left max-w-2xl bg-black/35 backdrop-blur-md border border-white/5 p-6 md:p-8 rounded-3xl shadow-2xl">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="bg-accent-orange text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/10">
                                            {activeMovie?.type === 'tv' ? 'Series' : 'Movie'}
                                        </span>
                                        {activeMovie?.rating > 0 && (
                                            <span className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-yellow-500/10">
                                                ★ {activeMovie.rating.toFixed(1)}
                                            </span>
                                        )}
                                        {activeMovie?.year && (
                                            <span className="text-[10px] text-white/50 font-black tracking-wider uppercase">
                                                {activeMovie.year}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none">
                                        {activeMovie?.title}
                                    </h2>
                                    
                                    <p className="text-white/70 text-xs sm:text-sm md:text-base font-semibold leading-relaxed line-clamp-4">
                                        {activeMovie?.overview}
                                    </p>
                                    
                                    <div className="pt-2">
                                        <Link
                                            href={`/watch/${activeMovie?.id}?type=${activeMovie?.type === 'tv' ? 'tv' : 'movie'}`}
                                            className="inline-flex items-center gap-2.5 bg-white hover:bg-accent-orange text-black hover:text-white px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105 active:scale-95 shadow-[0_10px_25px_rgba(255,255,255,0.05)] hover:shadow-accent-orange/30 duration-300"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            Watch Now
                                        </Link>
                                    </div>
                                </div>

                                {/* Floating Refine panel on the right side */}
                                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-3xl space-y-4 shadow-2xl self-center lg:justify-self-end w-full max-w-sm">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent-orange block">
                                            Refine Vibe
                                        </span>
                                        <h3 className="text-sm font-black uppercase tracking-wider text-white">
                                            Change your search query
                                        </h3>
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/15 focus-within:border-accent-orange/50 focus-within:shadow-[0_0_20px_rgba(232,124,0,0.15)] rounded-2xl p-1.5 flex flex-col gap-2 transition-all duration-300">
                                        <input
                                            type="text"
                                            value={input}
                                            onChange={e => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder="e.g. Make it comedy / less action..."
                                            className="bg-transparent text-xs font-bold text-white placeholder:text-white/20 focus:outline-none px-3 py-2 w-full"
                                        />
                                        <button
                                            onClick={() => generateRecommendation(input)}
                                            disabled={!input.trim()}
                                            className="w-full py-2.5 bg-accent-orange hover:bg-amber-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-black uppercase text-[10px] tracking-wider text-white transition-all active:scale-95 shadow-md shadow-accent-orange/10"
                                        >
                                            Update Results
                                        </button>
                                    </div>
                                </div>

                            </div>

                            {/* Bottom Section: Horizontal Choices Carousel */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                                        Recommendations ({movies.length})
                                    </span>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block">
                                        Scroll horizontally or click to select
                                    </span>
                                </div>
                                
                                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth">
                                    {movies.map((movie, idx) => {
                                        const isActive = idx === activeIndex;
                                        return (
                                            <button
                                                key={movie.id}
                                                onClick={() => setActiveIndex(idx)}
                                                className={`relative aspect-[2/3] w-28 sm:w-32 md:w-36 rounded-2xl overflow-hidden border transition-all duration-300 text-left hover:scale-105 flex-shrink-0 ${
                                                    isActive 
                                                        ? 'border-accent-orange ring-4 ring-accent-orange/45 scale-95 shadow-[0_0_25px_rgba(232,124,0,0.5)]' 
                                                        : 'border-white/10 opacity-60 hover:opacity-100'
                                                }`}
                                            >
                                                <img
                                                    src={movie.poster || POSTER_PLACEHOLDER}
                                                    alt={movie.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = POSTER_PLACEHOLDER;
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent flex flex-col justify-end p-3">
                                                    <h4 className="text-[10px] sm:text-xs font-bold text-white truncate drop-shadow">
                                                        {movie.title}
                                                    </h4>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && movies.length === 0 && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                        ⚠️ {error}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
