'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Search, X, Play, Film, Tv, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SearchResult {
    id: number;
    title: string;
    type: 'movie' | 'tv';
    year: string;
    poster: string | null;
    image_url: string | null;
}

export default function Header() {
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Search bar state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch search suggestions
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setLoadingSuggestions(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
                if (res.ok) {
                    const data = await res.json();
                    setSuggestions(data.results?.slice(0, 5) || []);
                }
            } catch (err) {
                console.error('Error fetching suggestions:', err);
            } finally {
                setLoadingSuggestions(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);

    // Close search dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target as Node)
            ) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSuggestionClick = (id: number, type: 'movie' | 'tv') => {
        setSearchQuery('');
        setSuggestions([]);
        setIsSearchOpen(false);
        router.push(`/watch/${id}?type=${type}`);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            setSuggestions([]);
            setIsSearchOpen(false);
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMenuOpen ? 'bg-black/95 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-gradient-to-b from-black/80 to-transparent py-5'}`}>
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between relative">
                {/* Logo - Left */}
                <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase group z-50">
                    Cine<span className="text-accent-orange group-hover:text-white transition-colors">Vault</span>
                </Link>

                {/* Navigation - Center (Desktop) */}
                <nav className={`hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 transition-opacity duration-300 ${isSearchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                    <Link href="/movies" className="text-sm font-bold text-white/70 hover:text-white transition-colors tracking-wide uppercase">
                        Movies
                    </Link>
                    <Link href="/tv" className="text-sm font-bold text-white/70 hover:text-white transition-colors tracking-wide uppercase">
                        TV Shows
                    </Link>
                    <Link href="/artists" className="text-sm font-bold text-white/70 hover:text-white transition-colors tracking-wide uppercase">
                        Artists
                    </Link>
                </nav>

                {/* Mobile Navigation Menu */}
                <div className={`md:hidden fixed inset-0 bg-black flex flex-col items-center justify-center gap-8 transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                    <Link onClick={() => setIsMenuOpen(false)} href="/" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">Home</Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/movies" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">Movies</Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/tv" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">TV Shows</Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/artists" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">Artists</Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/search" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">Search</Link>
                </div>

                {/* Actions & Search - Right */}
                <div className="flex items-center gap-4 z-50" ref={searchContainerRef}>
                    {/* Autocomplete Search Bar */}
                    <div className="relative flex items-center">
                        {isSearchOpen ? (
                            <form onSubmit={handleSearchSubmit} className="flex items-center bg-white/5 border border-white/10 rounded-full pl-4 pr-2 py-1 md:w-80 transition-all duration-300">
                                <input
                                    type="text"
                                    placeholder="Search movies, TV shows..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none text-white focus:outline-none w-full text-xs font-bold"
                                    autoFocus
                                />
                                <button type="button" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSuggestions([]); }} className="p-1 text-white/40 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </form>
                        ) : (
                            <button
                                onClick={() => setIsSearchOpen(true)}
                                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        )}

                        {/* Search Autocomplete Suggestions Dropdown */}
                        {isSearchOpen && (suggestions.length > 0 || loadingSuggestions) && (
                            <div className="absolute right-0 top-full mt-3 w-80 md:w-96 bg-dark-900/95 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl z-50">
                                {loadingSuggestions ? (
                                    <div className="p-4 text-center">
                                        <div className="w-5 h-5 border-2 border-accent-orange border-t-transparent rounded-full animate-spin mx-auto" />
                                    </div>
                                ) : (
                                    <div className="p-2 divide-y divide-white/5">
                                        {suggestions.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSuggestionClick(item.id, item.type)}
                                                className="w-full text-left flex items-center gap-3 p-2 hover:bg-white/5 transition-colors rounded-xl group"
                                            >
                                                <div className="relative w-10 aspect-[2/3] bg-white/5 rounded overflow-hidden flex-shrink-0">
                                                    {item.poster ? (
                                                        <img
                                                            src={item.poster}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-black">
                                                            <Film className="w-4 h-4 text-white/10" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-xs text-white group-hover:text-accent-orange transition-colors truncate">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-[10px] text-white/40 font-semibold mt-0.5 uppercase tracking-wider flex items-center gap-1.5">
                                                        {item.type === 'tv' ? <Tv className="w-3 h-3 text-blue-400" /> : <Film className="w-3 h-3 text-purple-400" />}
                                                        {item.type === 'tv' ? 'TV Show' : 'Movie'}
                                                        {item.year && ` • ${item.year}`}
                                                    </p>
                                                </div>
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                                                    <Play className="w-4 h-4 text-accent-orange fill-current" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger menu */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-2"
                    >
                        <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                        <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-6 h-0.5 bg-white transition-all ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                    </button>
                </div>
            </div>
        </header>
    );
}
