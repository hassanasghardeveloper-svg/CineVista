'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Play, ExternalLink, Tv, Film, Youtube, Share2, Copy, Check } from 'lucide-react';
import EmbedPlayer, { StreamServer } from '@/components/EmbedPlayer';
import CustomDropdown from '@/components/CustomDropdown';
import { POSTER_PLACEHOLDER } from '@/lib/placeholders';

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
    number_of_seasons?: number;
    number_of_episodes?: number;
    cast?: CastMember[];
    recommendations?: RecommendationTitle[];
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

interface Episode {
    id: number;
    episode_number: number;
    name: string;
    overview: string;
    air_date: string;
    still_path: string | null;
    vote_average: number;
}

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

interface RecommendationTitle {
    id: number;
    title: string;
    overview: string;
    poster: string | null;
    backdrop: string | null;
    year: string;
    user_rating: number;
    type: string;
}

const SERVERS = [
    { id: 'cineverse', name: 'Server 1', icon: Film, color: 'text-purple-400' },
    { id: 'nxsha', name: 'Server 2', icon: Play, color: 'text-green-400' },
    { id: 'screenscape', name: 'Server 3', icon: Star, color: 'text-amber-400' },
] as const;

export default function WatchClient({
    initialTitle,
    initialTrailers,
}: {
    initialTitle: TitleDetails;
    initialTrailers: Trailer[];
}) {
    const params = useParams();
    const router = useRouter();
    const [title, setTitle] = useState<TitleDetails | null>(initialTitle);
    const [trailers, setTrailers] = useState<Trailer[]>(initialTrailers);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTrailer, setActiveTrailer] = useState<Trailer | null>(initialTrailers?.[0] || null);
    const [watchMode, setWatchMode] = useState<'trailer' | 'movie'>(initialTrailers?.length > 0 ? 'trailer' : 'movie');
    const [streamSource, setStreamSource] = useState<StreamServer>('cineverse');
    const [progress, setProgress] = useState<number>(0);
    const [inWatchlist, setInWatchlist] = useState(false);
    const [shareCopied, setShareCopied] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        const text = `Watch "${title?.title}" on CineVault!`;
        if (navigator.share) {
            try { await navigator.share({ title: title?.title, text, url }); } catch {}
        } else {
            await navigator.clipboard.writeText(url);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        }
    };

    // TV Show specific state
    const [selectedSeason, setSelectedSeason] = useState<number>(1);
    const [selectedEpisode, setSelectedEpisode] = useState<number>(1);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [fetchingEpisodes, setFetchingEpisodes] = useState(false);

    const handleProgress = useCallback((p: number) => {
        setProgress(p);
        if (title) {
            // Save specific progress key for resumes
            localStorage.setItem(`cinevault_progress_${title.id}`, JSON.stringify({
                id: title.id,
                title: title.title,
                poster: title.poster,
                backdrop: title.backdrop,
                type: title.type === 'tv_series' ? 'tv' : 'movie',
                progress: p,
                timestamp: Date.now()
            }));

            // Save in the recents list
            const recents = JSON.parse(localStorage.getItem('cinevault_recents') || '[]');
            const updatedRecents = [
                {
                    id: title.id,
                    title: title.title,
                    poster: title.poster,
                    backdrop: title.backdrop,
                    type: title.type === 'tv_series' ? 'tv' : 'movie',
                    progress: p,
                    timestamp: Date.now()
                },
                ...recents.filter((r: any) => String(r.id) !== String(title.id))
            ].slice(0, 12);
            localStorage.setItem('cinevault_recents', JSON.stringify(updatedRecents));
        }
    }, [title]);

    // Fetch TV episodes when season changes
    useEffect(() => {
        async function fetchSeasonEpisodes() {
            if (!title || title.type !== 'tv_series') return;
            setFetchingEpisodes(true);
            try {
                const res = await fetch(`/api/tv/${title.tmdb_id}/season/${selectedSeason}`);
                if (!res.ok) throw new Error('Failed to fetch episodes');
                const data = await res.json();
                setEpisodes(data.episodes || []);
            } catch (err) {
                console.error('Error fetching season details:', err);
            } finally {
                setFetchingEpisodes(false);
            }
        }

        fetchSeasonEpisodes();
    }, [title, selectedSeason]);

    // Check Watchlist status
    useEffect(() => {
        if (!title) return;
        const list = JSON.parse(localStorage.getItem('cinevault_watchlist') || '[]');
        setInWatchlist(list.some((item: any) => String(item.id) === String(title.id)));
    }, [title]);

    const toggleWatchlist = () => {
        if (!title) return;
        let list = JSON.parse(localStorage.getItem('cinevault_watchlist') || '[]');
        if (inWatchlist) {
            list = list.filter((item: any) => String(item.id) !== String(title.id));
        } else {
            list.push({
                id: title.id,
                title: title.title,
                poster: title.poster,
                backdrop: title.backdrop,
                type: title.type === 'tv_series' ? 'tv' : 'movie',
                year: title.year,
                user_rating: title.user_rating
            });
        }
        localStorage.setItem('cinevault_watchlist', JSON.stringify(list));
        setInWatchlist(!inWatchlist);
    };

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
            <div className="flex flex-col">
                {/* Player Header */}
                <div className="bg-dark-900 border-b border-white/5 px-4 md:px-6 py-4 lg:sticky static top-0 z-50 backdrop-blur-md order-2 lg:order-1">
                <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-4 items-center w-full lg:w-auto">
                        <button
                            onClick={() => {
                                if (typeof window !== 'undefined' && window.history.length > 1) {
                                    router.back();
                                } else {
                                    router.push('/');
                                }
                            }}
                            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full text-xs font-bold border border-white/10"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>

                        <div className="flex items-center gap-2">
                            {trailers.length > 0 && (
                                <button
                                    onClick={() => setWatchMode('trailer')}
                                    className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${watchMode === 'trailer'
                                        ? 'bg-white text-black'
                                        : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Youtube className="w-4 h-4 text-red-500" />
                                    <span className="hidden xs:inline">Trailer</span>
                                    <span className="xs:hidden">Tlr</span>
                                </button>
                            )}
                            <button
                                onClick={() => setWatchMode('movie')}
                                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${watchMode === 'movie'
                                    ? 'bg-accent-orange text-white ring-4 ring-accent-orange/20'
                                    : 'bg-accent-orange/10 text-accent-orange hover:bg-accent-orange/20'
                                    }`}
                            >
                                <Play className="w-4 h-4 fill-current animate-pulse" />
                                Watch
                            </button>
                            <button
                                onClick={toggleWatchlist}
                                className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest transition-all ${inWatchlist
                                    ? 'bg-white/15 text-white border border-white/20'
                                    : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {inWatchlist ? '✓ Watchlist' : '+ Watchlist'}
                            </button>

                            {/* Share Button */}
                            <button
                                onClick={handleShare}
                                title="Share"
                                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] md:text-sm font-black uppercase tracking-widest transition-all bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
                            >
                                {shareCopied
                                    ? <><Check className="w-4 h-4 text-green-400" /><span className="hidden sm:inline text-green-400">Copied!</span></>
                                    : <><Share2 className="w-4 h-4" /><span className="hidden sm:inline">Share</span></>}
                            </button>
                        </div>
                    </div>

                    {/* Source Switcher - Only show in watch mode */}
                    {watchMode === 'movie' && (
                        <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto py-1 no-scrollbar">
                            <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                                {SERVERS.map((srv) => {
                                    const IconComponent = srv.icon;
                                    const isSelected = streamSource === srv.id;
                                    return (
                                        <button
                                            key={srv.id}
                                            onClick={() => setStreamSource(srv.id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight transition-all whitespace-nowrap ${isSelected
                                                ? 'bg-white/20 text-white'
                                                : 'text-white/40 hover:text-white'
                                                }`}
                                        >
                                            <IconComponent className={`w-3.5 h-3.5 ${srv.color}`} />
                                            {srv.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Player Section */}
            <div className="w-full bg-black relative order-1 lg:order-2">
                {/* Floating Back Button on Mobile */}
                <button
                    onClick={() => {
                        if (typeof window !== 'undefined' && window.history.length > 1) {
                            router.back();
                        } else {
                            router.push('/');
                        }
                    }}
                    className="lg:hidden absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-md border border-white/10 text-white p-2.5 rounded-full shadow-lg"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                {watchMode === 'movie' && (title.tmdb_id || title.imdb_id) ? (
                    <div className="max-w-[1400px] mx-auto">
                        <div className="w-full aspect-video">
                            <EmbedPlayer
                                key={`${streamSource}_${selectedSeason}_${selectedEpisode}`}
                                server={streamSource}
                                tmdbId={title.tmdb_id}
                                imdbId={title.imdb_id}
                                type={title.type === 'tv_series' ? 'tv' : 'movie'}
                                season={selectedSeason}
                                episode={selectedEpisode}
                                onProgress={handleProgress}
                            />
                        </div>
                        {progress > 0 && (
                            <div className="mt-4 px-6">
                                <div className="flex justify-between text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">
                                    <span>Playback Progress</span>
                                    <span>{progress.toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-accent-orange transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                ) : activeTrailer ? (
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
        </div>

        {/* TV Series Episode & Season Selector */}
            {watchMode === 'movie' && title.type === 'tv_series' && (
                <div className="bg-dark-900 border-b border-white/5 px-6 py-8">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-wider">Episodes</h2>
                                <p className="text-white/40 text-[10px] mt-1 uppercase tracking-widest font-bold">
                                    Currently playing: Season {selectedSeason} Episode {selectedEpisode}
                                </p>
                            </div>

                            {title.number_of_seasons && title.number_of_seasons > 0 && (
                                <CustomDropdown
                                    value={selectedSeason}
                                    options={Array.from({ length: title.number_of_seasons }, (_, i) => i + 1).map((s) => ({
                                        value: s,
                                        label: `Season ${s}`
                                    }))}
                                    onChange={(val) => {
                                        setSelectedSeason(Number(val));
                                        setSelectedEpisode(1);
                                    }}
                                    className="w-full sm:w-48"
                                />
                            )}
                        </div>

                        {fetchingEpisodes ? (
                            <div className="py-12 text-center">
                                <div className="w-8 h-8 border-2 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">Fetching episodes...</p>
                            </div>
                        ) : episodes.length > 0 ? (
                            <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {episodes.map((ep) => {
                                    const isSelected = selectedEpisode === ep.episode_number;
                                    return (
                                        <button
                                            key={ep.id}
                                            onClick={() => setSelectedEpisode(ep.episode_number)}
                                            className={`text-left rounded-xl overflow-hidden border transition-all duration-300 group flex flex-row sm:flex-col h-full bg-white/[0.01] ${isSelected
                                                ? 'border-accent-orange bg-accent-orange/[0.04] ring-1 ring-accent-orange'
                                                : 'border-white/5 hover:border-white/10 hover:bg-white/[0.03]'
                                                }`}
                                        >
                                            <div className="relative aspect-video w-28 xs:w-36 sm:w-full bg-white/5 overflow-hidden flex-shrink-0">
                                                {ep.still_path ? (
                                                    <img
                                                        src={ep.still_path}
                                                        alt={ep.name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-dark-950">
                                                        <Film className="w-8 h-8 text-white/10" />
                                                    </div>
                                                )}
                                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                                    }`}>
                                                    <div className="w-10 h-10 rounded-full bg-accent-orange text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                                    </div>
                                                </div>
                                                <span className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-black text-white tracking-widest uppercase">
                                                    EP {ep.episode_number}
                                                </span>
                                            </div>

                                            <div className="p-3 sm:p-4 flex-1 min-w-0 flex flex-col justify-center sm:justify-between">
                                                <div>
                                                    <h3 className={`font-black text-xs sm:text-sm line-clamp-1 transition-colors ${isSelected ? 'text-accent-orange' : 'text-white group-hover:text-white'
                                                        }`}>
                                                        {ep.name}
                                                    </h3>
                                                    <p className="text-white/40 text-[11px] line-clamp-2 mt-1.5 leading-relaxed font-semibold">
                                                        {ep.overview}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-white/40 text-sm">No episodes found for this season.</p>
                        )}
                    </div>
                </div>
            )}

            {/* Content Details */}
            <div className="max-w-[1400px] mx-auto px-6 py-12">
                <div className="grid md:grid-cols-[250px_1fr] gap-10">
                    <div className="hidden md:block">
                        <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                            <img
                                src={title.poster || POSTER_PLACEHOLDER}
                                alt={title.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

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
                            {title.runtime_minutes > 0 && (
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

            {/* Cast & Crew Section */}
            {title.cast && title.cast.length > 0 && (
                <div className="border-t border-white/5 py-12 max-w-[1400px] mx-auto px-6">
                    <h3 className="text-lg font-black uppercase tracking-wider text-white/40 mb-6">
                        Cast & Crew
                    </h3>
                    <div className="flex gap-6 overflow-x-auto pb-4" style={{scrollbarWidth:'none', msOverflowStyle:'none'}}>
                        {title.cast.map((member) => (
                            <Link
                                key={member.id}
                                href={`/artist/${member.id}`}
                                className="flex-shrink-0 text-center w-24 group"
                            >
                                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto border border-white/10 mb-3 bg-white/5 group-hover:border-accent-orange/50 transition-all duration-300 ring-0 group-hover:ring-2 group-hover:ring-accent-orange/20">
                                    {member.profile_path ? (
                                        <img
                                            src={member.profile_path}
                                            alt={member.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-white/20">
                                            <Tv className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>
                                <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-accent-orange transition-colors">{member.name}</h4>
                                <p className="text-[10px] text-white/40 mt-0.5 line-clamp-1">{member.character}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Recommendations ("More Like This") Section */}
            {title.recommendations && title.recommendations.length > 0 && (
                <div className="border-t border-white/5 py-12 max-w-[1400px] mx-auto px-6">
                    <h3 className="text-lg font-black uppercase tracking-wider text-white/40 mb-8">
                        More Like This
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {title.recommendations.map((rec) => {
                            const mediaType = rec.type === 'tv_series' || rec.type === 'tv' ? 'tv' : 'movie';
                            return (
                                <Link
                                    key={rec.id}
                                    href={`/watch/${rec.id}?type=${mediaType}`}
                                    className="group flex flex-col h-full bg-white/[0.01] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 hover:bg-white/[0.03] transition-all duration-300"
                                >
                                    <div className="relative aspect-[2/3] w-full bg-white/5 overflow-hidden">
                                        {rec.poster ? (
                                            <img
                                                src={rec.poster}
                                                alt={rec.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-dark-950">
                                                <Film className="w-12 h-12 text-white/10" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                            <div className="w-10 h-10 rounded-full bg-accent-orange text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                                <Play className="w-5 h-5 fill-current ml-0.5" />
                                            </div>
                                        </div>
                                        {rec.user_rating > 0 && (
                                            <span className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-black text-white flex items-center gap-1">
                                                <Star className="w-3 h-3 text-accent-orange fill-current" />
                                                {rec.user_rating.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-xs text-white group-hover:text-accent-orange transition-colors line-clamp-1">
                                            {rec.title}
                                        </h4>
                                        <p className="text-white/40 text-[10px] mt-0.5 font-semibold">
                                            {rec.year} • {mediaType.toUpperCase()}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </main>
    );
}
