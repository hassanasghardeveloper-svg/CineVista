import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShieldAlert, Mail, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
    title: 'DMCA Copyright Policy - CineVault',
    description: 'Read the DMCA and Copyright Compliance Policy for CineVault. We do not host any files on our servers.',
    alternates: {
        canonical: '/dmca',
    },
};

export default function DmcaPage() {
    return (
        <main className="min-h-screen bg-black text-white flex flex-col justify-between">
            <Header />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1000px] mx-auto flex-1">
                {/* Title Section */}
                <div className="mb-12 text-center md:text-left">
                    <div className="inline-flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full mb-4">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span className="text-red-500 text-xs font-black uppercase tracking-widest">
                            Legal & Copyright
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                        DMCA Policy
                    </h1>
                    <p className="text-white/40 text-lg">
                        Last Updated: August 15, 2026
                    </p>
                </div>

                {/* Content Cards */}
                <div className="space-y-8">
                    {/* Disclaimer Warning Card */}
                    <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-6 md:p-8 flex gap-4 md:gap-6 items-start">
                        <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-wider mb-2 text-red-500">
                                Sourcing Disclaimer
                            </h3>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base font-semibold">
                                CineVault is an indexer and database of movie metadata. We do not upload, host, store, or transmit any video files, media content, or torrent archives on our servers. All streaming playback is loaded directly via third-party external iframe embed codes provided by independent hosting services.
                            </p>
                        </div>
                    </div>

                    {/* Standard sections */}
                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                1. Copyright Infringement & Takedowns
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                We respect the intellectual property rights of others. Since CineVault only links to and embeds external video servers, we do not have direct control over the hosted video files. However, if any content indexed on our site infringes upon your copyright, you can request that we remove the reference link/embed from our catalog.
                            </p>
                        </section>

                        <hr className="border-white/5" />

                        <section className="space-y-3">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                2. Submission Guidelines
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                To file a copyright infringement notice, please send a written communication that includes the following details:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-white/55 text-sm pl-2">
                                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                                <li>The exact URL on CineVault containing the link or embed player you want removed.</li>
                                <li>Your contact information (name, address, telephone number, and email address).</li>
                                <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner.</li>
                                <li>A statement, under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the owner.</li>
                            </ul>
                        </section>

                        <hr className="border-white/5" />

                        <section className="space-y-4">
                            <h2 className="text-xl font-black uppercase tracking-wider text-white">
                                3. Abuse Contact
                            </h2>
                            <p className="text-white/60 leading-relaxed text-sm md:text-base">
                                Please send valid DMCA infringement notices directly to our abuse team. We will process and remove the matching links within 24 to 48 hours.
                            </p>
                            
                            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-3 rounded-xl">
                                <Mail className="w-5 h-5 text-accent-orange" />
                                <span className="font-bold text-sm tracking-wide select-all text-white/80">
                                    dmca@cinevistas.app
                                </span>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
