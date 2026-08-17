import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const TMDB_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const IMG_BASE = 'https://image.tmdb.org/t/p';

const SYSTEM_PROMPT = `You are CineVault's AI movie recommendation assistant. 
You understand requests in English, Urdu, Hindi, and mixed languages.

When the user describes what they want to watch, respond ONLY with a valid JSON array (no markdown, no explanation).
Each object must have: { "title": string, "type": "movie" | "tv", "year": string (optional) }

Rules:
- Return 6 to 8 recommendations
- Match the language/region of the request (if user asks for Pakistani content, return Pakistani shows; Korean → Korean dramas, etc.)
- If user says "drama" without region, assume TV series
- Understand mood words: sad=emotional/romance, action=thriller/action, funny=comedy, scary=horror
- Understand regional terms: "desi"=Pakistani/Indian, "kdrama"=Korean TV, "Turkish"=Turkish series
- For "webseries" or "series" → use type: "tv"
- Always return real, well-known titles that exist on TMDB
- JSON only, no other text

Example output:
[{"title":"Dilwale Dulhania Le Jayenge","type":"movie","year":"1995"},{"title":"Ertugrul","type":"tv","year":"2014"}]`;

async function searchTMDB(title: string, type: string, year?: string) {
    try {
        const yearParam = year ? `&year=${year}` : '';
        const mediaType = type === 'tv' ? 'tv' : 'movie';

        // Try exact search first
        const res = await fetch(
            `${TMDB_BASE}/search/${mediaType}?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}${yearParam}&page=1`,
            { next: { revalidate: 3600 } }
        );
        if (!res.ok) return null;
        const data = await res.json();

        const result = data.results?.[0];
        if (!result) {
            // Fallback: multi search
            const fallback = await fetch(
                `${TMDB_BASE}/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&page=1`,
                { next: { revalidate: 3600 } }
            );
            if (!fallback.ok) return null;
            const fData = await fallback.json();
            const fResult = fData.results?.find((r: any) => r.media_type === 'movie' || r.media_type === 'tv');
            if (!fResult) return null;
            return {
                id: fResult.id,
                title: fResult.title || fResult.name,
                type: fResult.media_type,
                year: (fResult.release_date || fResult.first_air_date || '').split('-')[0],
                poster: fResult.poster_path ? `${IMG_BASE}/w500${fResult.poster_path}` : null,
                backdrop: fResult.backdrop_path ? `${IMG_BASE}/w780${fResult.backdrop_path}` : null,
                rating: fResult.vote_average || 0,
                overview: fResult.overview || '',
            };
        }

        return {
            id: result.id,
            title: result.title || result.name,
            type: mediaType,
            year: (result.release_date || result.first_air_date || '').split('-')[0],
            poster: result.poster_path ? `${IMG_BASE}/w500${result.poster_path}` : null,
            backdrop: result.backdrop_path ? `${IMG_BASE}/w780${result.backdrop_path}` : null,
            rating: result.vote_average || 0,
            overview: result.overview || '',
        };
    } catch {
        return null;
    }
}

export async function POST(request: Request) {
    try {
        const { message, history } = await request.json();

        if (!message?.trim()) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
            return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
        }

        // Build conversation history for context
        const messages: any[] = [{ role: 'system', content: SYSTEM_PROMPT }];

        // Add previous turns for multi-turn context (last 4 turns max)
        if (Array.isArray(history)) {
            const recent = history.slice(-4);
            recent.forEach((turn: any) => {
                if (turn.role && turn.content) {
                    messages.push({ role: turn.role, content: turn.content });
                }
            });
        }

        messages.push({ role: 'user', content: message });

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // Call Groq
        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-120b',
            messages,
            temperature: 0.7,
            max_tokens: 1024,
        });

        const rawContent = completion.choices[0]?.message?.content || '[]';

        // Parse JSON from Groq response
        let recommendations: { title: string; type: string; year?: string }[] = [];
        try {
            // Strip markdown code fences if present
            const cleaned = rawContent.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
            recommendations = JSON.parse(cleaned);
            if (!Array.isArray(recommendations)) recommendations = [];
        } catch {
            return NextResponse.json({ error: 'AI response parsing failed', raw: rawContent }, { status: 500 });
        }

        // Fetch real TMDB data for each recommendation in parallel
        const results = await Promise.all(
            recommendations.slice(0, 8).map(rec => searchTMDB(rec.title, rec.type, rec.year))
        );

        const movies = results.filter(Boolean);

        return NextResponse.json({
            movies,
            assistantMessage: rawContent,
        });
    } catch (error: any) {
        console.error('Recommend API error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
