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
        type: apiMovie.type || 'tv',
        genres: apiMovie.genre_names || [],
    };
}

type Category = 'trending' | 'popular' | 'top_rated' | 'pakistani' | 'indian' | 'turkish' | 'animation';

export default function TVPage() {
    const [series, setSeries] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Category>('trending');
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(10);

    useEffect(() => {
        async function fetchTVShows() {
            setLoading(true);
            setSeries([]);
            try {
                // Fetch 10 pages in parallel (200 shows)
                const pages = Array.from({ length: 10 }, (_, i) => i + 1);
                const results = await Promise.all(
                    pages.map(page =>
                        fetch(`/api/movies?type=tv&category=${activeTab}&page=${page}`)
                            .then(res => res.json())
                    )
                );

                const allShows: Movie[] = [];
                const seenIds = new Set<string>();

                results.forEach(data => {
                    if (data.titles) {
                        data.titles.forEach((show: any) => {
                            const transformed = transformMovie(show);
                            if (!seenIds.has(transformed.id)) {
                                seenIds.add(transformed.id);
                                allShows.push(transformed);
                            }
                        });
                    }
                });

                setSeries(allShows);
                setCurrentPage(10);
            } catch (error) {
                console.error('Failed to fetch TV shows:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTVShows();
    }, [activeTab]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const pages = Array.from({ length: 5 }, (_, i) => currentPage + i + 1);
            const results = await Promise.all(
                pages.map(page =>
                    fetch(`/api/movies?type=tv&category=${activeTab}&page=${page}`)
                        .then(res => res.json())
                )
            );

            const newShows: Movie[] = [];
            const seenIds = new Set(series.map(s => s.id));

            results.forEach(data => {
                if (data.titles) {
                    data.titles.forEach((show: any) => {
                        const transformed = transformMovie(show);
                        if (!seenIds.has(transformed.id)) {
                            seenIds.add(transformed.id);
                            newShows.push(transformed);
                        }
                    });
                }
            });

            setSeries(prev => [...prev, ...newShows]);
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
                        TV Shows & Dramas
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mb-2">
                        {loading ? 'Loading 200+ shows...' : `Showing ${series.length} shows`}
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
                            🇵🇰 Pakistani Dramas
                        </button>
                        <button
                            onClick={() => handleTabChange('indian')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'indian'
                                ? 'bg-orange-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇮🇳 Indian Dramas
                        </button>
                        <button
                            onClick={() => handleTabChange('turkish')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'turkish'
                                ? 'bg-red-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇹🇷 Turkish Dramas
                        </button>
                        <button
                            onClick={() => handleTabChange('animation')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'animation'
                                ? 'bg-purple-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            Animation
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading 200+ shows...</p>
                    </div>
                ) : series.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {series.map(show => (
                                <MovieCard key={show.id} movie={show} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest bg-accent-orange text-white hover:bg-accent-orange/80 disabled:opacity-50 transition-all"
                            >
                                {loadingMore ? 'Loading...' : 'Load More Shows'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-white/20 text-xl">No TV shows available in this category.</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
