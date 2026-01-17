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
        posterPath: apiMovie.poster || 'https://via.placeholder.com/500x750?text=No+Poster',
        backdropPath: apiMovie.backdrop || apiMovie.poster || 'https://via.placeholder.com/1920x1080?text=No+Image',
        releaseDate: apiMovie.release_date || apiMovie.year?.toString() || '',
        rating: apiMovie.user_rating || 0,
        type: apiMovie.type || 'movie',
        genres: apiMovie.genre_names || [],
    };
}

export default function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [tvShows, setTvShows] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                // Fetch movies
                const moviesRes = await fetch('/api/movies?type=movie&limit=15');
                const moviesData = await moviesRes.json();
                if (moviesData.titles) {
                    setMovies(moviesData.titles.map(transformMovie));
                }

                // Fetch TV shows
                const tvRes = await fetch('/api/movies?type=tv&limit=10');
                const tvData = await tvRes.json();
                if (tvData.titles) {
                    setTvShows(tvData.titles.map(transformMovie));
                }
            } catch (error) {
                console.error('Failed to fetch content:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchContent();
    }, []);

    const allContent = [...movies, ...tvShows];
    const heroContent = movies.length > 0 ? movies.slice(0, 6) : [];

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading movies...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black">
            <Header />
            {heroContent.length > 0 && (
                <>
                    <HeroSection movies={heroContent} />
                    <div className="relative z-10 py-20 space-y-16">
                        <MovieRow title="Trending Movies" movies={movies} />
                        {tvShows.length > 0 && <MovieRow title="Popular TV Shows" movies={tvShows} />}
                        <MovieRow title="Top Rated" movies={[...movies].sort((a, b) => b.rating - a.rating)} />
                    </div>
                    <Footer />
                </>
            )}
        </main>
    );
}
