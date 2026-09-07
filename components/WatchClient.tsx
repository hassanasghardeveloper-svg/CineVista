'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Play, ExternalLink, Tv, Film, Youtube, Share2, Copy, Check } from 'lucide-react';
import EmbedPlayer, { StreamServer } from '@/components/EmbedPlayer';
import CustomDropdown from '@/components/CustomDropdown';
import { POSTER_PLACEHOLDER } from '@/lib/placeholders';
import { createWatchUrl, createWatchEpisodeUrl, createArtistUrl, slugify } from '@/lib/slugify';

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
    { id: 'vidsrc', name: 'Server 4', icon: Tv, color: 'text-blue-400' },
] as const;

export default function WatchClient({
    initialTitle,
    initialTrailers,
    initialSeason = 1,
    initialEpisode = 1,
}: {
    initialTitle: TitleDetails;
    initialTrailers: Trailer[];
    initialSeason?: number;
    initialEpisode?: number;
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
        const text = `Watch "${title?.title}" on CineVista!`;
        if (navigator.share) {
            try { await navigator.share({ title: title?.title, text, url }); } catch {}
        } else {
            await navigator.clipboard.writeText(url);
            setShareCopied(true);
            setTimeout(() => setShareCopied(false), 2000);
        }
    };

    // TV Show specific state
    const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason);
    const [selectedEpisode, setSelectedEpisode] = useState<number>(initialEpisode);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [fetchingEpisodes, setFetchingEpisodes] = useState(false);

    useEffect(() => {
        setSelectedSeason(initialSeason);
        setSelectedEpisode(initialEpisode);
    }, [initialSeason, initialEpisode]);

    const handleProgress = useCallback((p: number) => {
        setProgress(p);
        if (title) {
            // Save specific progress key for resumes
            localStorage.setItem(`cinevista_progress_${title.id}`, JSON.stringify({
                id: title.id,
                title: title.title,
                poster: title.poster,
                backdrop: title.backdrop,
                type: title.type === 'tv_series' ? 'tv' : 'movie',
                progress: p,
                timestamp: Date.now()
            }));

            // Save in the recents list
            const recents = JSON.parse(localStorage.getItem('cinevista_recents') || '[]');
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
            localStorage.setItem('cinevista_recents', JSON.stringify(updatedRecents));
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
        const list = JSON.parse(localStorage.getItem('cinevista_watchlist') || '[]');
        setInWatchlist(list.some((item: any) => String(item.id) === String(title.id)));
    }, [title]);

    const toggleWatchlist = () => {
        if (!title) return;
        let list = JSON.parse(localStorage.getItem('cinevista_watchlist') || '[]');
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
        localStorage.setItem('cinevista_watchlist', JSON.stringify(list));
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
                                        const newSeason = Number(val);
                                        setSelectedSeason(newSeason);
                                        setSelectedEpisode(1);
                                        router.push(createWatchEpisodeUrl(title.id, title.title, newSeason, 1), { scroll: false });
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
                                        <Link
                                            key={ep.id}
                                            href={createWatchEpisodeUrl(title.id, title.title, selectedSeason, ep.episode_number)}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedEpisode(ep.episode_number);
                                                router.push(createWatchEpisodeUrl(title.id, title.title, selectedSeason, ep.episode_number), { scroll: false });
                                            }}
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
                                        </Link>
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

            {/* ═══ AEO Content Block — Optimized for Google, ChatGPT, Perplexity ═══ */}
            {title && (
                <div className="border-t border-white/5 py-12 max-w-[1400px] mx-auto px-6 space-y-8">

                    {/* Section 1: About This Movie/Show */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-wider text-white">
                            {title.type === 'tv_series'
                                ? `Watch ${title.title} All Episodes Free Online`
                                : `About ${title.title} (${title.year || ''})`}
                        </h2>
                        <div className="text-white/60 leading-relaxed text-sm md:text-base space-y-4">
                            <p>
                                <strong>{title.title}</strong> is a {title.genre_names?.join(', ') || ''} {title.type === 'tv_series' ? 'TV series' : 'movie'}
                                {title.year ? ` released in ${title.year}` : ''}.
                                {title.user_rating > 0 ? ` It holds a rating of ${title.user_rating.toFixed(1)}/10.` : ''}
                                {title.runtime_minutes > 0 && title.type !== 'tv_series' ? ` The movie has a runtime of ${title.runtime_minutes} minutes.` : ''}
                                {title.type === 'tv_series' && title.number_of_seasons ? ` The series has ${title.number_of_seasons} season${title.number_of_seasons > 1 ? 's' : ''} with ${title.number_of_episodes || 'multiple'} episodes.` : ''}
                            </p>
                            <p>
                                <strong>Watch {title.title} online free</strong> on CineVista in HD quality.
                                Available with <strong>Hindi dubbed</strong> audio, <strong>Urdu subtitles</strong>, and English subtitles.
                                No registration or credit card required. Stream instantly with multiple server options for the best viewing experience.
                            </p>
                            {title.plot_overview && (
                                <p>{title.plot_overview}</p>
                            )}
                        </div>
                    </div>

                    {/* Section 2: Movie/Show Details Table — AEO Optimized */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 md:p-8">
                        <h3 className="text-lg font-black uppercase tracking-wider text-white/40 mb-6">
                            {title.type === 'tv_series' ? 'Series' : 'Movie'} Details
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody className="divide-y divide-white/5">
                                    <tr>
                                        <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider w-40">Title</td>
                                        <td className="py-3 text-white font-semibold">{title.title}</td>
                                    </tr>
                                    {title.original_title && title.original_title !== title.title && (
                                        <tr>
                                            <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Original Title</td>
                                            <td className="py-3 text-white/70">{title.original_title}</td>
                                        </tr>
                                    )}
                                    {title.year > 0 && (
                                        <tr>
                                            <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Year</td>
                                            <td className="py-3 text-white/70">{title.year}</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Type</td>
                                        <td className="py-3 text-white/70">{title.type === 'tv_series' ? 'TV Series' : 'Movie'}</td>
                                    </tr>
                                    {title.genre_names?.length > 0 && (
                                        <tr>
                                            <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Genre</td>
                                            <td className="py-3 text-white/70">{title.genre_names.join(', ')}</td>
                                        </tr>
                                    )}
                                    {title.runtime_minutes > 0 && title.type !== 'tv_series' && (
                                        <tr>
                                            <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Runtime</td>
                                            <td className="py-3 text-white/70">{title.runtime_minutes} minutes</td>
                                        </tr>
                                    )}
                                    {title.type === 'tv_series' && title.number_of_seasons && (
                                        <>
                                            <tr>
                                                <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Seasons</td>
                                                <td className="py-3 text-white/70">{title.number_of_seasons}</td>
                                            </tr>
                                            {title.number_of_episodes && (
                                                <tr>
                                                    <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Episodes</td>
                                                    <td className="py-3 text-white/70">{title.number_of_episodes}</td>
                                                </tr>
                                            )}
                                        </>
                                    )}
                                    {title.user_rating > 0 && (
                                        <tr>
                                            <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Rating</td>
                                            <td className="py-3 text-white/70">⭐ {title.user_rating.toFixed(1)} / 10</td>
                                        </tr>
                                    )}
                                    <tr>
                                        <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Audio</td>
                                        <td className="py-3 text-white/70">Hindi Dubbed, Original Audio</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Subtitles</td>
                                        <td className="py-3 text-white/70">English, Hindi, Urdu</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Quality</td>
                                        <td className="py-3 text-white/70">HD (720p) / Full HD (1080p)</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Cost</td>
                                        <td className="py-3 text-green-400 font-bold">Free — No Registration</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 text-white/40 font-bold uppercase text-xs tracking-wider">Platform</td>
                                        <td className="py-3 text-accent-orange font-bold">CineVista</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 3: Streaming Info */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 md:p-8 space-y-4">
                        <h3 className="text-lg font-black uppercase tracking-wider text-white mb-3">
                            How to Stream {title.title} Free on CineVista
                        </h3>
                        <div className="text-white/60 leading-relaxed text-sm md:text-base space-y-3">
                            <p>
                                CineVista provides <strong>4 streaming servers</strong> for <strong>{title.title}</strong> to ensure uninterrupted playback:
                            </p>
                            <ul className="space-y-2 ml-1">
                                <li className="flex items-center gap-2"><span className="text-purple-400">●</span> <strong>Server 1 (Cineverse)</strong> — Primary HD server with fast loading</li>
                                <li className="flex items-center gap-2"><span className="text-green-400">●</span> <strong>Server 2 (NxSha)</strong> — Backup server with multi-language support</li>
                                <li className="flex items-center gap-2"><span className="text-amber-400">●</span> <strong>Server 3 (ScreenScape)</strong> — Alternative with subtitle options</li>
                                <li className="flex items-center gap-2"><span className="text-blue-400">●</span> <strong>Server 4 (VidSrc)</strong> — Fallback server for maximum availability</li>
                            </ul>
                            <p>
                                For the best ad-free experience, we recommend using <strong>Brave browser</strong> or installing the <strong>uBlock Origin</strong> extension.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: FAQ — Triggers Google FAQ Rich Snippets + AEO */}
                    <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-6 md:p-8">
                        <h3 className="text-lg font-black uppercase tracking-wider text-white/40 mb-6">
                            Frequently Asked Questions
                        </h3>
                        <div className="space-y-3">
                            {[
                                {
                                    q: `Where can I watch ${title.title} online for free?`,
                                    a: `You can watch ${title.title} for free on CineVista (cinevista.online). We offer HD streaming with Hindi dubbed audio, Urdu subtitles, and English subtitles. No registration or credit card is required.`
                                },
                                {
                                    q: `Is ${title.title} available in Hindi dubbed?`,
                                    a: `Yes, ${title.title} is available with Hindi dubbed audio on CineVista. You can switch between original audio and Hindi dubbed versions using the server options. Urdu and English subtitles are also available.`
                                },
                                {
                                    q: `Do I need to sign up to watch ${title.title}?`,
                                    a: `No, CineVista does not require any registration, account creation, or credit card. You can start streaming ${title.title} instantly by selecting a server and pressing play.`
                                },
                                ...(title.type === 'tv_series' ? [{
                                    q: `How many seasons of ${title.title} are available?`,
                                    a: `${title.title} has ${title.number_of_seasons || 'multiple'} season${(title.number_of_seasons || 0) > 1 ? 's' : ''} available on CineVista${title.number_of_episodes ? ` with a total of ${title.number_of_episodes} episodes` : ''}. All episodes are available to stream for free in HD quality.`
                                }] : []),
                                {
                                    q: `What quality is ${title.title} available in?`,
                                    a: `${title.title} is available in HD (720p) and Full HD (1080p) quality on CineVista. The streaming quality depends on the server you choose and your internet connection speed.`
                                },
                            ].map((faq, idx) => (
                                <details key={idx} className="group border border-white/5 rounded-xl overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-white text-sm font-bold hover:bg-white/[0.03] transition-colors">
                                        <span>{faq.q}</span>
                                        <span className="text-white/30 group-open:rotate-45 transition-transform duration-200 text-lg">+</span>
                                    </summary>
                                    <div className="px-5 pb-4 text-white/50 text-sm leading-relaxed">
                                        {faq.a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="text-xs text-white/30 leading-relaxed px-2">
                        <strong>Disclaimer:</strong> CineVista is a metadata catalog and search guide. We index external stream players hosted on third-party domains. All content remains property of their respective copyright owners. For copyright queries, please read our <Link href="/dmca" className="text-accent-orange/60 hover:underline">DMCA policy</Link> or contact the hosting providers directly.
                    </div>
                </div>
            )}

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
                                href={createArtistUrl(member.id, member.name)}
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
                                    href={createWatchUrl(rec.id, mediaType, rec.title, rec.year)}
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
