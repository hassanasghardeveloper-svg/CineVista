'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Play, ExternalLink, Tv, Film, Youtube } from 'lucide-react';

interface TitleDetails {
    id: number;
    title: string;
    original_title: string;
    plot_overview: string;
    type: string;
    runtime_minutes: number;
    year: number;
    release_date: string;
    imdb_id: string;
    tmdb_id: number;
    genre_names: string[];
    user_rating: number;
    critic_score: number;
    poster: string;
    backdrop: string;
    streaming_sources: StreamingSource[];
}

interface StreamingSource {
    source_id: number;
    name: string;
    type: string;
    region: string;
    web_url: string;
    format: string;
    price: number | null;
}

interface Trailer {
    key: string;
    name: string;
    type: string;
    url: string;
}

export default function WatchPage() {
    const params = useParams();
    const [title, setTitle] = useState<TitleDetails | null>(null);
    const [trailers, setTrailers] = useState<Trailer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTrailer, setActiveTrailer] = useState<Trailer | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch title details
                const res = await fetch(`/api/title/${params.id}`);
                if (!res.ok) throw new Error('Failed to fetch title');
                const data = await res.json();
                setTitle(data);

                // Fetch trailers if we have TMDB ID
                if (data.tmdb_id) {
                    const trailerRes = await fetch(
                        `/api/trailer/${params.id}?tmdb_id=${data.tmdb_id}&type=${data.type}`
                    );
                    const trailerData = await trailerRes.json();
                    if (trailerData.videos?.length > 0) {
                        setTrailers(trailerData.videos);
                        setActiveTrailer(trailerData.videos[0]);
                    }
                }
            } catch (err) {
                console.error('Error:', err);
                setError('Failed to load content.');
            } finally {
                setLoading(false);
            }
        }

        if (params.id) fetchData();
    }, [params.id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading...</p>
                </div>
            </main>
        );
    }

    if (error || !title) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/40 text-xl mb-4">{error || 'Content not found'}</p>
                    <Link href="/" className="text-accent-orange hover:underline">← Back to Home</Link>
                </div>
            </main>
        );
    }

    const subscriptionSources = title.streaming_sources?.filter(s => s.type === 'sub') || [];
    const freeSources = title.streaming_sources?.filter(s => s.type === 'free') || [];

    const trailerSearchQuery = encodeURIComponent(`${title.title} ${title.year || ''} official trailer`);
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${trailerSearchQuery}`;

    return (
        <main className="min-h-screen bg-black">
            {/* Back Button */}
            <div className="fixed top-6 left-6 z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full text-sm font-bold border border-white/10"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </Link>
            </div>

            {/* Video Player Section */}
            <div className="w-full bg-black">
                {activeTrailer ? (
                    <div className="relative w-full aspect-video max-h-[70vh]">
                        <iframe
                            src={`${activeTrailer.url}?autoplay=1&rel=0`}
                            className="absolute inset-0 w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div
                        className="relative w-full aspect-video max-h-[70vh] bg-cover bg-center"
                        style={{ backgroundImage: `url(${title.backdrop || title.poster})` }}
                    >
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="text-center">
                                <Youtube className="w-16 h-16 text-white/20 mx-auto mb-4" />
                                <p className="text-white/40">No trailer available</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Trailer Selection */}
            {trailers.length > 1 && (
                <div className="bg-dark-900 border-b border-white/5 px-6 py-4">
                    <div className="max-w-[1400px] mx-auto flex gap-3 overflow-x-auto">
                        {trailers.map((trailer, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveTrailer(trailer)}
                                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeTrailer?.key === trailer.key
                                    ? 'bg-accent-orange text-white'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                            >
                                {trailer.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Details */}
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                <div className="grid md:grid-cols-[250px_1fr] gap-10">
                    {/* Poster */}
                    <div className="hidden md:block">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                            <img
                                src={title.poster || 'https://via.placeholder.com/500x750'}
                                alt={title.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-accent-orange text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-2">
                                {title.type === 'tv_series' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                                {title.type === 'tv_series' ? 'TV Series' : 'Movie'}
                            </span>
                            {title.year && <span className="text-white/40 text-sm font-bold">{title.year}</span>}
                        </div>

                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
                            {title.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            {title.user_rating > 0 && (
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-accent-orange fill-current" />
                                    <span className="text-white font-black">{title.user_rating.toFixed(1)}</span>
                                </div>
                            )}
                            {title.runtime_minutes && (
                                <span className="text-white/40 font-bold">{title.runtime_minutes} min</span>
                            )}
                            {title.genre_names?.slice(0, 3).map(genre => (
                                <span key={genre} className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-xs font-bold">
                                    {genre}
                                </span>
                            ))}
                        </div>

                        <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-2xl">
                            {title.plot_overview || 'No description available.'}
                        </p>

                        {/* Where to Watch */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/40">
                                Where to Watch
                            </h3>

                            {subscriptionSources.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {subscriptionSources.map((source, i) => (
                                        <a
                                            key={i}
                                            href={source.web_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-white/10 hover:bg-accent-orange text-white px-5 py-3 rounded-full font-bold text-sm transition-all"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            {source.name}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {freeSources.length > 0 && (
                                <div className="flex flex-wrap gap-3">
                                    {freeSources.map((source, i) => (
                                        <a
                                            key={i}
                                            href={source.web_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white px-5 py-3 rounded-full font-bold text-sm transition-all"
                                        >
                                            Free on {source.name}
                                        </a>
                                    ))}
                                </div>
                            )}

                            {subscriptionSources.length === 0 && freeSources.length === 0 && (
                                <p className="text-white/30">Streaming info not available. Check IMDB for more options.</p>
                            )}

                            {/* External Links */}
                            <div className="flex flex-wrap gap-4 pt-4">
                                {title.imdb_id && (
                                    <a
                                        href={`https://www.imdb.com/title/${title.imdb_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-yellow-500 hover:underline text-sm font-bold flex items-center gap-1 bg-white/5 px-4 py-2 rounded-lg"
                                    >
                                        IMDB <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                                {title.tmdb_id && (
                                    <a
                                        href={`https://www.themoviedb.org/${title.type === 'tv_series' ? 'tv' : 'movie'}/${title.tmdb_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:underline text-sm font-bold flex items-center gap-1 bg-white/5 px-4 py-2 rounded-lg"
                                    >
                                        TMDB <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                                <a
                                    href={`https://www.dailymotion.com/search/${encodeURIComponent(title.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-white/60 hover:text-white hover:underline text-sm font-bold flex items-center gap-1 bg-white/5 px-4 py-2 rounded-lg"
                                >
                                    Dailymotion <ExternalLink className="w-3 h-3" />
                                </a>
                                <a
                                    href={youtubeSearchUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-500 hover:text-red-400 hover:underline text-sm font-bold flex items-center gap-1 bg-white/5 px-4 py-2 rounded-lg"
                                >
                                    YouTube <ExternalLink className="w-3 h-3" />
                                </a>
                                <a
                                    href={`https://search.bilibili.com/all?keyword=${encodeURIComponent(title.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-pink-500 hover:text-pink-400 hover:underline text-sm font-bold flex items-center gap-1 bg-white/5 px-4 py-2 rounded-lg"
                                >
                                    Bilibili <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
