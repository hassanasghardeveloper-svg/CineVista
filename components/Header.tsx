'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-gradient-to-b from-black/80 to-transparent py-5'}`}>
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
                {/* Logo - Left */}
                <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase group">
                    Cine<span className="text-accent-orange group-hover:text-white transition-colors">Vault</span>
                </Link>

                {/* Navigation - Center */}
                <nav className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    <Link href="/movies" className="text-sm font-bold text-white/70 hover:text-white transition-colors tracking-wide uppercase">
                        Movies
                    </Link>
                    <Link href="/tv" className="text-sm font-bold text-white/70 hover:text-white transition-colors tracking-wide uppercase">
                        TV Shows
                    </Link>
                </nav>

                {/* Search - Right */}
                <Link href="/search" className="hidden md:block p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all">
                    <Search className="w-5 h-5" />
                </Link>
            </div>
        </header>
    );
}
