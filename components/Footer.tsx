export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/5 py-12 px-6 md:px-12">
            <div className="max-w-[1600px] mx-auto">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-2xl font-black tracking-tighter text-white uppercase">
                        Cine<span className="text-accent-orange">Vault</span>
                    </div>
                    <p className="text-white/30 text-xs font-bold uppercase tracking-widest">
                        © 2024 CineVault. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
