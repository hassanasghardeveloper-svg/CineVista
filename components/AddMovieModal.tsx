'use client';

import { useState, ChangeEvent } from 'react';
import { Movie } from '@/app/page';
import { X } from 'lucide-react';

interface AddMovieModalProps {
    onClose: () => void;
    onAdd: (movie: Movie) => void;
}

export default function AddMovieModal({ onClose, onAdd }: AddMovieModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        overview: '',
        posterPath: '',
        backdropPath: '',
        releaseDate: '',
        rating: '',
        embedCode: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.posterPath || !formData.embedCode) {
            setError('Title, Poster URL, and Embed Code are required.');
            return;
        }

        const movie: Movie = {
            id: Date.now().toString(),
            title: formData.title,
            overview: formData.overview,
            posterPath: formData.posterPath,
            backdropPath: formData.backdropPath || formData.posterPath,
            releaseDate: formData.releaseDate || '2024',
            rating: parseFloat(formData.rating) || 0,
            embedCode: formData.embedCode
        };

        onAdd(movie);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />

            <div className="relative bg-dark-800 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <div className="sticky top-0 bg-dark-800/80 backdrop-blur-md border-b border-white/5 p-6 flex justify-between items-center z-10">
                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Add To Collection</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-orange">Movie Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-accent-orange transition-all"
                                placeholder="e.g. Interstellar"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-orange">Poster URL (HTTPs)</label>
                            <input
                                name="posterPath"
                                value={formData.posterPath}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-accent-orange transition-all"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-orange">Rating (0-10)</label>
                            <input
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-accent-orange transition-all"
                                placeholder="8.5"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-orange">Release Year</label>
                            <input
                                name="releaseDate"
                                value={formData.releaseDate}
                                onChange={handleChange}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-accent-orange transition-all"
                                placeholder="2024"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-orange">Storyline / Overview</label>
                        <textarea
                            name="overview"
                            value={formData.overview}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-accent-orange transition-all min-h-[100px]"
                            placeholder="Tell the story..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-accent-orange">Embed Code (Full iFrame)</label>
                        <textarea
                            name="embedCode"
                            value={formData.embedCode}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-zinc-700 focus:outline-none focus:border-accent-orange font-mono text-xs"
                            placeholder='<iframe src="..." ...></iframe>'
                        />
                    </div>

                    {error && <p className="text-red-500 text-xs font-bold uppercase tracking-widest">{error}</p>}

                    <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button
                            type="submit"
                            className="bg-accent-orange text-white px-10 py-5 rounded-xl font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-orange/20"
                        >
                            Finalize Entry
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
