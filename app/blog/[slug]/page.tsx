import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { getAllPosts, getPostBySlug, getRelatedPosts, markdownToHtml } from '@/lib/blog';
import { Calendar, Clock, Tag, ArrowLeft, Share2, ChevronRight } from 'lucide-react';
import { notFound } from 'next/navigation';

interface Props {
    params: { slug: string };
}

export async function generateStaticParams() {
    const posts = getAllPosts();
    return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = getPostBySlug(params.slug);

    if (!post) {
        return {
            title: 'Post Not Found - CineVista Blog',
        };
    }

    return {
        title: `${post.title} | CineVista Blog`,
        description: post.description,
        alternates: {
            canonical: `/blog/${post.slug}`,
        },
        openGraph: {
            title: `${post.title} | CineVista Blog`,
            description: post.description,
            url: `https://cinevista.online/blog/${post.slug}`,
            siteName: 'CineVista',
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
            images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : [],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.description,
            images: post.image ? [post.image] : [],
        },
    };
}

export default function BlogPostPage({ params }: Props) {
    const post = getPostBySlug(params.slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = getRelatedPosts(params.slug, 3);
    const htmlContent = markdownToHtml(post.content);

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': post.title,
        'description': post.description,
        'image': post.image,
        'datePublished': post.date,
        'dateModified': post.date,
        'author': {
            '@type': 'Person',
            'name': post.author,
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'CineVista',
            'url': 'https://cinevista.online',
            'logo': {
                '@type': 'ImageObject',
                'url': 'https://cinevista.online/icon.svg',
            },
        },
        'mainEntityOfPage': {
            '@type': 'WebPage',
            '@id': `https://cinevista.online/blog/${post.slug}`,
        },
        'keywords': post.tags.join(', '),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'https://cinevista.online',
            },
            {
                '@type': 'ListItem',
                'position': 2,
                'name': 'Blog',
                'item': 'https://cinevista.online/blog',
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': post.title,
                'item': `https://cinevista.online/blog/${post.slug}`,
            },
        ],
    };

    return (
        <main className="min-h-screen bg-black text-white">
            <Header />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            {/* Hero Image */}
            {post.image && (
                <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>
            )}

            <div className="relative z-10 max-w-[800px] mx-auto px-6 md:px-12 -mt-32 pb-20">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-xs text-white/40 mb-6 font-bold uppercase tracking-wider">
                    <Link href="/" className="hover:text-accent-orange transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <Link href="/blog" className="hover:text-accent-orange transition-colors">Blog</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
                </nav>

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight mb-6">
                    {post.title}
                </h1>

                {/* Meta Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                        <div className="w-8 h-8 rounded-full bg-accent-orange/20 flex items-center justify-center">
                            <span className="text-accent-orange text-xs font-black">{post.author.charAt(0)}</span>
                        </div>
                        <span className="font-bold">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/30 text-sm">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-white/30 text-sm">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{post.readingTime} min read</span>
                    </div>
                </div>

                {/* Tags */}
                {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {post.tags.map(tag => (
                            <span
                                key={tag}
                                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent-orange/70 bg-accent-orange/10 px-3 py-1.5 rounded-lg"
                            >
                                <Tag className="w-2.5 h-2.5" />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Article Content */}
                <article
                    className="prose prose-invert prose-orange max-w-none
                        [&_h2]:text-2xl [&_h2]:font-black [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-white
                        [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:text-white/90
                        [&_p]:text-white/60 [&_p]:leading-relaxed [&_p]:mb-4 [&_p]:text-[15px]
                        [&_strong]:text-white/90 [&_strong]:font-bold
                        [&_em]:text-white/70
                        [&_a]:text-accent-orange [&_a]:hover:underline
                        [&_ul]:text-white/60 [&_ul]:text-[15px]
                        [&_ol]:text-white/60 [&_ol]:text-[15px]
                        [&_li]:mb-1
                        [&_blockquote]:text-white/50 [&_blockquote]:border-accent-orange/30
                        [&_code]:text-accent-orange [&_code]:bg-white/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm
                        [&_pre]:bg-white/[0.03] [&_pre]:border [&_pre]:border-white/5 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto
                        [&_img]:rounded-xl [&_img]:my-6
                        [&_hr]:border-white/10 [&_hr]:my-8"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Share Section */}
                <div className="mt-12 pt-8 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <Share2 className="w-4 h-4 text-white/40" />
                        <span className="text-xs font-black uppercase tracking-widest text-white/40">Share this article</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <a
                            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://cinevista.online/blog/${post.slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
                        >
                            Twitter / X
                        </a>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://cinevista.online/blog/${post.slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
                        >
                            Facebook
                        </a>
                        <a
                            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.title + ' ' + `https://cinevista.online/blog/${post.slug}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 text-xs font-bold uppercase tracking-wider hover:bg-white/10 hover:text-white transition-all"
                        >
                            WhatsApp
                        </a>
                    </div>
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5 text-accent-orange" />
                            More Articles
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {relatedPosts.map(related => (
                                <Link
                                    key={related.slug}
                                    href={`/blog/${related.slug}`}
                                    className="group bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden hover:border-accent-orange/30 transition-all"
                                >
                                    <div className="aspect-video overflow-hidden">
                                        <img
                                            src={related.image}
                                            alt={related.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-sm font-bold text-white group-hover:text-accent-orange transition-colors line-clamp-2 leading-tight">
                                            {related.title}
                                        </h3>
                                        <p className="text-white/30 text-xs mt-2">
                                            {new Date(related.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to Blog */}
                <div className="mt-12 text-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest hover:bg-accent-orange hover:text-white hover:border-accent-orange transition-all"
                    >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        All Articles
                    </Link>
                </div>
            </div>

            <Footer />
        </main>
    );
}
