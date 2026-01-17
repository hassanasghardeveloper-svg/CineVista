'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import AddMovieModal from '../components/AddMovieModal';
import Footer from '../components/Footer';

export interface Movie {
    id: string;
    title: string;
    overview: string;
    posterPath: string;
    backdropPath: string;
    releaseDate: string;
    rating: number;
    embedCode: string;
}

const DEMO_MOVIES: Movie[] = [
    {
        id: '1',
        title: 'Inception',
        overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into a CEO\'s mind.',
        posterPath: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Ber.jpg',
        backdropPath: 'https://image.tmdb.org/t/p/original/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
        releaseDate: '2010-07-16',
        rating: 8.4,
        embedCode: '<iframe src="https://www.youtube.com/embed/YoHD9XEInc0" width="100%" height="100%" frameborder="0" allowfullscreen></iframe>'
    }
];

export default function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('cinevault_movies_v2');
        if (saved) {
            setMovies(JSON.parse(saved));
        } else {
            setMovies(DEMO_MOVIES);
            localStorage.setItem('cinevault_movies_v2', JSON.stringify(DEMO_MOVIES));
        }
    }, []);

    const addMovie = (movie: Movie) => {
        const updated = [...movies, movie];
        setMovies(updated);
        localStorage.setItem('cinevault_movies_v2', JSON.stringify(updated));
        setShowAddModal(false);
    };

    return (
        <main className="min-h-screen bg-dark-950">
            <Header onAddClick={() => setShowAddModal(true)} />

            {movies.length > 0 && (
                <>
                    <HeroSection movies={movies.slice(0, 5)} />
                    <div className="relative z-10 -mt-24 pb-20 space-y-16">
                        <MovieRow title="Your Library" movies={movies} />
                        <MovieRow title="Favorites" movies={[...movies].sort((a, b) => b.rating - a.rating)} />
                    </div>
                </>
            )}

            <Footer />

            {showAddModal && (
                <AddMovieModal
                    onClose={() => setShowAddModal(false)}
                    onAdd={addMovie}
                />
            )}
        </main>
    );
}
