'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled || isMenuOpen ? 'bg-black/95 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-gradient-to-b from-black/80 to-transparent py-5'}`}>
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between relative">
                {/* Logo - Left */}
                <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter text-white uppercase group z-50">
                    Cine<span className="text-accent-orange group-hover:text-white transition-colors">Vault</span>
                </Link>

                {/* Navigation - Center (Desktop) */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link href="/movies" className="text-sm font-bold text-white/70 hover:text-white transition-colors tracking-wide uppercase">
                        Movies
                    </Link>
                    <Link href="/tv" className="text-sm font-bold text-white/70 hover:text-white transition-colors tracking-wide uppercase">
                        TV Shows
                    </Link>
                </nav>

                {/* Mobile Navigation Menu */}
                <div className={`md:hidden fixed inset-0 bg-black flex flex-col items-center justify-center gap-8 transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
                    <Link onClick={() => setIsMenuOpen(false)} href="/" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">Home</Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/movies" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">Movies</Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/tv" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">TV Shows</Link>
                    <Link onClick={() => setIsMenuOpen(false)} href="/search" className="text-4xl font-black text-white hover:text-accent-orange transition-colors uppercase italic">Search</Link>
                </div>

                {/* Actions - Right */}
                <div className="flex items-center gap-4 z-50">
                    <Link href="/search" className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
                        <Search className="w-5 h-5" />
                    </Link>

                    {/* Hamburger Button */}
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
