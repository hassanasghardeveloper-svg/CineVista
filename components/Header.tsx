'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface HeaderProps {
    onAddClick: () => void
}

export default function Header({ onAddClick }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setIsScrolled(true)
            } else {
                setIsScrolled(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${isScrolled
                ? 'bg-black/60 backdrop-blur-lg border-b border-white/10 py-3'
                : 'bg-gradient-to-b from-black/80 to-transparent py-5'
                }`}
        >
            <div className="max-w-[1600px] mx-auto px-4 md:px-12 flex items-center justify-between">
                {/* Logo - CineVault */}
                <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
                    <span className="text-xl md:text-3xl font-black tracking-tighter text-white uppercase italic">
                        Cine<span className="text-[#e87c00]">Vault</span>
                    </span>
                </Link>

                {/* Center Nav */}
                <nav className="hidden lg:flex items-center gap-8">
                    <Link href="/" className="text-white font-semibold text-sm hover:text-[#e87c00] transition-colors relative group">
                        Home
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e87c00] transition-all group-hover:w-full"></span>
                    </Link>
                    <Link href="/" className="text-zinc-400 font-medium text-sm hover:text-white transition-colors">
                        TV Shows
                    </Link>
                    <Link href="/" className="text-zinc-400 font-medium text-sm hover:text-white transition-colors">
                        Movies
                    </Link>
                    <Link href="/" className="text-zinc-400 font-medium text-sm hover:text-white transition-colors">
                        New & Popular
                    </Link>
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-3 md:gap-6">
                    {/* Search bar - hidden on very small screens to save space, or just reduced */}
                    <div className={`hidden sm:flex items-center bg-black/40 border transition-all duration-300 rounded overflow-hidden ${searchOpen ? 'w-40 md:w-64 border-white/30 px-3 py-1' : 'w-10 border-transparent'
                        }`}>
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="text-white hover:text-[#e87c00] transition-colors p-1"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                        <input
                            type="text"
                            placeholder="Titles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`bg-transparent text-white text-sm placeholder-zinc-500 focus:outline-none ml-2 transition-opacity duration-300 ${searchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                                }`}
                        />
                    </div>

                    {/* Simple search icon for mobile */}
                    <button className="sm:hidden text-white hover:text-[#e87c00]">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>

                </div>
            </div>
        </header>
    )
}
