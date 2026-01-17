'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { Movie } from '@/app/page'

interface AddMovieModalProps {
    onClose: () => void
    onAdd: (movie: Movie) => void
}

export default function AddMovieModal({ onClose, onAdd }: AddMovieModalProps) {
    const [tmdbId, setTmdbId] = useState('')
    const [embedCode, setEmbedCode] = useState('')
    const [preview, setPreview] = useState<Partial<Movie> | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const fetchMovieInfo = async () => {
        if (!tmdbId) return
        setLoading(true)
        setError('')

        const apiKey = process.env.NEXT_PUBLIC_WATCHMODE_API_KEY

        if (!apiKey) {
            setError('API Key missing. Please check .env.local')
            setLoading(false)
            return
        }

        try {
            // Using Watchmode API to fetch by TMDB ID
            const res = await fetch(`https://api.watchmode.com/v1/title/tmdb-${tmdbId}/details/?apiKey=${apiKey}`)
            if (!res.ok) throw new Error('Movie not found')
            const data = await res.json()

            // Map Watchmode data to our Movie interface
            setPreview({
                tmdbId: parseInt(tmdbId),
                title: data.title,
                overview: data.plot_overview,
                posterPath: data.poster,
                backdropPath: data.backdrop,
                releaseDate: data.release_date,
                rating: data.user_rating || 0
            })
        } catch (err) {
            setError('Could not find movie. Check the TMDB ID or API Key.')
            setPreview(null)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = () => {
        if (!preview || !embedCode) {
            setError('Please provide both movie info and embed code')
            return
        }

        const movie: Movie = {
            id: Date.now().toString(),
            tmdbId: preview.tmdbId!,
            title: preview.title!,
            overview: preview.overview!,
            posterPath: preview.posterPath!,
            backdropPath: preview.backdropPath!,
            releaseDate: preview.releaseDate!,
            rating: preview.rating!,
            embedCode: embedCode
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
            <div className="relative bg-dark-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-dark-800 border-b border-dark-600 px-4 md:px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-lg md:text-xl font-bold text-white uppercase tracking-tight">Add New Movie</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full hover:bg-dark-600 flex items-center justify-center transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* TMDB ID Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            TMDB Movie ID
                        </label>
                        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                            <input
                                type="text"
                                value={tmdbId}
                                onChange={(e) => setTmdbId(e.target.value)}
                                placeholder="e.g., 27205"
                                className="flex-1 bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#e87c00] text-sm"
                            />
                            <button
                                onClick={fetchMovieInfo}
                                disabled={loading}
                                className="bg-[#e87c00] hover:bg-[#ff9500] text-white font-bold px-6 py-3 rounded-lg text-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
                            >
                                {loading ? 'Fetching...' : 'Fetch Info'}
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                            Find movie IDs at <a href="https://www.themoviedb.org" target="_blank" rel="noopener" className="text-accent-red hover:underline">themoviedb.org</a>
                        </p>
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
                            {preview.posterPath && (
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${preview.posterPath}`}
                                    alt={preview.title}
                                    className="w-24 sm:w-20 rounded-lg mx-auto sm:mx-0 shadow-xl"
                                />
                            )}
                            <div className="text-center sm:text-left">
                                <h3 className="text-lg font-bold text-white">{preview.title}</h3>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-zinc-400 mt-1">
                                    <span>{preview.releaseDate?.split('-')[0]}</span>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-[#e87c00] fill-current" />
                                        <span>{preview.rating?.toFixed(1)}</span>
                                    </div>
                                </div>
                                <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{preview.overview}</p>
                            </div>
                        </div>
                    )}

                    {/* Embed Code Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Video Embed Code
                        </label>
                        <textarea
                            value={embedCode}
                            onChange={(e) => setEmbedCode(e.target.value)}
                            placeholder='<iframe src="..." ...></iframe>'
                            rows={4}
                            className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-accent-red font-mono text-sm"
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            Paste the embed code (iframe) from your video source
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-red-500 text-sm">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-600">
                        <button onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} className="btn-primary">
                            Add Movie
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
