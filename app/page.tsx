'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import Footer from '../components/Footer';
import { POSTER_PLACEHOLDER, BACKDROP_PLACEHOLDER } from '@/lib/placeholders';

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
        posterPath: apiMovie.poster || POSTER_PLACEHOLDER,
        backdropPath: apiMovie.backdrop || apiMovie.poster || BACKDROP_PLACEHOLDER,
        releaseDate: apiMovie.release_date || apiMovie.year?.toString() || '',
        rating: apiMovie.user_rating || 0,
        type: apiMovie.type || 'movie',
        genres: apiMovie.genre_names || [],
    };
}

function mapLocalToMovie(localItem: any): Movie {
    return {
        id: String(localItem.id),
        title: localItem.title || 'Unknown Title',
        overview: '',
        posterPath: localItem.poster || POSTER_PLACEHOLDER,
        backdropPath: localItem.backdrop || BACKDROP_PLACEHOLDER,
        releaseDate: localItem.year || '',
        rating: localItem.user_rating || 0,
        type: localItem.type || 'movie',
        genres: []
    };
}

export default function Home() {
    const [trending, setTrending] = useState<Movie[]>([]);
    const [newest, setNewest] = useState<Movie[]>([]);
    const [tvSeries, setTvSeries] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [action, setAction] = useState<Movie[]>([]);
    const [comedy, setComedy] = useState<Movie[]>([]);
    const [horror, setHorror] = useState<Movie[]>([]);
    const [indian, setIndian] = useState<Movie[]>([]);
    const [pakistani, setPakistani] = useState<Movie[]>([]);
    const [punjabi, setPunjabi] = useState<Movie[]>([]);
    const [turkish, setTurkish] = useState<Movie[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Personalization rows
    const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
    const [watchlist, setWatchlist] = useState<Movie[]>([]);

    useEffect(() => {
        // Load personalized items from localStorage on mount
        const recents = JSON.parse(localStorage.getItem('cinevault_recents') || '[]');
        setContinueWatching(recents.map(mapLocalToMovie));

        const savedWatchlist = JSON.parse(localStorage.getItem('cinevault_watchlist') || '[]');
        setWatchlist(savedWatchlist.map(mapLocalToMovie));
    }, []);

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
                    { url: '/api/movies?category=comedy', setter: setComedy },
                    { url: '/api/movies?category=horror', setter: setHorror },
                    { url: '/api/movies?category=indian', setter: setIndian },
                    { url: '/api/movies?category=pakistani', setter: setPakistani },
                    { url: '/api/movies?category=punjabi', setter: setPunjabi },
                    { url: '/api/movies?category=turkish', setter: setTurkish },
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
                        {continueWatching.length > 0 && (
                            <MovieRow title="Continue Watching" movies={continueWatching} />
                        )}
                        {watchlist.length > 0 && (
                            <MovieRow title="My Watchlist" movies={watchlist} />
                        )}
                        <MovieRow title="Trending Now" movies={trending} />
                        <MovieRow title="New Releases" movies={newest} />
                        <MovieRow title="Popular TV Series" movies={tvSeries} />
                        {pakistani.length > 0 && <MovieRow title="🇵🇰 Pakistani Cinema" movies={pakistani} />}
                        {indian.length > 0 && <MovieRow title="🇮🇳 Bollywood Hits" movies={indian} />}
                        {punjabi.length > 0 && <MovieRow title="🌾 Punjabi Hits" movies={punjabi} />}
                        {turkish.length > 0 && <MovieRow title="🇹🇷 Turkish Drama" movies={turkish} />}
                        <MovieRow title="Top Rated" movies={topRated} />
                        <MovieRow title="Action Movies" movies={action} />
                        {comedy.length > 0 && <MovieRow title="Comedy Movies" movies={comedy} />}
                        {horror.length > 0 && <MovieRow title="Horror & Thrillers" movies={horror} />}
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
