'use client'

import { useState } from 'react'
import { Movie } from '@/app/page'

interface AddMovieModalProps {
    onClose: () => void
    onAdd: (movie: Movie) => void
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
    })
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = () => {
        if (!formData.title || !formData.embedCode || !formData.posterPath) {
            setError('Please provide at least Title, Poster URL, and Embed Code')
            return
        }

        const movie: Movie = {
            id: Date.now().toString(),
            tmdbId: 0, // No longer using TMDB ID for fetching
            title: formData.title,
            overview: formData.overview,
            posterPath: formData.posterPath,
            backdropPath: formData.backdropPath || formData.posterPath,
            releaseDate: formData.releaseDate,
            rating: parseFloat(formData.rating) || 0,
            embedCode: formData.embedCode
        }

        onAdd(movie)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-dark-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-dark-800 border-b border-white/5 px-4 md:px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">Add New Movie</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#e87c00] mb-1.5">Movie Title</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Inception"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#e87c00] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#e87c00] mb-1.5">Release Date</label>
                            <input
                                name="releaseDate"
                                value={formData.releaseDate}
                                onChange={handleChange}
                                placeholder="e.g. 2010-07-16"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#e87c00] transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#e87c00] mb-1.5">Poster URL</label>
                            <input
                                name="posterPath"
                                value={formData.posterPath}
                                onChange={handleChange}
                                placeholder="HTTPS link to poster image"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#e87c00] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#e87c00] mb-1.5">Rating (0-10)</label>
                            <input
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                placeholder="e.g. 8.8"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#e87c00] transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#e87c00] mb-1.5">Overview</label>
                        <textarea
                            name="overview"
                            value={formData.overview}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Briefly describe the movie..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#e87c00] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#e87c00] mb-1.5">Video Embed Code</label>
                        <textarea
                            name="embedCode"
                            value={formData.embedCode}
                            onChange={handleChange}
                            rows={4}
                            placeholder='<iframe src="..." ...></iframe>'
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-[#e87c00] font-mono text-xs transition-colors"
                        />
                        <p className="mt-2 text-[10px] text-zinc-500 uppercase tracking-widest">
                            Paste the full iframe embed code from your provider.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-500 text-sm font-bold">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 rounded-xl text-zinc-400 font-bold uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="bg-[#e87c00] hover:bg-[#ff9500] text-white font-black px-8 py-3 rounded-xl uppercase tracking-tighter transition-all active:scale-95 shadow-lg shadow-[#e87c00]/20"
                        >
                            Add Movie
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
