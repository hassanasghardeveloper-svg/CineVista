'use client';

import { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import MovieCard from '../../components/MovieCard';
import Footer from '../../components/Footer';
import CustomDropdown from '@/components/CustomDropdown';
import { Movie } from '../page';
import { POSTER_PLACEHOLDER, BACKDROP_PLACEHOLDER } from '@/lib/placeholders';
import { ChevronDown, ChevronUp } from 'lucide-react';

function transformMovie(apiMovie: any): Movie {
    return {
        id: String(apiMovie.id),
        title: apiMovie.title || 'Unknown Title',
        overview: apiMovie.plot_overview || 'No description available.',
        posterPath: apiMovie.poster || POSTER_PLACEHOLDER,
        backdropPath: apiMovie.backdrop || apiMovie.poster || BACKDROP_PLACEHOLDER,
        releaseDate: apiMovie.release_date || apiMovie.year?.toString() || '',
        rating: apiMovie.user_rating || 0,
        type: apiMovie.type || 'tv',
        genres: apiMovie.genre_names || [],
    };
}

type Category =
    | 'trending' | 'popular' | 'top_rated'
    | 'pakistani' | 'punjabi' | 'indian' | 'turkish' | 'hollywood' | 'korean' | 'arabic' | 'french'
    | 'webseries' | 'animation' | 'horror' | 'romance' | 'thriller' | 'drama';

interface CategoryGroup {
    label: string;
    emoji: string;
    items: { value: Category; label: string }[];
}

const CATEGORY_GROUPS: CategoryGroup[] = [
    {
        label: 'Charts',
        emoji: '📊',
        items: [
            { value: 'trending', label: '🔥 Trending' },
            { value: 'popular', label: '🌟 Popular' },
            { value: 'top_rated', label: '🏆 Top Rated' },
        ],
    },
    {
        label: 'Regional',
        emoji: '🌍',
        items: [
            { value: 'hollywood', label: '🇺🇸 Hollywood' },
            { value: 'indian', label: '🇮🇳 Bollywood' },
            { value: 'pakistani', label: '🇵🇰 Pakistani' },
            { value: 'punjabi', label: '🌾 Punjabi' },
            { value: 'turkish', label: '🇹🇷 Turkish' },
            { value: 'korean', label: '🇰🇷 Korean' },
            { value: 'arabic', label: '🌙 Arabic' },
            { value: 'french', label: '🇫🇷 French' },
        ],
    },
    {
        label: 'Genre',
        emoji: '🎭',
        items: [
            { value: 'webseries', label: '📺 Web Series' },
            { value: 'animation', label: '🦄 Animation' },
            { value: 'horror', label: '👻 Horror' },
            { value: 'romance', label: '💖 Romance' },
            { value: 'thriller', label: '🔪 Thriller' },
            { value: 'drama', label: '🎭 Drama' },
        ],
    },
];

// Flat map for label lookup
const CATEGORY_LABEL: Record<string, string> = {};
CATEGORY_GROUPS.forEach(g => g.items.forEach(i => { CATEGORY_LABEL[i.value] = i.label; }));


export default function TVPage() {
    const [series, setSeries] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<Category>('trending');
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(10);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

    // Close category dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target as Node)) {
                setIsCategoryOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Filters state
    const [allGenres, setAllGenres] = useState<string[]>([]);
    const [selectedGenre, setSelectedGenre] = useState<string>('All');
    const [selectedYearRange, setSelectedYearRange] = useState<string>('All');
    const [sortBy, setSortBy] = useState<string>('default');

    useEffect(() => {
        async function fetchTVShows() {
            setLoading(true);
            setSeries([]);
            setSelectedGenre('All');
            setSelectedYearRange('All');
            setSortBy('default');
            try {
                // Fetch 10 pages in parallel (200 shows)
                const pages = Array.from({ length: 10 }, (_, i) => i + 1);
                const results = await Promise.all(
                    pages.map(page =>
                        fetch(`/api/movies?type=tv&category=${activeTab}&page=${page}`)
                            .then(res => res.json())
                    )
                );

                const allShows: Movie[] = [];
                const seenIds = new Set<string>();

                results.forEach(data => {
                    if (data.titles) {
                        data.titles.forEach((show: any) => {
                            const transformed = transformMovie(show);
                            if (!seenIds.has(transformed.id)) {
                                seenIds.add(transformed.id);
                                allShows.push(transformed);
                            }
                        });
                    }
                });

                setSeries(allShows);
                setCurrentPage(10);
            } catch (error) {
                console.error('Failed to fetch TV shows:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTVShows();
    }, [activeTab]);

    // Extract unique genres dynamically
    useEffect(() => {
        if (series.length > 0) {
            const genresSet = new Set<string>();
            series.forEach(s => {
                if (s.genres) {
                    s.genres.forEach(g => genresSet.add(g));
                }
            });
            setAllGenres(Array.from(genresSet).sort());
        }
    }, [series]);

    const loadMore = async () => {
        setLoadingMore(true);
        try {
            const pages = Array.from({ length: 5 }, (_, i) => currentPage + i + 1);
            const results = await Promise.all(
                pages.map(page =>
                    fetch(`/api/movies?type=tv&category=${activeTab}&page=${page}`)
                        .then(res => res.json())
                )
            );

            const newShows: Movie[] = [];
            const seenIds = new Set(series.map(s => s.id));

            results.forEach(data => {
                if (data.titles) {
                    data.titles.forEach((show: any) => {
                        const transformed = transformMovie(show);
                        if (!seenIds.has(transformed.id)) {
                            seenIds.add(transformed.id);
                            newShows.push(transformed);
                        }
                    });
                }
            });

            setSeries(prev => [...prev, ...newShows]);
            setCurrentPage(prev => prev + 5);
        } catch (error) {
            console.error('Failed to load more:', error);
        } finally {
            setLoadingMore(false);
        }
    };

    const handleTabChange = (tab: Category) => {
        setActiveTab(tab);
    };

    // Filter and Sort TV Shows Client-side
    const getFilteredSeries = () => {
        let result = [...series];

        // 1. Genre filter
        if (selectedGenre !== 'All') {
            result = result.filter(s => s.genres && s.genres.includes(selectedGenre));
        }

        // 2. Year Range filter
        if (selectedYearRange !== 'All') {
            result = result.filter(s => {
                if (!s.releaseDate) return false;
                const year = parseInt(s.releaseDate.split('-')[0]);
                if (isNaN(year)) return false;

                switch (selectedYearRange) {
                    case '2026': return year === 2026;
                    case '2025': return year === 2025;
                    case '2024': return year === 2024;
                    case '2023': return year === 2023;
                    case '2022': return year === 2022;
                    case '2020-2021': return year >= 2020 && year <= 2021;
                    case '2010s': return year >= 2010 && year <= 2019;
                    case '2000s': return year >= 2000 && year <= 2009;
                    case 'Older': return year < 2000;
                    default: return true;
                }
            });
        }

        // 3. Sorting
        if (sortBy === 'rating') {
            result.sort((a, b) => b.rating - a.rating);
        } else if (sortBy === 'year') {
            result.sort((a, b) => {
                const yearA = parseInt(a.releaseDate.split('-')[0]) || 0;
                const yearB = parseInt(b.releaseDate.split('-')[0]) || 0;
                return yearB - yearA;
            });
        } else if (sortBy === 'popularity') {
            // Default list order from TMDB is already sorted by popularity, so we sort back to default order
            result = [...series].filter(s => {
                const matchesGenre = selectedGenre === 'All' || (s.genres && s.genres.includes(selectedGenre));
                let matchesYear = true;
                if (selectedYearRange !== 'All' && s.releaseDate) {
                    const y = parseInt(s.releaseDate.split('-')[0]);
                    switch (selectedYearRange) {
                        case '2026': matchesYear = y === 2026; break;
                        case '2025': matchesYear = y === 2025; break;
                        case '2024': matchesYear = y === 2024; break;
                        case '2023': matchesYear = y === 2023; break;
                        case '2022': matchesYear = y === 2022; break;
                        case '2020-2021': matchesYear = y >= 2020 && y <= 2021; break;
                        case '2010s': matchesYear = y >= 2010 && y <= 2019; break;
                        case '2000s': matchesYear = y >= 2000 && y <= 2009; break;
                        case 'Older': matchesYear = y < 2000; break;
                    }
                }
                return matchesGenre && matchesYear;
            });
        }

        return result;
    };

    const filteredSeries = getFilteredSeries();

    return (
        <main className="min-h-screen bg-black">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1600px] mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        TV Shows
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mb-2">
                        {loading ? 'Loading 200+ TV shows...' : `Showing ${filteredSeries.length} of ${series.length} shows`}
                    </p>

                    {/* Category Grouped Dropdown */}
                    <div className="relative mt-8 mb-10" ref={categoryRef}>
                        {/* Trigger Button */}
                        <button
                            onClick={() => setIsCategoryOpen(o => !o)}
                            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-white/20 transition-all text-white font-bold text-sm"
                        >
                            <span className="text-base">{CATEGORY_LABEL[activeTab]}</span>
                            <span className="ml-auto text-white/40">
                                {isCategoryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </span>
                        </button>

                        {/* Dropdown Panel */}
                        {isCategoryOpen && (
                            <div className="absolute top-full left-0 mt-3 z-40 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-5 min-w-[520px] md:min-w-[640px]">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {CATEGORY_GROUPS.map(group => (
                                        <div key={group.label}>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 flex items-center gap-1.5">
                                                <span>{group.emoji}</span> {group.label}
                                            </p>
                                            <div className="flex flex-col gap-1">
                                                {group.items.map(item => (
                                                    <button
                                                        key={item.value}
                                                        onClick={() => { handleTabChange(item.value); setIsCategoryOpen(false); }}
                                                        className={`text-left px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                                                            activeTab === item.value
                                                                ? 'bg-accent-orange text-white shadow-[0_0_12px_rgba(232,124,0,0.3)]'
                                                                : 'text-white/60 hover:text-white hover:bg-white/[0.06]'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Advanced Dropdown Filters */}
                    {!loading && series.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 bg-white/[0.02] border border-white/5 p-4 rounded-2xl">
                            {/* Genre Filter */}
                            <CustomDropdown
                                label="Genre"
                                value={selectedGenre}
                                options={[
                                    { value: 'All', label: 'All Genres' },
                                    ...allGenres.map(g => ({ value: g, label: g }))
                                ]}
                                onChange={(val) => setSelectedGenre(val)}
                            />

                            {/* Year Filter */}
                            <CustomDropdown
                                label="Release Year"
                                value={selectedYearRange}
                                options={[
                                    { value: 'All', label: 'All Years' },
                                    { value: '2026', label: '2026' },
                                    { value: '2025', label: '2025' },
                                    { value: '2024', label: '2024' },
                                    { value: '2023', label: '2023' },
                                    { value: '2022', label: '2022' },
                                    { value: '2020-2021', label: '2020 - 2021' },
                                    { value: '2010s', label: '2010s' },
                                    { value: '2000s', label: '2000s' },
                                    { value: 'Older', label: 'Older' }
                                ]}
                                onChange={(val) => setSelectedYearRange(val)}
                            />

                            {/* Sort By Filter */}
                            <CustomDropdown
                                label="Sort By"
                                value={sortBy}
                                options={[
                                    { value: 'default', label: 'Default' },
                                    { value: 'popularity', label: 'Popularity (High - Low)' },
                                    { value: 'rating', label: 'Rating (High - Low)' },
                                    { value: 'year', label: 'Release Year (New - Old)' }
                                ]}
                                onChange={(val) => setSortBy(val)}
                            />
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-accent-orange border-t-transparent rounded-full animate-spin mb-4" />
                        <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Loading 200+ TV shows...</p>
                    </div>
                ) : filteredSeries.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {filteredSeries.map(show => (
                                <MovieCard key={show.id} movie={show} />
                            ))}
                        </div>

                        {/* Load More Button */}
                        <div className="flex justify-center mt-12">
                            <button
                                onClick={loadMore}
                                disabled={loadingMore}
                                className="px-8 py-4 rounded-full font-bold text-sm uppercase tracking-widest bg-accent-orange text-white hover:bg-accent-orange/80 disabled:opacity-50 transition-all"
                            >
                                {loadingMore ? 'Loading...' : 'Load More TV Shows'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="py-20 text-center">
                        <p className="text-white/20 text-xl">No TV shows match the selected filters.</p>
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
