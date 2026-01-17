'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Calendar, ShieldCheck, AlertCircle } from 'lucide-react';
import { Movie } from '@/app/page';

export default function WatchPage() {
    const params = useParams();
    const router = useRouter();
    const [movie, setMovie] = useState<Movie | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('cinevault_movies_v2');
        if (saved) {
            const movies: Movie[] = JSON.parse(saved);
            const found = movies.find(m => m.id === params.id);
            if (found) setMovie(found);
        }
        setIsLoading(false);
    }, [params.id]);

    if (isLoading) return (
        <div className="min-h-screen bg-dark-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-accent-orange/20 border-t-accent-orange rounded-full animate-spin" />
        </div>
    );

    if (!movie) return (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center space-y-6">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Movie Not Found</h1>
            <Link href="/" className="px-8 py-3 bg-accent-orange text-white rounded-full font-bold hover:scale-110 transition-transform">
                Back Home
            </Link>
        </div>
    );

    return (
        <main className="min-h-screen bg-dark-950 text-white overflow-x-hidden pb-20">
            <nav className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
                <button onClick={() => router.back()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-green-500/10 border border-green-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Secure Player</span>
                </div>
            </nav>

            <section className="relative w-full h-[70vh] md:h-[85vh] pt-24 px-4 md:px-12 flex flex-col items-center">
                <div className="w-full h-full relative rounded-2xl overflow-hidden bg-black shadow-[0_0_100px_rgba(232,124,0,0.1)] border border-white/5">
                    {movie.embedCode ? (
                        <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: movie.embedCode }} />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center space-y-4 bg-zinc-900/50">
                            <AlertCircle className="w-12 h-12 text-zinc-500" />
                            <p className="text-zinc-500 font-bold uppercase tracking-wider">No Player Available</p>
                        </div>
                    )}
                </div>
            </section>

            <section className="max-w-6xl mx-auto mt-12 px-6 flex flex-col md:flex-row gap-12">
                <div className="w-64 hidden md:block flex-shrink-0">
                    <img src={movie.posterPath} alt={movie.title} className="w-full rounded-xl shadow-2xl border border-white/5" />
                </div>
                <div className="flex-1">
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">{movie.title}</h1>
                    <div className="flex items-center gap-6 text-zinc-400 mb-8">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-accent-orange fill-current" />
                            <span className="text-white font-bold">{movie.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm uppercase tracking-widest font-medium">
                            <Calendar className="w-5 h-5" />
                            <span>{movie.releaseDate.split('-')[0]}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-accent-orange">Storyline</h3>
                        <p className="text-zinc-400 text-lg leading-relaxed">{movie.overview}</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
