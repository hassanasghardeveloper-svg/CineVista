import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/5 pt-12 pb-28 md:py-12 px-6 md:px-12">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Link href="/" className="text-2xl font-black tracking-tighter text-white uppercase">
                            Cine<span className="text-accent-orange">Vault</span>
                        </Link>
                        <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-white/40">
                            <Link href="/dmca" className="hover:text-accent-orange transition-colors">
                                DMCA
                            </Link>
                            <span className="text-white/10 hidden md:inline">•</span>
                            <Link href="/privacy" className="hover:text-accent-orange transition-colors">
                                Privacy Policy
                            </Link>
                            <span className="text-white/10 hidden md:inline">•</span>
                            <Link href="/terms" className="hover:text-accent-orange transition-colors">
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
                        © 2026 CineVault. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
