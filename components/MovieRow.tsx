import MovieCard from './MovieCard';
import { Movie } from '@/app/page';

interface MovieRowProps {
    title: string;
    movies: Movie[];
}

export default function MovieRow({ title, movies }: MovieRowProps) {
    return (
        <section className="px-6 md:px-12">
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-8 pl-1 border-l-4 border-accent-orange">
                {title}
            </h2>
            <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar pb-8 px-1">
                {movies.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>
        </section>
    );
}
