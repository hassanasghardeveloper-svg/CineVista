import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Scale, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Terms of Service - CineVault',
    description: 'Read the Terms of Service for CineVault. By accessing our search catalog, you agree to our policies regarding third-party links.',
    alternates: {
        canonical: '/terms',
    },
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col justify-between">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1000px] mx-auto flex-1">
                {/* Title Section */}
                <div className="mb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2.5 bg-accent-orange/10 border border-accent-orange/20 px-4 py-2 rounded-full mb-4">
                        <Scale className="w-4 h-4 text-accent-orange" />
                        <span className="text-accent-orange text-xs font-black uppercase tracking-widest">
                            Terms & Conditions
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                        Terms of Service
                    </h1>
                    <p className="text-white/40 text-lg">
                        Last Updated: August 15, 2026
                    </p>
                </div>

                {/* Content Cards */}
                <div className="space-y-8">
                    {/* Key Term Card */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                1. Acceptance of Terms
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                By accessing, browsing, or using CineVault (collectively referred to as the "Service"), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the website.
                            </p>
                        </section>

                        <hr className="border-white/5" />

                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                2. Sourcing & Playback Disclaimers
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                CineVault serves exclusively as an aggregation database and directory. We catalog title metadata utilizing the TMDB API and embed client-side player options. 
                            </p>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                All videos are streamed directly from third-party servers. We do not control, modify, review, or store any video files on our infrastructure. Under no circumstances shall CineVault be held responsible for copyright compliance, safety, legality, or any other aspects of embedded content.
                            </p>
                        </section>

                        <hr className="border-white/5" />

                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                3. Acceptable Use & Ads
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                External player embeds may trigger pop-under advertisements, redirection, or cookies. Users assume full responsibility for any interactions with these ads. We recommend utilizing security extensions to block redirects.
                            </p>
                        </section>

                        <hr className="border-white/5" />

                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                4. Limitations of Liability
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                CineVault, its operators, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of, or inability to use, our service, or from content delivered via third-party providers.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
