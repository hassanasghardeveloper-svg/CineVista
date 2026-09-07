import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import WatchClient from '@/components/WatchClient';
import { fetchTitleDetails } from '@/lib/tmdb';
import { extractIdFromSlug, slugify, createWatchUrl } from '@/lib/slugify';

interface Props {
    params: { id: string };
    searchParams: Record<string, string | undefined>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const numericId = extractIdFromSlug(params.id);
    const titleDetails = await fetchTitleDetails(numericId, 'movie');

    if (!titleDetails) {
        return {
            title: 'Movie Not Found - CineVista',
            description: 'The requested movie could not be found on CineVista.',
            robots: { index: false, follow: false },
        };
    }

    const titleText = titleDetails.title;
    const yearText = titleDetails.year ? `(${titleDetails.year})` : '';

    const pageTitle = `Watch ${titleText} ${yearText} Free Online (Hindi Dubbed / Sub) - CineVista`;
    const pageDesc = titleDetails.plot_overview
        ? `Watch ${titleText} ${yearText} Movie online for free in HD. Available with Hindi dubbed audio, Urdu & English subtitles. ${titleDetails.plot_overview.slice(0, 115)}...`
        : `Watch ${titleText} ${yearText} Movie online for free in HD with Hindi dubbed audio and multi-language subtitles on CineVista.`;

    const images = [];
    if (titleDetails.backdrop) {
        images.push({ url: titleDetails.backdrop, width: 1280, height: 720, alt: titleText });
    } else if (titleDetails.poster) {
        images.push({ url: titleDetails.poster, width: 500, height: 750, alt: titleText });
    }

    const slug = slugify(titleText, titleDetails.year);
    const canonicalPath = `/watch/movie/${titleDetails.id}${slug ? `-${slug}` : ''}`;
    const absoluteUrl = `https://cinevista.online${canonicalPath}`;

    return {
        title: pageTitle,
        description: pageDesc,
        alternates: {
            canonical: absoluteUrl,
        },
        openGraph: {
            title: pageTitle,
            description: pageDesc,
            url: absoluteUrl,
            siteName: 'CineVista',
            type: 'video.movie',
            images,
            actors: titleDetails.cast?.slice(0, 5).map((c: any) => c.name) as any,
            directors: titleDetails.directors as any,
            duration: titleDetails.runtime_minutes ? titleDetails.runtime_minutes * 60 : undefined,
            releaseDate: titleDetails.release_date || undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title: pageTitle,
            description: pageDesc,
            images: images.map(img => img.url),
        }
    };
}

export default async function MovieWatchPage({ params }: Props) {
    const numericId = extractIdFromSlug(params.id);
    const titleDetails = await fetchTitleDetails(numericId, 'movie');

    if (!titleDetails) {
        notFound();
    }

    // Redirect to canonical slug URL if the current slug doesn't match
    const expectedSlug = slugify(titleDetails.title, titleDetails.year);
    const expectedParam = `${titleDetails.id}${expectedSlug ? `-${expectedSlug}` : ''}`;
    if (params.id !== expectedParam) {
        redirect(`/watch/movie/${expectedParam}`);
    }

    // Process trailers on the server
    const trailers = (titleDetails.videos || [])
        .filter((v: any) => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
        .map((v: any) => ({
            key: v.key,
            name: v.name,
            type: v.type,
            url: `https://www.youtube.com/embed/${v.key}`,
        })) || [];

    // Structured data
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Movie',
        'name': titleDetails.title,
        'description': titleDetails.plot_overview,
        'image': titleDetails.poster || titleDetails.backdrop,
        'dateCreated': titleDetails.release_date,
        'genre': titleDetails.genre_names,
        'duration': titleDetails.runtime_minutes ? `PT${titleDetails.runtime_minutes}M` : undefined,
        'director': titleDetails.directors?.map((name: string) => ({
            '@type': 'Person',
            'name': name
        })),
        'actor': titleDetails.cast?.slice(0, 8).map((c: any) => ({
            '@type': 'Person',
            'name': c.name
        })),
        'aggregateRating': titleDetails.vote_count > 0 ? {
            '@type': 'AggregateRating',
            'ratingValue': titleDetails.user_rating,
            'bestRating': '10',
            'ratingCount': titleDetails.vote_count
        } : undefined,
        'potentialAction': {
            '@type': 'WatchAction',
            'target': {
                '@type': 'EntryPoint',
                'urlTemplate': `https://cinevista.online/watch/movie/${expectedParam}`
            },
            'actionAccessibilityRequirement': {
                '@type': 'ActionAccessSpecification',
                'category': 'free',
                'availabilityStarts': titleDetails.release_date
            }
        }
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
                'name': 'Movies',
                'item': 'https://cinevista.online/movies',
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': titleDetails.title,
                'item': `https://cinevista.online/watch/movie/${expectedParam}`,
            },
        ],
    };

    // VideoObject schema — enables Google Video search results
    const videoSchema = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        'name': `Watch ${titleDetails.title} (${titleDetails.year || ''}) Free Online`,
        'description': titleDetails.plot_overview || `Stream ${titleDetails.title} online for free in HD on CineVista.`,
        'thumbnailUrl': titleDetails.backdrop || titleDetails.poster,
        'uploadDate': titleDetails.release_date || undefined,
        'duration': titleDetails.runtime_minutes ? `PT${titleDetails.runtime_minutes}M` : undefined,
        'contentUrl': `https://cinevista.online/watch/movie/${expectedParam}`,
        'embedUrl': `https://cinevista.online/watch/movie/${expectedParam}`,
        'potentialAction': {
            '@type': 'WatchAction',
            'target': `https://cinevista.online/watch/movie/${expectedParam}`
        }
    };

    // FAQPage schema — triggers FAQ rich snippets in Google + AEO citations
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': `Where can I watch ${titleDetails.title} online for free?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `You can watch ${titleDetails.title} for free on CineVista (cinevista.online). We offer HD streaming with Hindi dubbed audio, Urdu subtitles, and English subtitles. No registration or credit card is required.`
                }
            },
            {
                '@type': 'Question',
                'name': `Is ${titleDetails.title} available in Hindi dubbed?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `Yes, ${titleDetails.title} is available with Hindi dubbed audio on CineVista. You can switch between original audio and Hindi dubbed versions using the server options. Urdu and English subtitles are also available.`
                }
            },
            {
                '@type': 'Question',
                'name': `Do I need to sign up to watch ${titleDetails.title}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `No, CineVista does not require any registration, account creation, or credit card. You can start streaming ${titleDetails.title} instantly by selecting a server and pressing play.`
                }
            },
            {
                '@type': 'Question',
                'name': `What quality is ${titleDetails.title} available in?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `${titleDetails.title} is available in HD (720p) and Full HD (1080p) quality on CineVista. The streaming quality depends on the server you choose and your internet connection speed.`
                }
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <WatchClient
                key={titleDetails.id}
                initialTitle={titleDetails as any}
                initialTrailers={trailers}
                initialSeason={1}
                initialEpisode={1}
            />
        </>
    );
}
