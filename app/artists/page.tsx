'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Star, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Artist {
    id: number;
    name: string;
    known_for_department: string;
    profile_path: string | null;
    popularity: number;
    known_for: { id: number; title: string; media_type: string }[];
}

type Category = 'popular' | 'trending';

export default function ArtistsPage() {
    const [artists, setArtists] = useState<Artist[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState<Category>('popular');

    useEffect(() => {
        async function fetchArtists() {
            setLoading(true);
            setArtists([]);
            try {
                const pages = [1, 2, 3, 4, 5];
                const results = await Promise.all(
                    pages.map(p =>
                        fetch(`/api/artists?category=${activeTab}&page=${p}`).then(r => r.json())
                    )
                );

                const allArtists: Artist[] = [];
                const seenIds = new Set<number>();
                results.forEach(data => {
                    data.people?.forEach((a: Artist) => {
                        if (!seenIds.has(a.id)) {
                            seenIds.add(a.id);
                            allArtists.push(a);
                        }
                    });
                });

                setArtists(allArtists);
                setCurrentPage(5);
            } catch (err) {
                console.error('Failed to fetch artists:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchArtists();
    }, [activeTab]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const pages = [currentPage + 1, currentPage + 2, currentPage + 3];
            const results = await Promise.all(
                pages.map(p =>
                    fetch(`/api/artists?category=${activeTab}&page=${p}`).then(r => r.json())
                )
            );

            const seenIds = new Set(artists.map(a => a.id));
            const newArtists: Artist[] = [];
            results.forEach(data => {
                data.people?.forEach((a: Artist) => {
                    if (!seenIds.has(a.id)) {
                        seenIds.add(a.id);
                        newArtists.push(a);
                    }
                });
            });

            setArtists(prev => [...prev, ...newArtists]);
            setCurrentPage(prev => prev + 3);
        } catch (err) {
            console.error('Failed to load more:', err);
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <main className="min-h-screen bg-black">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-3">
                        Artists
                    </h1>
                    <p className="text-white/40 text-lg mb-8">
                        {loading ? 'Loading artists...' : `${artists.length} artists`}
                    </p>

                    {/* Tabs */}
                    <div className="flex gap-3">
                        {(['popular', 'trending'] as Category[]).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab
                                    ? 'bg-accent-orange text-white'
                                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                                    }`}
                            >
                                {tab === 'trending' ? <TrendingUp className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading artists...</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-6">
                            {artists.map((artist, i) => (
                                <ArtistCard key={artist.id} artist={artist} rank={i + 1} />
                            ))}
                        </div>

                        {/* Load More */}
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest bg-accent-orange text-white hover:bg-accent-orange/80 disabled:opacity-50 transition-all"
                            >
                                {loadingMore ? 'Loading...' : 'Load More Artists'}
                            </button>
                        </div>
                    </>
                )}
            </div>

            <Footer />
        </main>
    );
}

function ArtistCard({ artist, rank }: { artist: Artist; rank: number }) {
    return (
        <Link
            href={`/artist/${artist.id}`}
            className="group relative flex flex-col items-center text-center"
        >
            {/* Photo */}
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-white/5 border border-white/5 group-hover:border-accent-orange/40 transition-all duration-300 shadow-xl group-hover:shadow-accent-orange/10 mb-3">
                {artist.profile_path ? (
                    <img
                        src={artist.profile_path}
                        alt={artist.name}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                        <User className="w-12 h-12 text-white/10" />
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Rank badge */}
                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white/60 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                    #{rank}
                </span>

                {/* Popularity */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center justify-center gap-1">
                        <Star className="w-3 h-3 text-accent-orange fill-current" />
                        <span className="text-white text-[10px] font-black">{artist.popularity.toFixed(0)}</span>
                    </div>
                </div>
            </div>

            {/* Name */}
            <h3 className="font-black text-xs md:text-sm text-white group-hover:text-accent-orange transition-colors line-clamp-1 w-full">
                {artist.name}
            </h3>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider mt-0.5">
                {artist.known_for_department}
            </p>

            {/* Known For */}
            {artist.known_for.length > 0 && (
                <p className="text-[9px] text-white/20 mt-1 line-clamp-1 w-full">
                    {artist.known_for.map(k => k.title).join(' · ')}
                </p>
            )}
        </Link>
    );
}
