'use client';

import { RefObject, useEffect } from 'react';

// Embed hosts report playback over postMessage, each with its own payload
// shape. Pull a 0-100 percentage out of the shapes we've seen and return null
// for anything unrecognised rather than guessing.
export function parseProgress(data: unknown): number | null {
    const payload = typeof data === 'string' ? safeParse(data) : data;
    if (!payload || typeof payload !== 'object') return null;

    const record = payload as Record<string, any>;
    const inner = record.data && typeof record.data === 'object' ? record.data : record;

    // A bare fraction (0-1) and a percentage (0-100) are indistinguishable at
    // the low end; treat <= 1 as a fraction, which only misreads the first 1%.
    const explicit = toNumber(inner.progress ?? inner.percentage);
    if (explicit !== null) return clamp(explicit <= 1 ? explicit * 100 : explicit);

    const current = toNumber(inner.currentTime ?? inner.time ?? inner.watchedTime);
    const total = toNumber(inner.duration ?? inner.totalTime);
    if (current !== null && total !== null && total > 0) return clamp((current / total) * 100);

    return null;
}

// Forward playback progress from an embed iframe to the page.
export function useEmbedProgress(
    iframeRef: RefObject<HTMLIFrameElement>,
    onProgress?: (progress: number) => void,
) {
    useEffect(() => {
        if (!onProgress) return;

        const handleMessage = (event: MessageEvent) => {
            // Only trust messages from the player we rendered.
            if (event.source !== iframeRef.current?.contentWindow) return;

            const percent = parseProgress(event.data);
            if (percent !== null) onProgress(percent);
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [iframeRef, onProgress]);
}

function safeParse(value: string) {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function toNumber(value: unknown): number | null {
    const num = typeof value === 'string' ? Number(value) : value;
    return typeof num === 'number' && Number.isFinite(num) ? num : null;
}

function clamp(percent: number) {
    return Math.min(100, Math.max(0, percent));
}
