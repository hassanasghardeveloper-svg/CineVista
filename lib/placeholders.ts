// Inline SVG placeholders, served as data URIs. A missing poster shouldn't
// depend on a third-party image host still being alive.
function svgDataUri(width: number, height: number, label: string) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        `<rect width="100%" height="100%" fill="#0a0a0a"/>` +
        `<text x="50%" y="50%" fill="#e87c00" font-family="system-ui, sans-serif" font-size="${Math.round(width / 14)}"` +
        ` font-weight="700" letter-spacing="4" text-anchor="middle" dominant-baseline="middle">${label}</text>` +
        `</svg>`;

    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const POSTER_PLACEHOLDER = svgDataUri(500, 750, 'CINEVAULT');
export const BACKDROP_PLACEHOLDER = svgDataUri(1920, 1080, 'CINEVAULT');
