import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { Calendar, Clock, Tag, BookOpen } from 'lucide-react';

export default function BlogPage() {
    const posts = getAllPosts();

    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': 'CineVista Blog',
        'description': 'Movie reviews, top-10 lists, streaming guides, and entertainment news.',
        'url': 'https://cinevista.online/blog',
        'isPartOf': {
            '@type': 'WebSite',
            'name': 'CineVista',
            'url': 'https://cinevista.online',
        },
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <Header />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />

            <div className="pt-32 pb-20 px-6 md:px-12 max-w-[1200px] mx-auto">
                {/* Hero Section */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2.5 bg-accent-orange/10 border border-accent-orange/20 px-4 py-2 rounded-full mb-4">
                        <BookOpen className="w-4 h-4 text-accent-orange" />
                        <span className="text-accent-orange text-xs font-black uppercase tracking-widest">
                            CineVista Blog
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">
                        Movie Reviews &amp; Guides
                    </h1>
                    <p className="text-white/40 text-lg max-w-2xl mx-auto">
                        Discover the best movies, TV shows, and dramas with our curated reviews, top lists, and streaming guides.
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-white/30 text-xl mb-4">No blog posts yet.</p>
                        <p className="text-white/20 text-sm">Check back soon for movie reviews, top lists, and streaming guides!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {posts.map((post, index) => (
                            <Link
                                key={post.slug}
                                href={`/blog/${post.slug}`}
                                className="group relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-accent-orange/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(232,124,0,0.08)]"
                            >
                                {/* Image */}
                                <div className="relative aspect-video overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                    {index === 0 && (
                                        <div className="absolute top-3 left-3 bg-accent-orange text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                            Latest
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 space-y-3">
                                    <h2 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-accent-orange transition-colors leading-tight line-clamp-2">
                                        {post.title}
                                    </h2>
                                    <p className="text-white/40 text-sm leading-relaxed line-clamp-3">
                                        {post.description}
                                    </p>

                                    {/* Meta */}
                                    <div className="flex items-center gap-4 pt-2">
                                        <div className="flex items-center gap-1.5 text-white/30 text-xs">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-white/30 text-xs">
                                            <Clock className="w-3 h-3" />
                                            <span>{post.readingTime} min read</span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {post.tags.slice(0, 3).map(tag => (
                                                <span
                                                    key={tag}
                                                    className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent-orange/70 bg-accent-orange/10 px-2 py-1 rounded-md"
                                                >
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </main>
    );
}
