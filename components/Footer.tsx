'use client'

import Link from 'next/link'
import { Github, Twitter, Instagram, ArrowUp, Send } from 'lucide-react'

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <footer className="relative bg-[#050505] border-t border-white/5 pt-16 md:pt-24 pb-8 md:pb-12 overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute -bottom-8 md:-bottom-12 left-1/2 -translate-x-1/2 text-[25vw] md:text-[15vw] font-black text-white/[0.02] select-none pointer-events-none tracking-tighter uppercase whitespace-nowrap">
                CineVault
            </div>

            <div className="max-w-[1600px] mx-auto px-8 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-20">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-2 group">
                            <span className="text-3xl font-bold bg-gradient-to-r from-white to-[#e87c00] bg-clip-text text-transparent">CineVault</span>
                        </Link>
                        <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
                            The ultimate cinematic destination for high-end storytelling. Experience movies like never before with 4K HDR streaming.
                        </p>
                        <div className="flex items-center gap-4">
                            {[
                                { Icon: Twitter, href: '#' },
                                { Icon: Github, href: '#' },
                                { Icon: Instagram, href: '#' }
                            ].map((social, i) => (
                                <Link
                                    key={i}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-[#e87c00] hover:border-[#e87c00] hover:scale-110 active:scale-90 transition-all duration-300"
                                >
                                    <social.Icon size={18} />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Quick links */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 col-span-1 md:col-span-2 lg:col-span-2 gap-8">
                        <div>
                            <h4 className="text-white font-bold text-xs md:text-sm mb-4 md:mb-6 uppercase tracking-widest">Explore</h4>
                            <ul className="space-y-3 md:space-y-4">
                                {['Originals', 'Movies', 'TV Shows', 'Coming Soon'].map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="text-zinc-500 text-sm hover:text-[#e87c00] transition-colors">{link}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-xs md:text-sm mb-4 md:mb-6 uppercase tracking-widest">Company</h4>
                            <ul className="space-y-3 md:space-y-4">
                                {['About Us', 'Careers', 'Press', 'Brand'].map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="text-zinc-500 text-sm hover:text-[#e87c00] transition-colors">{link}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="hidden sm:block">
                            <h4 className="text-white font-bold text-xs md:text-sm mb-4 md:mb-6 uppercase tracking-widest">Support</h4>
                            <ul className="space-y-3 md:space-y-4">
                                {['Help Center', 'Devices', 'Contact', 'Privacy'].map((link) => (
                                    <li key={link}>
                                        <Link href="#" className="text-zinc-500 text-sm hover:text-[#e87c00] transition-colors">{link}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Newsletter Section */}
                    <div className="space-y-6">
                        <h4 className="text-white font-bold text-sm uppercase tracking-widest">Newsletter</h4>
                        <p className="text-zinc-500 text-sm">Join our premier list for early access.</p>
                        <div className="relative group focus-pulse rounded-full">
                            <input
                                type="email"
                                placeholder="Email address"
                                className="w-full bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm text-white focus:outline-none focus:border-[#e87c00]/50 transition-all duration-300 pr-12"
                            />
                            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#e87c00] text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-[#e87c00]/20">
                                <Send size={14} />
                            </button>
                            {/* Animated Focus Glow */}
                            <div className="absolute -inset-1 rounded-full bg-[#e87c00]/20 opacity-0 blur group-within:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-zinc-600 text-[10px] font-medium tracking-widest uppercase">
                        © 2024 CineVault — Premium Cinema Experience
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#46d369] animate-pulse" />
                            <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">Systems Operational</span>
                        </div>
                        <button
                            onClick={scrollToTop}
                            className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-white/5 group"
                        >
                            <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}
