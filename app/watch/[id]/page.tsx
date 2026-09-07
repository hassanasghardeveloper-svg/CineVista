import { redirect, notFound } from 'next/navigation';
import { fetchTitleDetails } from '@/lib/tmdb';
import { slugify } from '@/lib/slugify';

/**
 * Legacy redirect handler for old /watch/[id]?type=movie|tv URLs.
 * 301 redirects to the new clean slug URLs:
 *   /watch/movie/123-inception-2010
 *   /watch/tv/456-breaking-bad?s=1&e=3
 */

interface Props {
    params: { id: string };
    searchParams: {
        type?: string;
        s?: string;
        e?: string;
    };
}

export default async function LegacyWatchRedirect({ params, searchParams }: Props) {
    const type = searchParams.type || 'movie';
    const mediaType = type === 'tv' || type === 'tv_series' ? 'tv' : 'movie';
    const s = searchParams.s;
    const e = searchParams.e;

    // Try to fetch the title to build the slug
    const titleDetails = await fetchTitleDetails(params.id, mediaType);

    if (!titleDetails) {
        notFound();
    }

    const slug = mediaType === 'movie'
        ? slugify(titleDetails.title, titleDetails.year)
        : slugify(titleDetails.title);

    const newPath = `/watch/${mediaType}/${titleDetails.id}${slug ? `-${slug}` : ''}`;
    const queryString = mediaType === 'tv' && s && e ? `?s=${s}&e=${e}` : '';

    redirect(`${newPath}${queryString}`);
}
