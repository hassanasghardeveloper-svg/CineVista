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
    const [pakistani, setPakistani] = useState<Movie[]>([]);
    const [indian, setIndian] = useState<Movie[]>([]);
    const [hollywood, setHollywood] = useState<Movie[]>([]);
    const [action, setAction] = useState<Movie[]>([]);
    const [comedy, setComedy] = useState<Movie[]>([]);
    const [horror, setHorror] = useState<Movie[]>([]);
    const [animation, setAnimation] = useState<Movie[]>([]);
    const [documentary, setDocumentary] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchContent() {
            try {
                const endpoints = [
                    '/api/movies?category=trending&limit=20',
                    '/api/movies?category=new&limit=20',
                    '/api/movies?category=pakistani&limit=20',
                    '/api/movies?category=indian&limit=20',
                    '/api/movies?category=hollywood&limit=20',
                    '/api/movies?category=action&limit=20',
                    '/api/movies?category=comedy&limit=20',
                    '/api/movies?category=horror&limit=20',
                    '/api/movies?category=animation&limit=20',
                    '/api/movies?category=documentary&limit=20'
                ];

                const responses = await Promise.all(endpoints.map(url => fetch(url)));

                const data = await Promise.all(responses.map(async (res) => {
                    if (!res.ok) {
                        const err = await res.json();
                        if (res.status === 429) throw new Error('API_QUOTA');
                        return { titles: [] };
                    }
                    return res.json();
                }));

                const [tData, nData, pData, iData, hData, aData, cData, hrData, anData, dData] = data;

                if (tData.titles) setTrending(tData.titles.map(transformMovie));
                if (nData.titles) setNewest(nData.titles.map(transformMovie));
                if (pData.titles) setPakistani(pData.titles.map(transformMovie));
                if (iData.titles) setIndian(iData.titles.map(transformMovie));
                if (hData.titles) setHollywood(hData.titles.map(transformMovie));
                if (aData.titles) setAction(aData.titles.map(transformMovie));
                if (cData.titles) setComedy(cData.titles.map(transformMovie));
                if (hrData.titles) setHorror(hrData.titles.map(transformMovie));
                if (anData.titles) setAnimation(anData.titles.map(transformMovie));
                if (dData.titles) setDocumentary(dData.titles.map(transformMovie));

            } catch (error: any) {
                console.error('Failed to fetch content:', error);
                if (error.message === 'API_QUOTA') {
                    setError('API limit reached. Using recently loaded content or try again later.');
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
                        <MovieRow title="Pakistani Content" movies={pakistani} />
                        <MovieRow title="Indian Movies" movies={indian} />
                        <MovieRow title="Hollywood Hits" movies={hollywood} />
                        <MovieRow title="Action Packed" movies={action} />
                        <MovieRow title="Comedy Club" movies={comedy} />
                        <MovieRow title="Horror Library" movies={horror} />
                        <MovieRow title="Animation World" movies={animation} />
                        <MovieRow title="Documentaries" movies={documentary} />
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
