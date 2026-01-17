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
        type: apiMovie.type || 'tv_series',
        genres: apiMovie.genre_names || [],
    };
}

type Category = 'all' | 'pakistani' | 'indian' | 'international';

export default function TVPage() {
    const [series, setSeries] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Category>('all');

    useEffect(() => {
        async function fetchTVShows() {
            setLoading(true);
            try {
                const limit = activeTab === 'all' ? 500 : 100;
                const category = activeTab === 'international' ? 'hollywood' : activeTab;
                const res = await fetch(`/api/movies?type=tv&category=${category}&limit=${limit}`);
                const data = await res.json();

                if (data.titles) {
                    setSeries(data.titles.map(transformMovie));
                }
            } catch (error) {
                console.error('Failed to fetch TV shows:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTVShows();
    }, [activeTab]);

    return (
        <main className="min-h-screen bg-black">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        TV Shows & Dramas
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mb-2">
                        {loading ? 'Loading...' : `${series.length} shows available`}
                    </p>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-3 mt-8 mb-8">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'all'
                                ? 'bg-accent-orange text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            All Shows
                        </button>
                        <button
                            onClick={() => setActiveTab('pakistani')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'pakistani'
                                ? 'bg-green-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇵🇰 Pakistani Dramas
                        </button>
                        <button
                            onClick={() => setActiveTab('indian')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'indian'
                                ? 'bg-orange-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🇮🇳 Indian Serials
                        </button>
                        <button
                            onClick={() => setActiveTab('international')}
                            className={`px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'international'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white/5 text-white/60 hover:bg-white/10'
                                }`}
                        >
                            🌍 International
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading TV shows...</p>
                        <p className="text-white/20 text-xs mt-2">This may take a moment</p>
                    </div>
                ) : series.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {series.map(show => (
                            <MovieCard key={show.id} movie={show} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-white/20 text-xl">No TV shows available in this category.</p>
                        <p className="text-white/10 text-sm mt-2">Try selecting a different category</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
