'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import Footer from '../../components/Footer';
import { Movie } from '../page';

function transformMovie(apiMovie: any): Movie {
    return {
        id: String(apiMovie.id),
        title: apiMovie.title || 'Unknown Title',
        overview: apiMovie.plot_overview || 'No description available.',
        posterPath: apiMovie.poster || 'https://via.placeholder.com/500x750?text=CineVault',
        backdropPath: apiMovie.backdrop || apiMovie.poster || 'https://via.placeholder.com/1920x1080?text=CineVault',
        releaseDate: apiMovie.release_date || apiMovie.year?.toString() || '',
        rating: apiMovie.user_rating || 0,
        type: apiMovie.type || 'movie',
        genres: apiMovie.genre_names || [],
    };
}

type Category = 'all' | 'pakistani' | 'indian' | 'hollywood';

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Category>('all');
    const [counts, setCounts] = useState({ pakistani: 0, indian: 0, hollywood: 0, total: 0 });

    useEffect(() => {
        async function fetchMovies() {
            setLoading(true);
            try {
                // Fetch based on active category
                const limit = activeTab === 'all' ? 500 : 100;
                const res = await fetch(`/api/movies?type=movie&category=${activeTab}&limit=${limit}`);
                const data = await res.json();

                if (data.titles) {
                    setMovies(data.titles.map(transformMovie));

                    if (activeTab === 'all') {
                        // When fetching all, also get individual counts
                        const pkRes = await fetch('/api/movies?type=movie&category=pakistani&limit=100');
                        const pkData = await pkRes.json();

                        const inRes = await fetch('/api/movies?type=movie&category=indian&limit=300');
                        const inData = await inRes.json();

                        setCounts({
                            pakistani: pkData.total || 0,
                            indian: inData.total || 0,
                            hollywood: data.total - (pkData.total || 0) - (inData.total || 0),
                            total: data.total || 0
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch movies:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchMovies();
    }, [activeTab]);

    return (
        <main className="min-h-screen bg-black">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        Movies
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mb-2">
                        {loading ? 'Loading...' : `${movies.length} movies available`}
                    </p>
                    {!loading && activeTab === 'all' && counts.total > 0 && (
                        <p className="text-white/30 text-sm">
                            Pakistani: {counts.pakistani} | Indian: {counts.indian} | Hollywood: {counts.hollywood}
                        </p>
                    )}

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-3 mt-8 mb-8">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'all'
                                ? 'bg-accent-orange text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            All Movies
                        </button>
                        <button
                            onClick={() => setActiveTab('pakistani')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'pakistani'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇵🇰 Pakistani
                        </button>
                        <button
                            onClick={() => setActiveTab('indian')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'indian'
                                ? 'bg-orange-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇮🇳 Bollywood
                        </button>
                        <button
                            onClick={() => setActiveTab('hollywood')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'hollywood'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇺🇸 Hollywood
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading movies...</p>
                        <p className="text-white/20 text-xs mt-2">This may take a moment</p>
                    </div>
                ) : movies.length > 0 ? (
                    <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                        {movies.map(movie => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-white/20 text-xl">No movies available in this category.</p>
                        <p className="text-white/10 text-sm mt-2">Try selecting a different category</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
