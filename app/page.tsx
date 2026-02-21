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

// Transform TMDB API response to our Movie format
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
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [action, setAction] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContent() {
            try {
                // Fetch all categories in parallel (TMDB has generous rate limits)
                const categories = [
                    { url: '/api/movies?category=trending', setter: setTrending },
                    { url: '/api/movies?category=new', setter: setNewest },
                    { url: '/api/movies?category=trending&type=tv', setter: setTvSeries },
                    { url: '/api/movies?category=top_rated', setter: setTopRated },
                    { url: '/api/movies?category=action', setter: setAction },
                ];

                const results = await Promise.all(
                    categories.map(({ url }) => fetch(url).then(res => res.json()))
                );

                results.forEach((data, index) => {
                    if (data.titles) {
                        categories[index].setter(data.titles.map(transformMovie));
                    }
                });

            } catch (error: any) {
                console.error('Failed to fetch content:', error);
                setError('Something went wrong. Please check your connection.');
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
                        <MovieRow title="Top Rated" movies={topRated} />
                        <MovieRow title="Action Movies" movies={action} />
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
