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

type Category = 'trending' | 'popular' | 'top_rated' | 'pakistani' | 'indian' | 'turkish' | 'hollywood' | 'action' | 'comedy';

export default function MoviesPage() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Category>('trending');
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(10); // Already loaded 10 pages

    useEffect(() => {
        async function fetchMovies() {
            setLoading(true);
            setMovies([]);
            try {
                // Fetch 10 pages in parallel (200 movies)
                const pages = Array.from({ length: 10 }, (_, i) => i + 1);
                const results = await Promise.all(
                    pages.map(page =>
                        fetch(`/api/movies?type=movie&category=${activeTab}&page=${page}`)
                            .then(res => res.json())
                    )
                );

                const allMovies: Movie[] = [];
                const seenIds = new Set<string>();

                results.forEach(data => {
                    if (data.titles) {
                        data.titles.forEach((movie: any) => {
                            const transformed = transformMovie(movie);
                            if (!seenIds.has(transformed.id)) {
                                seenIds.add(transformed.id);
                                allMovies.push(transformed);
                            }
                        });
                    }
                });

                setMovies(allMovies);
                setCurrentPage(10);
            } catch (error) {
                console.error('Failed to fetch movies:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchMovies();
    }, [activeTab]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            // Load 5 more pages
            const pages = Array.from({ length: 5 }, (_, i) => currentPage + i + 1);
            const results = await Promise.all(
                pages.map(page =>
                    fetch(`/api/movies?type=movie&category=${activeTab}&page=${page}`)
                        .then(res => res.json())
                )
            );

            const newMovies: Movie[] = [];
            const seenIds = new Set(movies.map(m => m.id));

            results.forEach(data => {
                if (data.titles) {
                    data.titles.forEach((movie: any) => {
                        const transformed = transformMovie(movie);
                        if (!seenIds.has(transformed.id)) {
                            seenIds.add(transformed.id);
                            newMovies.push(transformed);
                        }
                    });
                }
            });

            setMovies(prev => [...prev, ...newMovies]);
            setCurrentPage(prev => prev + 5);
        } catch (error) {
            console.error('Failed to load more:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleTabChange = (tab: Category) => {
        setActiveTab(tab);
    };

    return (
        <main className="min-h-screen bg-black">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        Movies
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mb-2">
                        {loading ? 'Loading 200+ movies...' : `Showing ${movies.length} movies`}
                    </p>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-3 mt-8 mb-8">
                        <button
                            onClick={() => handleTabChange('trending')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'trending'
                                ? 'bg-accent-orange text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Trending
                        </button>
                        <button
                            onClick={() => handleTabChange('popular')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'popular'
                                ? 'bg-accent-orange text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Popular
                        </button>
                        <button
                            onClick={() => handleTabChange('top_rated')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'top_rated'
                                ? 'bg-accent-orange text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Top Rated
                        </button>
                        <button
                            onClick={() => handleTabChange('pakistani')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'pakistani'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇵🇰 Pakistani
                        </button>
                        <button
                            onClick={() => handleTabChange('indian')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'indian'
                                ? 'bg-orange-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇮🇳 Bollywood
                        </button>
                        <button
                            onClick={() => handleTabChange('turkish')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'turkish'
                                ? 'bg-red-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇹🇷 Turkish
                        </button>
                        <button
                            onClick={() => handleTabChange('hollywood')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'hollywood'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇺🇸 Hollywood
                        </button>
                        <button
                            onClick={() => handleTabChange('action')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'action'
                                ? 'bg-red-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Action
                        </button>
                        <button
                            onClick={() => handleTabChange('comedy')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'comedy'
                                ? 'bg-yellow-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Comedy
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading 200+ movies...</p>
                    </div>
                ) : movies.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {movies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest bg-accent-orange text-white hover:bg-accent-orange/80 disabled:opacity-50 transition-all"
                            >
                                {loadingMore ? 'Loading...' : 'Load More Movies'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-white/20 text-xl">No movies available in this category.</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
