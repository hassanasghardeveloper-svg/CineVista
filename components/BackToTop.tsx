'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

/** Floating button that appears after scrolling down and returns to the top. */
export default function BackToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 600);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className={`fixed right-4 md:right-8 bottom-24 md:bottom-8 z-[70] p-3 rounded-full bg-accent-orange text-white shadow-xl shadow-black/50 border border-white/10 hover:bg-orange-600 active:scale-90 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        >
            <ArrowUp className="w-5 h-5" />
        </button>
    );
}
