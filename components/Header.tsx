'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';

interface HeaderProps {
    onAddClick: () => void;
}

export default function Header({ onAddClick }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 0);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/80 backdrop-blur-md py-4' : 'bg-transparent py-6'}`}>
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase">
                    Cine<span className="text-accent-orange">Vault</span>
                </Link>

                <div className="flex items-center gap-6">
                    <button onClick={onAddClick} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-xs font-black uppercase hover:bg-accent-orange hover:text-white transition-all active:scale-95">
                        <Plus className="w-4 h-4" />
                        Add Movie
                    </button>
                </div>
            </div>
        </header>
    );
}
