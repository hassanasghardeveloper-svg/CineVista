'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import Footer from '../components/Footer';
import { Movie } from './page';
import { POSTER_PLACEHOLDER, BACKDROP_PLACEHOLDER } from '@/lib/placeholders';
import { HelpCircle, Play, Laptop, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

function mapLocalToMovie(localItem: any): Movie {
    return {
        id: String(localItem.id),
        title: localItem.title || 'Unknown Title',
        overview: '',
        posterPath: localItem.poster || POSTER_PLACEHOLDER,
        backdropPath: localItem.backdrop || BACKDROP_PLACEHOLDER,
        releaseDate: localItem.year || '',
        rating: localItem.user_rating || 0,
        type: localItem.type || 'movie',
        genres: []
    };
}

interface HomeClientProps {
    initialTrending: Movie[];
    initialNewest: Movie[];
    initialTvSeries: Movie[];
    initialTopRated: Movie[];
    initialAction: Movie[];
    initialComedy: Movie[];
    initialHorror: Movie[];
    initialIndian: Movie[];
    initialPakistani: Movie[];
    initialPunjabi: Movie[];
    initialTurkish: Movie[];
    initialKorean: Movie[];
}

export default function HomeClient({
    initialTrending,
    initialNewest,
    initialTvSeries,
    initialTopRated,
    initialAction,
    initialComedy,
    initialHorror,
    initialIndian,
    initialPakistani,
    initialPunjabi,
    initialTurkish,
    initialKorean,
}: HomeClientProps) {
    const [trending] = useState<Movie[]>(initialTrending);
    const [newest] = useState<Movie[]>(initialNewest);
    const [tvSeries] = useState<Movie[]>(initialTvSeries);
    const [topRated] = useState<Movie[]>(initialTopRated);
    const [action] = useState<Movie[]>(initialAction);
    const [comedy] = useState<Movie[]>(initialComedy);
    const [horror] = useState<Movie[]>(initialHorror);
    const [indian] = useState<Movie[]>(initialIndian);
    const [pakistani] = useState<Movie[]>(initialPakistani);
    const [punjabi] = useState<Movie[]>(initialPunjabi);
    const [turkish] = useState<Movie[]>(initialTurkish);
    const [korean] = useState<Movie[]>(initialKorean);

    // Personalization rows
    const [continueWatching, setContinueWatching] = useState<Movie[]>([]);
    const [watchlist, setWatchlist] = useState<Movie[]>([]);
    const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        // Load personalized items from localStorage on mount
        const recents = JSON.parse(localStorage.getItem('cinevault_recents') || '[]');
        setContinueWatching(recents.map(mapLocalToMovie));

        const savedWatchlist = JSON.parse(localStorage.getItem('cinevault_watchlist') || '[]');
        setWatchlist(savedWatchlist.map(mapLocalToMovie));
    }, []);

    const toggleFaq = (index: number) => {
        setFaqOpen(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const heroContent = trending.length > 0 ? trending.slice(0, 6) : [];

    const faqs = [
        {
            q: "Is CineVault completely free to use?",
            a: "Yes! CineVault is 100% free to access. We do not charge subscriptions, rental fees, or require any form of payment. Our catalog indexes embed links from public, independent video hosting servers."
        },
        {
            q: "Do I need to sign up or create an account?",
            a: "No registration is required. You can watch any movie or TV series instantly without creating an email account. Your bookmarks and watch history are stored strictly on your local browser cache to preserve your privacy."
        },
        {
            q: "How does the 'Continue Watching' watchlist resume progress work?",
            a: "We utilize client-side HTML5 LocalStorage technology. When you stream content on our server options, our players update your progress percentage locally in your browser. This enables you to resume playback exactly where you left off."
        },
        {
            q: "What types of regional movies and TV series are available?",
            a: "CineVault features specialized categories for Pakistani Cinema, Bollywood Hits, Punjabi Cinema, and Turkish Drama series (often dubbed in Hindi or Urdu). We also provide standard Hollywood releases, action, horror, and comedy content."
        },
        {
            q: "How can I prevent unwanted popup ads from streaming servers?",
            a: "Because streams are loaded via third-party iframe codes, these providers occasionally trigger redirects. For the best ad-free streaming experience, we recommend accessing CineVault using privacy-focused browsers like Brave, or installing extensions such as uBlock Origin."
        }
    ];

    return (
        <main className="min-h-screen bg-black text-white">
            <Header />
            
            {heroContent.length > 0 && (
                <>
                    <HeroSection movies={heroContent} />
                    <div className="relative z-10 py-20 space-y-20">
                        {continueWatching.length > 0 && (
                            <MovieRow title="Continue Watching" movies={continueWatching} />
                        )}
                        {watchlist.length > 0 && (
                            <MovieRow title="My Watchlist" movies={watchlist} />
                        )}
                        <MovieRow title="Trending Now" movies={trending} />
                        <MovieRow title="New Releases" movies={newest} />
                        <MovieRow title="Popular TV Series" movies={tvSeries} />
                        {pakistani.length > 0 && <MovieRow title="🇵🇰 Pakistani Cinema" movies={pakistani} />}
                        {indian.length > 0 && <MovieRow title="🇮🇳 Bollywood Hits" movies={indian} />}

                        {/* AI Picks Banner */}
                        <div className="px-6 md:px-12">
                            <a href="/recommend" className="group flex flex-col md:flex-row items-center gap-6 bg-gradient-to-r from-accent-orange/10 via-purple-600/10 to-accent-orange/5 border border-accent-orange/20 rounded-2xl p-6 md:p-8 hover:border-accent-orange/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(232,124,0,0.1)]">
                                <div className="text-4xl md:text-5xl">🤖</div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <span className="text-accent-orange text-[10px] font-black uppercase tracking-widest">Powered by Groq AI</span>
                                    </div>
                                    <h3 className="text-white font-black text-xl md:text-2xl uppercase tracking-tight mb-1">Not Sure What to Watch?</h3>
                                    <p className="text-white/40 text-sm">Urdu, Hindi ya English mein batao — AI aapke liye perfect movie/drama recommend karega</p>
                                </div>
                                <div className="flex items-center gap-2 bg-accent-orange text-white px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest group-hover:bg-amber-500 transition-colors whitespace-nowrap">
                                    ✨ Try AI Picks
                                </div>
                            </a>
                        </div>

                        {punjabi.length > 0 && <MovieRow title="🌾 Punjabi Hits" movies={punjabi} />}
                        {turkish.length > 0 && <MovieRow title="🇹🇷 Turkish Drama" movies={turkish} />}
                        {korean.length > 0 && <MovieRow title="🇰🇷 Korean Drama" movies={korean} />}
                        <MovieRow title="Top Rated" movies={topRated} />
                        <MovieRow title="Action Movies" movies={action} />
                        {comedy.length > 0 && <MovieRow title="Comedy Movies" movies={comedy} />}
                        {horror.length > 0 && <MovieRow title="Horror & Thrillers" movies={horror} />}
                    </div>

                    {/* SEO & FAQ Copy Section at the Bottom */}
                    <div className="border-t border-white/5 bg-gradient-to-b from-black to-dark-950 py-20 px-6 md:px-12 relative z-10">
                        <div className="max-w-[1200px] mx-auto grid md:grid-cols-[1fr_1.2fr] gap-12 md:gap-20">
                            {/* SEO Copy Section */}
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2.5 bg-accent-orange/10 border border-accent-orange/20 px-4 py-2 rounded-full">
                                    <ShieldCheck className="w-4 h-4 text-accent-orange" />
                                    <span className="text-accent-orange text-xs font-black uppercase tracking-widest">
                                        About CineVault
                                    </span>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
                                    Stream Movies & TV Shows Online Free
                                </h1>
                                <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                    Welcome to **CineVault**, your premium search catalog and streaming guide for free movies, TV series, and regional dramas. We index public video links from third-party hosts to bring you the best available playback resolutions without requiring an account.
                                </p>
                                
                                <div className="grid grid-cols-2 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-accent-orange font-bold">
                                            <Play className="w-4 h-4 fill-current" />
                                            <span className="text-xs uppercase tracking-wider font-black">Multi-Server Play</span>
                                        </div>
                                        <p className="text-[11px] text-white/45 leading-relaxed">
                                            Switch between Cineverse, Nxsha, and Screenscape servers if any stream lags.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-accent-orange font-bold">
                                            <Laptop className="w-4 h-4" />
                                            <span className="text-xs uppercase tracking-wider font-black">Local Watch history</span>
                                        </div>
                                        <p className="text-[11px] text-white/45 leading-relaxed">
                                            Bookmarks and resume points are saved client-side for zero database registration.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ Section */}
                            <div className="space-y-6">
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                                    <HelpCircle className="w-5 h-5 text-accent-orange" />
                                    Frequently Asked Questions
                                </h2>
                                
                                <div className="space-y-3">
                                    {faqs.map((faq, i) => {
                                        const isOpen = !!faqOpen[i];
                                        return (
                                            <div 
                                                key={i} 
                                                className="border border-white/5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all overflow-hidden"
                                            >
                                                <button
                                                    onClick={() => toggleFaq(i)}
                                                    className="w-full text-left p-4 flex justify-between items-center gap-4 focus:outline-none"
                                                >
                                                    <span className="font-bold text-sm text-white/90">{faq.q}</span>
                                                    {isOpen ? <ChevronUp className="w-4 h-4 text-accent-orange flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />}
                                                </button>
                                                {isOpen && (
                                                    <div className="p-4 pt-0 text-xs md:text-sm text-white/50 leading-relaxed border-t border-white/5 bg-black/20">
                                                        {faq.a}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Footer />
                </>
            )}
        </main>
    );
}
