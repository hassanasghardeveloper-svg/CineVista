'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Film, Tv, Search } from 'lucide-react';

export default function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { label: 'Home', icon: Home, href: '/' },
        { label: 'Movies', icon: Film, href: '/movies' },
        { label: 'TV Shows', icon: Tv, href: '/tv' },
        { label: 'Search', icon: Search, href: '/search' },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-2xl border-t border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-accent-orange scale-110' : 'text-white/50 hover:text-white'
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                            <span className="text-[10px] font-bold uppercase tracking-tighter">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
