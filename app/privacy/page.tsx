import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Eye, Shield, Lock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy - CineVault',
    description: 'Understand how user privacy and data are managed on CineVault. We protect your privacy by storing data entirely on your local device.',
    alternates: {
        canonical: '/privacy',
    },
};

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col justify-between">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1000px] mx-auto flex-1">
                {/* Title Section */}
                <div className="mb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2.5 bg-accent-orange/10 border border-accent-orange/20 px-4 py-2 rounded-full mb-4">
                        <Eye className="w-4 h-4 text-accent-orange" />
                        <span className="text-accent-orange text-xs font-black uppercase tracking-widest">
                            User Privacy
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                        Privacy Policy
                    </h1>
                    <p className="text-white/40 text-lg">
                        Last Updated: August 15, 2026
                    </p>
                </div>

                {/* Content Cards */}
                <div className="space-y-8">
                    {/* Privacy Guarantee Banner */}
                    <div className="bg-gradient-to-r from-accent-orange/10 to-amber-500/10 border border-accent-orange/20 rounded-2xl p-6 md:p-8 flex gap-4 md:gap-6 items-start">
                        <Shield className="w-6 h-6 text-accent-orange flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-wider mb-2 text-accent-orange">
                                No-Account Privacy Model
                            </h3>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base font-semibold">
                                CineVault operates on a zero-registration, zero-database architecture. We do not require emails, usernames, or passwords. Your watchlists, history, and playback preferences never leave your browser.
                            </p>
                        </div>
                    </div>

                    {/* Policy Details */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                1. Local Storage Usage
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                To provide customization features, we store configuration data directly in your browser's local cache (LocalStorage). This includes:
                            </p>
                            <ul className="list-disc list-inside space-y-1.5 text-white/55 text-sm pl-2">
                                <li>**Watchlist**: Movies and TV shows you choose to bookmark.</li>
                                <li>**Recents & Progress**: Playback progress percentages to let you resume watching.</li>
                                <li>**Playback Preference**: Your selected server/player defaults.</li>
                            </ul>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base pt-2">
                                You can clear this data completely at any time by clearing your browser cookies and site cache.
                            </p>
                        </section>

                        <hr className="border-white/5" />

                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                2. Third-Party Embeds & Cookies
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                Because CineVault displays video content using third-party player embeds (iframes), these external services (e.g. VidSrc, Peachify) may set cookies, track your IP address, or load scripts to serve pop-ups and advertisements.
                            </p>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                We do not control these third-party trackers. For enhanced privacy, we strongly recommend using privacy-focused browsers or standard ad-blocking extensions.
                            </p>
                        </section>

                        <hr className="border-white/5" />

                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                3. Server Logging
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                Our hosting provider (Vercel) automatically logs standard, non-personally identifiable request traffic (such as user-agent, referrers, and response times) to maintain platform health, prevent DDoS attacks, and optimize loading speed.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
