'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Star,
    Play,
    Film,
    Tv,
    MapPin,
    Calendar,
    ExternalLink,
    Instagram,
    Twitter,
    User,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import Header from '@/components/Header';

interface PersonDetails {
    id: number;
    name: string;
    biography: string;
    birthday: string | null;
    deathday: string | null;
    place_of_birth: string | null;
    gender: number;
    known_for_department: string;
    popularity: number;
    profile_path: string | null;
    profile_path_large: string | null;
    imdb_id: string | null;
    instagram_id: string | null;
    twitter_id: string | null;
    images: { file_path: string; aspect_ratio: number }[];
    cast_credits: CreditItem[];
    crew_credits: CreditItem[];
}

interface CreditItem {
    id: number;
    title: string;
    media_type: 'movie' | 'tv';
    character?: string;
    job?: string;
    poster: string | null;
    backdrop: string | null;
    year: string;
    user_rating: number;
    vote_count?: number;
}

function calculateAge(birthday: string, deathday?: string | null): number {
    const birth = new Date(birthday);
    const end = deathday ? new Date(deathday) : new Date();
    return Math.floor((end.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function ArtistClient({
    initialPerson,
}: {
    initialPerson: PersonDetails;
}) {
    const params = useParams();
    const [person, setPerson] = useState<PersonDetails | null>(initialPerson);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [bioExpanded, setBioExpanded] = useState(false);
    const [activeTab, setActiveTab] = useState<'acting' | 'directing'>('acting');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    if (loading) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading artist...</p>
                </div>
            </main>
        );
    }

    if (error || !person) {
        return (
            <main className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/40 text-xl mb-4">{error || 'Artist not found'}</p>
                    <Link href="/" className="text-accent-orange hover:underline">← Back to Home</Link>
                </div>
            </main>
        );
    }

    const bioShort = person.biography.slice(0, 500);
    const bioLong = person.biography;
    const isBioLong = person.biography.length > 500;

    const age = person.birthday ? calculateAge(person.birthday, person.deathday) : null;

    return (
        <main className="min-h-screen bg-black">
            <Header />

            {/* Hero Section */}
            <div className="relative pt-20 overflow-hidden">
                {/* Background blur from profile image */}
                {person.profile_path_large && (
                    <div
                        className="absolute inset-0 opacity-10 bg-cover bg-center scale-110 blur-3xl"
                        style={{ backgroundImage: `url(${person.profile_path_large})` }}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />

                <div className="relative max-w-[1400px] mx-auto px-6 md:px-12 pt-16 pb-12">
                    {/* Back button */}
                    <button
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full text-xs font-bold border border-white/10 mb-10 hover:border-white/20"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </button>

                    <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start">
                        {/* Profile Image */}
                        <div className="flex-shrink-0 mx-auto md:mx-0">
                            <div
                                className="relative w-56 h-56 md:w-72 md:h-72 rounded-3xl overflow-hidden shadow-2xl border border-white/10 cursor-pointer group"
                                onClick={() => person.profile_path_large && setSelectedImage(person.profile_path_large)}
                            >
                                {person.profile_path ? (
                                    <img
                                        src={person.profile_path}
                                        alt={person.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                        <User className="w-20 h-20 text-white/10" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                    <span className="text-white font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 px-3 py-1 rounded-full">
                                        View Photo
                                    </span>
                                </div>
                            </div>

                            {/* Popularity Badge */}
                            {person.popularity > 0 && (
                                <div className="mt-4 text-center">
                                    <div className="inline-flex items-center gap-2 bg-accent-orange/10 border border-accent-orange/20 px-4 py-2 rounded-full">
                                        <Star className="w-3 h-3 text-accent-orange fill-current" />
                                        <span className="text-accent-orange text-xs font-black uppercase tracking-widest">
                                            Popularity {person.popularity.toFixed(0)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 text-center md:text-left">
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                <span className="bg-white/10 text-white/60 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                    {person.known_for_department}
                                </span>
                                {person.deathday && (
                                    <span className="bg-red-900/30 text-red-400 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-red-900/30">
                                        In Memoriam
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter mb-6 leading-none">
                                {person.name}
                            </h1>

                            {/* Stats Row */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8 text-white/40">
                                {person.birthday && (
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-accent-orange" />
                                        <div>
                                            <p className="text-xs font-bold text-white/60">
                                                {formatDate(person.birthday)}
                                                {person.deathday ? ` – ${formatDate(person.deathday)}` : ''}
                                            </p>
                                            {age !== null && (
                                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">
                                                    {person.deathday ? `Aged ${age}` : `Age ${age}`}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                                {person.place_of_birth && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-accent-orange" />
                                        <p className="text-xs font-bold text-white/60">{person.place_of_birth}</p>
                                    </div>
                                )}
                            </div>

                            {/* Biography */}
                            {person.biography && (
                                <div className="mb-8 max-w-3xl">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-3">Biography</h3>
                                    <p className="text-white/60 text-base leading-relaxed">
                                        {isBioLong && !bioExpanded ? `${bioShort}...` : bioLong}
                                    </p>
                                    {isBioLong && (
                                        <button
                                            onClick={() => setBioExpanded(!bioExpanded)}
                                            className="mt-3 flex items-center gap-1 text-accent-orange text-xs font-black uppercase tracking-widest hover:text-accent-orange/70 transition-colors mx-auto md:mx-0"
                                        >
                                            {bioExpanded ? (
                                                <><ChevronUp className="w-3 h-3" /> Show Less</>
                                            ) : (
                                                <><ChevronDown className="w-3 h-3" /> Read More</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* External Links */}
                            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                {person.imdb_id && (
                                    <a
                                        href={`https://www.imdb.com/name/${person.imdb_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        IMDB <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                                {person.instagram_id && (
                                    <a
                                        href={`https://www.instagram.com/${person.instagram_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-400 px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        <Instagram className="w-3 h-3" /> Instagram
                                    </a>
                                )}
                                {person.twitter_id && (
                                    <a
                                        href={`https://twitter.com/${person.twitter_id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-blue-400/10 hover:bg-blue-400/20 border border-blue-400/20 text-blue-400 px-4 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        <Twitter className="w-3 h-3" /> Twitter
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Photo Gallery */}
            {person.images && person.images.length > 1 && (
                <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 border-t border-white/5">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white/30 mb-6">Photo Gallery</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {person.images.map((img, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedImage(img.file_path)}
                                className="flex-shrink-0 w-32 h-40 md:w-40 md:h-52 rounded-xl overflow-hidden border border-white/10 hover:border-accent-orange/50 transition-all duration-300 group"
                            >
                                <img
                                    src={img.file_path}
                                    alt={`${person.name} photo ${i + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Filmography */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 border-t border-white/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">
                        Filmography
                    </h2>

                    {person.crew_credits.length > 0 && (
                        <div className="flex gap-2 bg-white/5 p-1 rounded-full border border-white/10">
                            <button
                                onClick={() => setActiveTab('acting')}
                                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'acting'
                                    ? 'bg-accent-orange text-white'
                                    : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                Acting
                            </button>
                            <button
                                onClick={() => setActiveTab('directing')}
                                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'directing'
                                    ? 'bg-accent-orange text-white'
                                    : 'text-white/40 hover:text-white'
                                    }`}
                            >
                                Directing / Crew
                            </button>
                        </div>
                    )}
                </div>

                {activeTab === 'acting' && (
                    <>
                        {person.cast_credits.length > 0 ? (
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                {person.cast_credits.map((credit) => (
                                    <FilmographyCard key={`${credit.id}-${credit.character}`} credit={credit} />
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/20 text-center py-12">No acting credits found.</p>
                        )}
                    </>
                )}

                {activeTab === 'directing' && (
                    <>
                        {person.crew_credits.length > 0 ? (
                            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                                {person.crew_credits.map((credit) => (
                                    <FilmographyCard key={`${credit.id}-${credit.job}`} credit={credit} isCrew />
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/20 text-center py-12">No directing/crew credits found.</p>
                        )}
                    </>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute -top-12 right-0 text-white/60 hover:text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                        >
                            Close ✕
                        </button>
                        <img
                            src={selectedImage}
                            alt={person.name}
                            className="w-full h-auto max-h-[85vh] object-contain rounded-2xl border border-white/10 shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </main>
    );
}

function FilmographyCard({ credit, isCrew = false }: { credit: CreditItem; isCrew?: boolean }) {
    const mediaType = credit.media_type === 'tv' ? 'tv' : 'movie';
    return (
        <Link
            href={`/watch/${credit.id}?type=${mediaType}`}
            className="group flex flex-col bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-accent-orange/30 hover:bg-white/[0.04] transition-all duration-300"
        >
            <div className="relative aspect-[2/3] w-full bg-white/5 overflow-hidden">
                {credit.poster ? (
                    <img
                        src={credit.poster}
                        alt={credit.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black">
                        {mediaType === 'tv' ? (
                            <Tv className="w-8 h-8 text-white/10" />
                        ) : (
                            <Film className="w-8 h-8 text-white/10" />
                        )}
                    </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                    <div className="w-8 h-8 rounded-full bg-accent-orange text-white flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                </div>
                {/* Rating Badge */}
                {credit.user_rating > 0 && (
                    <span className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-black text-white flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 text-accent-orange fill-current" />
                        {credit.user_rating.toFixed(1)}
                    </span>
                )}
                {/* Media type badge */}
                <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[8px] font-black text-white/70 uppercase tracking-wider">
                    {mediaType === 'tv' ? 'TV' : 'Film'}
                </span>
            </div>
            <div className="p-2.5 flex-1 flex flex-col justify-between">
                <h4 className="font-black text-[10px] md:text-xs text-white group-hover:text-accent-orange transition-colors line-clamp-2 leading-tight">
                    {credit.title}
                </h4>
                <div className="mt-1">
                    <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">{credit.year || 'TBA'}</p>
                    {isCrew && credit.job && (
                        <p className="text-[9px] text-accent-orange/60 font-bold mt-0.5 uppercase tracking-wider">{credit.job}</p>
                    )}
                    {!isCrew && credit.character && (
                        <p className="text-[9px] text-white/30 font-bold mt-0.5 line-clamp-1 italic">{credit.character}</p>
                    )}
                </div>
            </div>
        </Link>
    );
}
