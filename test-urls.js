
async function testUrls() {
    const id = '1833821';
    const patterns = [
        `https://images.watchmode.com/poster/${id}_small.jpg`,
        `https://images.watchmode.com/posters/${id}_small.jpg`,
        `https://cdn.watchmode.com/posters/${id}_small.jpg`,
        `https://cdn.watchmode.com/posters/${id.padStart(8, '0')}_small.jpg`,
        `https://images.watchmode.com/posters/01833821_small.jpg`,
    ];

    for (const url of patterns) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            console.log(`${url} -> ${res.status}`);
        } catch (e) {
            console.log(`${url} -> ERROR: ${e.message}`);
        }
    }
}

testUrls();
