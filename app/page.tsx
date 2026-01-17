'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import HeroSection from '@/components/HeroSection'
import MovieRow from '@/components/MovieRow'
import AddMovieModal from '@/components/AddMovieModal'
import Footer from '@/components/Footer'

export interface Movie {
    id: string
    tmdbId: number
    title: string
    overview: string
    posterPath: string
    backdropPath: string
    releaseDate: string
    rating: number
    embedCode: string
}

// Demo movies for initial display
const DEMO_MOVIES: Movie[] = [
    {
        id: '1',
        tmdbId: 27205,
        title: 'Inception',
        overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO\'s mind.',
        posterPath: '/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg',
        backdropPath: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        releaseDate: '2010-07-16',
        rating: 8.4,
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/YoHD9XEInc0" frameborder="0" allowfullscreen></iframe>'
    },
    {
        id: '2',
        tmdbId: 157336,
        title: 'Interstellar',
        overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
        posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
        backdropPath: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
        releaseDate: '2014-11-05',
        rating: 8.6,
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/zSWdZVtXT7E" frameborder="0" allowfullscreen></iframe>'
    },
    {
        id: '3',
        tmdbId: 155,
        title: 'The Dark Knight',
        overview: 'When the menace known as The Joker emerges, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
        posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        backdropPath: '/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg',
        releaseDate: '2008-07-16',
        rating: 9.0,
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/EXeTwQWrcwY" frameborder="0" allowfullscreen></iframe>'
    },
    {
        id: '4',
        tmdbId: 603,
        title: 'The Matrix',
        overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.',
        posterPath: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
        backdropPath: '/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
        releaseDate: '1999-03-30',
        rating: 8.7,
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/vKQi3bBA1y8" frameborder="0" allowfullscreen></iframe>'
    },
    {
        id: '5',
        tmdbId: 238,
        title: 'The Godfather',
        overview: 'The aging patriarch of an organized crime dynasty transfers control to his reluctant son.',
        posterPath: '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
        backdropPath: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
        releaseDate: '1972-03-14',
        rating: 9.2,
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/sY1S34973zA" frameborder="0" allowfullscreen></iframe>'
    },
    {
        id: '6',
        tmdbId: 550,
        title: 'Fight Club',
        overview: 'An insomniac office worker forms an underground fight club that evolves into much more.',
        posterPath: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
        backdropPath: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
        releaseDate: '1999-10-15',
        rating: 8.8,
        embedCode: '<iframe width="560" height="315" src="https://www.youtube.com/embed/qtRKdVHc-cE" frameborder="0" allowfullscreen></iframe>'
    }
]

export default function Home() {
    const [movies, setMovies] = useState<Movie[]>([])
    const [showAddModal, setShowAddModal] = useState(false)
    const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null)

    useEffect(() => {
        // Load movies from localStorage or use demo
        const saved = localStorage.getItem('cinevault_movies')
        if (saved) {
            const parsed = JSON.parse(saved)
            setMovies(parsed.length > 0 ? parsed : DEMO_MOVIES)
        } else {
            setMovies(DEMO_MOVIES)
            localStorage.setItem('cinevault_movies', JSON.stringify(DEMO_MOVIES))
        }
    }, [])

    useEffect(() => {
        if (movies.length > 0) {
            setFeaturedMovie(movies[Math.floor(Math.random() * movies.length)])
        }
    }, [movies])

    const addMovie = (movie: Movie) => {
        const updated = [...movies, movie]
        setMovies(updated)
        localStorage.setItem('cinevault_movies', JSON.stringify(updated))
        setShowAddModal(false)
    }

    return (
        <main className="min-h-screen bg-dark-900">
            <Header onAddClick={() => setShowAddModal(true)} />

            {movies.length > 0 && <HeroSection movies={movies.slice(0, 5)} />}

            <div className="relative z-10 pt-20 pb-32 space-y-20">
                <MovieRow title="Trending Now" movies={movies} />
                <MovieRow title="Top Rated" movies={[...movies].sort((a, b) => b.rating - a.rating)} />
                <MovieRow title="New Releases" movies={[...movies].reverse()} />
            </div>

            <Footer />

            {showAddModal && (
                <AddMovieModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={addMovie}
                />
            )}
        </main>
    )
}
