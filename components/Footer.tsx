export default function Footer() {
    return (
        <footer className="py-12 px-6 border-t border-white/5 bg-dark-950">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    © 2024 CineVault — Premium Cinema Experience
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Global Status Ready</span>
                </div>
            </div>
        </footer>
    );
}
