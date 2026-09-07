import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import WatchClient from '@/components/WatchClient';
import { fetchTitleDetails } from '@/lib/tmdb';
import { extractIdFromSlug, slugify } from '@/lib/slugify';

interface Props {
    params: { id: string };
    searchParams: {
        s?: string;
        e?: string;
    };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const numericId = extractIdFromSlug(params.id);
    const s = searchParams.s;
    const e = searchParams.e;
    const titleDetails = await fetchTitleDetails(numericId, 'tv');

    if (!titleDetails) {
        return {
            title: 'TV Show Not Found - CineVista',
            description: 'The requested TV show could not be found on CineVista.',
            robots: { index: false, follow: false },
        };
    }

    const titleText = titleDetails.title;
    const yearText = titleDetails.year ? `(${titleDetails.year})` : '';

    let pageTitle = `Watch ${titleText} ${yearText} Free Online (Hindi Dubbed / Sub) - CineVista`;
    let pageDesc = titleDetails.plot_overview
        ? `Watch ${titleText} ${yearText} TV Series online for free in HD. Available with Hindi dubbed audio, Urdu & English subtitles. ${titleDetails.plot_overview.slice(0, 115)}...`
        : `Watch ${titleText} ${yearText} TV Series online for free in HD with Hindi dubbed audio and multi-language subtitles on CineVista.`;

    if (s && e) {
        pageTitle = `Watch ${titleText} Season ${s} Episode ${e} Free Online (Hindi Dubbed / Sub) - CineVista`;
        pageDesc = `Stream ${titleText} Season ${s} Episode ${e} online free in HD quality. Watch with Hindi dubbed audio, English & Urdu subtitles on CineVista.`;
    }

    const images = [];
    if (titleDetails.backdrop) {
        images.push({ url: titleDetails.backdrop, width: 1280, height: 720, alt: titleText });
    } else if (titleDetails.poster) {
        images.push({ url: titleDetails.poster, width: 500, height: 750, alt: titleText });
    }

    const slug = slugify(titleText);
    const basePath = `/watch/tv/${titleDetails.id}${slug ? `-${slug}` : ''}`;
    const canonicalPath = s && e ? `${basePath}?s=${s}&e=${e}` : basePath;
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

export default async function TvWatchPage({ params, searchParams }: Props) {
    const numericId = extractIdFromSlug(params.id);
    const s = searchParams.s;
    const e = searchParams.e;
    const titleDetails = await fetchTitleDetails(numericId, 'tv');

    if (!titleDetails) {
        notFound();
    }

    // Redirect to canonical slug URL if the current slug doesn't match
    const expectedSlug = slugify(titleDetails.title);
    const expectedParam = `${titleDetails.id}${expectedSlug ? `-${expectedSlug}` : ''}`;
    if (params.id !== expectedParam) {
        const queryString = s && e ? `?s=${s}&e=${e}` : '';
        redirect(`/watch/tv/${expectedParam}${queryString}`);
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
        '@type': 'TVSeries',
        'name': titleDetails.title,
        'description': titleDetails.plot_overview,
        'image': titleDetails.poster || titleDetails.backdrop,
        'dateCreated': titleDetails.release_date,
        'genre': titleDetails.genre_names,
        'numberOfSeasons': titleDetails.number_of_seasons,
        'numberOfEpisodes': titleDetails.number_of_episodes,
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
                'urlTemplate': `https://cinevista.online/watch/tv/${expectedParam}`
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
                'name': 'TV Shows',
                'item': 'https://cinevista.online/tv',
            },
            {
                '@type': 'ListItem',
                'position': 3,
                'name': titleDetails.title,
                'item': `https://cinevista.online/watch/tv/${expectedParam}`,
            },
        ],
    };

    // VideoObject schema — enables Google Video search results
    const videoSchema = {
        '@context': 'https://schema.org',
        '@type': 'VideoObject',
        'name': `Watch ${titleDetails.title} (${titleDetails.year || ''}) All Episodes Free Online`,
        'description': titleDetails.plot_overview || `Stream ${titleDetails.title} TV series online for free in HD on CineVista.`,
        'thumbnailUrl': titleDetails.backdrop || titleDetails.poster,
        'uploadDate': titleDetails.release_date || undefined,
        'contentUrl': `https://cinevista.online/watch/tv/${expectedParam}`,
        'embedUrl': `https://cinevista.online/watch/tv/${expectedParam}`,
        'potentialAction': {
            '@type': 'WatchAction',
            'target': `https://cinevista.online/watch/tv/${expectedParam}`
        }
    };

    // FAQPage schema — triggers FAQ rich snippets in Google + AEO
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {
                '@type': 'Question',
                'name': `Where can I watch ${titleDetails.title} online for free?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `You can watch all ${titleDetails.number_of_seasons || ''} seasons of ${titleDetails.title} for free on CineVista (cinevista.online). We offer HD streaming with Hindi dubbed audio, Urdu subtitles, and English subtitles. No registration or credit card is required.`
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
                'name': `How many seasons of ${titleDetails.title} are available?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `${titleDetails.title} has ${titleDetails.number_of_seasons || 'multiple'} season${(titleDetails.number_of_seasons || 0) > 1 ? 's' : ''} available on CineVista${titleDetails.number_of_episodes ? ` with a total of ${titleDetails.number_of_episodes} episodes` : ''}. All episodes are available to stream for free in HD quality.`
                }
            },
            {
                '@type': 'Question',
                'name': `Do I need to sign up to watch ${titleDetails.title}?`,
                'acceptedAnswer': {
                    '@type': 'Answer',
                    'text': `No, CineVista does not require any registration, account creation, or credit card. You can start streaming ${titleDetails.title} instantly by selecting a server and pressing play.`
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
                initialSeason={s ? parseInt(s) : 1}
                initialEpisode={e ? parseInt(e) : 1}
            />
        </>
    );
}
