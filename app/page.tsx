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
    const [trending, setTrending] = useState<Movie[]>([]);
    const [newest, setNewest] = useState<Movie[]>([]);
    const [pakistani, setPakistani] = useState<Movie[]>([]);
    const [indian, setIndian] = useState<Movie[]>([]);
    const [hollywood, setHollywood] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchContent() {
            try {
                const [trendingRes, newestRes, pakRes, indRes, hwdRes] = await Promise.all([
                    fetch('/api/movies?category=trending&limit=20'),
                    fetch('/api/movies?category=new&limit=20'),
                    fetch('/api/movies?category=pakistani&limit=20'),
                    fetch('/api/movies?category=indian&limit=20'),
                    fetch('/api/movies?category=hollywood&limit=20')
                ]);

                const [tData, nData, pData, iData, hData] = await Promise.all([
                    trendingRes.json(),
                    newestRes.json(),
                    pakRes.json(),
                    indRes.json(),
                    hwdRes.json()
                ]);

                if (tData.titles) setTrending(tData.titles.map(transformMovie));
                if (nData.titles) setNewest(nData.titles.map(transformMovie));
                if (pData.titles) setPakistani(pData.titles.map(transformMovie));
                if (iData.titles) setIndian(iData.titles.map(transformMovie));
                if (hData.titles) setHollywood(hData.titles.map(transformMovie));

            } catch (error) {
                console.error('Failed to fetch content:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchContent();
    }, []);

    const heroContent = trending.slice(0, 6);

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading Cinema...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-black">
            <Header />
            {heroContent.length > 0 && <HeroSection movies={heroContent} />}

            <div className="relative z-10 py-12 space-y-20">
                <MovieRow title="Trending Now" movies={trending} />
                <MovieRow title="New Releases" movies={newest} />

                {pakistani.length > 0 && (
                    <MovieRow title="Pakistani Dramas & Movies" movies={pakistani} />
                )}

                {indian.length > 0 && (
                    <MovieRow title="Indian Cinema" movies={indian} />
                )}

                {hollywood.length > 0 && (
                    <MovieRow title="Hollywood Blockbusters" movies={hollywood} />
                )}
            </div>

            <Footer />
        </main>
    );
}
