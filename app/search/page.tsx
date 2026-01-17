'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import Footer from '../../components/Footer';
import { Movie } from '../page';
import { Search as SearchIcon, Film, Tv } from 'lucide-react';

interface SearchResult {
    id: number;
    name: string;
    type: string;
    year: number;
    image_url: string;
    relevance: number;
}

function transformSearchResult(result: SearchResult): Movie {
    return {
        id: String(result.id),
        title: result.name,
        overview: '',
        posterPath: result.image_url || 'https://via.placeholder.com/500x750?text=CineVault',
        backdropPath: result.image_url || result.image_url || 'https://via.placeholder.com/1920x1080?text=CineVault',
        releaseDate: result.year?.toString() || '',
        rating: 0,
        type: result.type,
        genres: [],
    };
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [popularMovies, setPopularMovies] = useState<Movie[]>([]);

    // Fetch popular movies on load to show when search is empty
    useEffect(() => {
        async function fetchPopular() {
            try {
                const res = await fetch('/api/movies?type=movie&limit=12');
                const data = await res.json();
                if (data.titles) {
                    setPopularMovies(data.titles.map((m: any) => ({
                        id: String(m.id),
                        title: m.title || 'Unknown',
                        overview: m.plot_overview || '',
                        posterPath: m.poster || 'https://via.placeholder.com/500x750?text=CineVault',
                        backdropPath: m.backdrop || 'https://via.placeholder.com/1920x1080?text=CineVault',
                        releaseDate: m.release_date || '',
                        rating: m.user_rating || 0,
                        type: m.type || 'movie',
                        genres: m.genre_names || [],
                    })));
                }
            } catch (error) {
                console.error('Failed to fetch popular:', error);
            }
        }
        fetchPopular();
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                if (data.results) {
                    setResults(data.results.map(transformSearchResult));
                }
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    return (
        <main className="min-h-screen bg-black">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="relative mb-12">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search movies, TV shows..."
                        autoFocus
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-16 py-6 text-xl md:text-2xl font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-accent-orange transition-all"
                    />
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!loading && query && results.length > 0 && (
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-8 flex items-center gap-3">
                            <SearchIcon className="w-4 h-4" />
                            Results for "{query}" — {results.length} found
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                            {results.map(movie => (
                                <MovieCard key={movie.id} movie={movie} />
                            ))}
                        </div>
                    </div>
                )}

                {!loading && query && results.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-white/20 text-xl">No results found for "{query}"</p>
                    </div>
                )}

                {!loading && !query && (
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white/40 mb-8 flex items-center gap-3">
                            <Film className="w-4 h-4" />
                            Popular Movies
                        </h2>
                        {popularMovies.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                                {popularMovies.map(movie => (
                                    <MovieCard key={movie.id} movie={movie} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <div className="w-8 h-8 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
