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

    useEffect(() => {
        async function fetchContent() {
            try {
                const [trendingRes, newestRes, pakRes, indRes, hwdRes, actRes, comRes, horRes, aniRes, docRes] = await Promise.all([
                    fetch('/api/movies?category=trending&limit=100'),
                    fetch('/api/movies?category=new&limit=100'),
                    fetch('/api/movies?category=pakistani&limit=100'),
                    fetch('/api/movies?category=indian&limit=100'),
                    fetch('/api/movies?category=hollywood&limit=100'),
                    fetch('/api/movies?category=action&limit=100'),
                    fetch('/api/movies?category=comedy&limit=100'),
                    fetch('/api/movies?category=horror&limit=100'),
                    fetch('/api/movies?category=animation&limit=100'),
                    fetch('/api/movies?category=documentary&limit=100')
                ]);

                const [tData, nData, pData, iData, hData, aData, cData, hrData, anData, dData] = await Promise.all([
                    trendingRes.json(),
                    newestRes.json(),
                    pakRes.json(),
                    indRes.json(),
                    hwdRes.json(),
                    actRes.json(),
                    comRes.json(),
                    horRes.json(),
                    aniRes.json(),
                    docRes.json()
                ]);

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

            } catch (error) {
                console.error('Failed to fetch content:', error);
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
            {heroContent.length > 0 && (
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
            )}
        </main>
    );
}
