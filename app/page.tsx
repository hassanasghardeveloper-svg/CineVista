'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import Footer from '../components/Footer';

export interface Movie {
    id: string;
    title: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    releaseDate: string;
    rating: number;
    type: string;
    genres: string[];
}

// Transform API response to our Movie format
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

export default function Home() {
    const [trending, setTrending] = useState<Movie[]>([]);
    const [newest, setNewest] = useState<Movie[]>([]);
    const [tvSeries, setTvSeries] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContent() {
            try {
                // Fetch sequentially with delays to avoid rate limiting
                const categories = [
                    { url: '/api/movies?category=trending&limit=8', setter: setTrending },
                    { url: '/api/movies?category=new&limit=8', setter: setNewest },
                    { url: '/api/movies?category=trending&type=tv&limit=8', setter: setTvSeries },
                ];

                for (const { url, setter } of categories) {
                    try {
                        const res = await fetch(url);
                        if (res.ok) {
                            const data = await res.json();
                            if (data.titles) setter(data.titles.map(transformMovie));
                        } else if (res.status === 429) {
                            throw new Error('API_QUOTA');
                        }
                        // Small delay between requests
                        await new Promise(resolve => setTimeout(resolve, 150));
                    } catch (e: any) {
                        if (e.message === 'API_QUOTA') throw e;
                    }
                }

            } catch (error: any) {
                console.error('Failed to fetch content:', error);
                if (error.message === 'API_QUOTA') {
                    setError('API limit reached. Please try again later.');
                } else {
                    setError('Something went wrong. Please check your connection.');
                }
            } finally {
                setLoading(false);
            }
        }

        fetchContent();
    }, []);

    const heroContent = trending.length > 0 ? trending.slice(0, 6) : [];

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading CineVault...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black">
            <Header />
            {error && (
                <div className="pt-32 px-10">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-500 text-center">
                        {error}
                    </div>
                </div>
            )}
            {heroContent.length > 0 ? (
                <>
                    <HeroSection movies={heroContent} />
                    <div className="relative z-10 py-20 space-y-16">
                        <MovieRow title="Trending Now" movies={trending} />
                        <MovieRow title="New Releases" movies={newest} />
                        <MovieRow title="Popular TV Series" movies={tvSeries} />
                    </div>
                    <Footer />
                </>
            ) : !loading && !error && (
                <div className="min-h-[60vh] flex flex-col items-center justify-center pt-20">
                    <p className="text-white/40 text-lg">No movies found. Try searching for something else.</p>
                </div>
            )}
        </main>
    );
}
