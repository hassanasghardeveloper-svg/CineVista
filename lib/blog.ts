import fs from 'fs';
import path from 'path';

export interface BlogPost {
    slug: string;
    title: string;
    description: string;
    date: string;
    image: string;
    tags: string[];
    author: string;
    content: string;
    readingTime: number;
}

interface Frontmatter {
    title: string;
    description: string;
    date: string;
    image?: string;
    tags?: string[];
    author?: string;
}

function parseFrontmatter(fileContent: string): { frontmatter: Frontmatter; content: string } {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = fileContent.match(frontmatterRegex);

    if (!match) {
        return {
            frontmatter: { title: 'Untitled', description: '', date: new Date().toISOString() },
            content: fileContent,
        };
    }

    const frontmatterBlock = match[1];
    const content = match[2];

    const frontmatter: Record<string, any> = {};
    frontmatterBlock.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) return;
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();

        // Remove surrounding quotes
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }

        // Handle arrays (simple inline format: [tag1, tag2])
        if (value.startsWith('[') && value.endsWith(']')) {
            frontmatter[key] = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
        } else {
            frontmatter[key] = value;
        }
    });

    return {
        frontmatter: frontmatter as Frontmatter,
        content,
    };
}

function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
}

function getBlogDirectory(): string {
    return path.join(process.cwd(), 'content', 'blog');
}

export function getAllPosts(): BlogPost[] {
    const blogDir = getBlogDirectory();

    if (!fs.existsSync(blogDir)) {
        return [];
    }

    const files = fs.readdirSync(blogDir).filter(
        file => file.endsWith('.md') || file.endsWith('.mdx')
    );

    const posts = files.map(file => {
        const slug = file.replace(/\.(md|mdx)$/, '');
        const filePath = path.join(blogDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { frontmatter, content } = parseFrontmatter(fileContent);

        return {
            slug,
            title: frontmatter.title || 'Untitled',
            description: frontmatter.description || '',
            date: frontmatter.date || new Date().toISOString(),
            image: frontmatter.image || '/opengraph-image.jpg',
            tags: frontmatter.tags || [],
            author: frontmatter.author || 'CineVista',
            content,
            readingTime: calculateReadingTime(content),
        };
    });

    // Sort by date descending (newest first)
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
    const posts = getAllPosts();
    return posts.find(post => post.slug === slug) || null;
}

export function getRelatedPosts(currentSlug: string, limit: number = 3): BlogPost[] {
    const allPosts = getAllPosts();
    const currentPost = allPosts.find(p => p.slug === currentSlug);

    if (!currentPost) return allPosts.slice(0, limit);

    // Find posts with overlapping tags
    const scoredPosts = allPosts
        .filter(p => p.slug !== currentSlug)
        .map(post => {
            const commonTags = post.tags.filter(tag => currentPost.tags.includes(tag));
            return { ...post, score: commonTags.length };
        })
        .sort((a, b) => b.score - a.score);

    return scoredPosts.slice(0, limit);
}

// Simple markdown to HTML converter (basic — handles headers, bold, italic, links, lists, code)
export function markdownToHtml(markdown: string): string {
    let html = markdown;

    // Code blocks (```...```)
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');

    // Inline code (`...`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-accent-orange hover:underline">$1</a>');

    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-xl w-full my-6" />');

    // Unordered lists
    html = html.replace(/^[*-] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list-disc list-inside space-y-2 my-4">$&</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Blockquotes
    html = html.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-accent-orange pl-4 italic text-white/60 my-4">$1</blockquote>');

    // Horizontal rules
    html = html.replace(/^---$/gm, '<hr class="border-white/10 my-8" />');

    // Paragraphs (convert double newlines to paragraph breaks)
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // Clean up empty paragraphs
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<ul)/g, '$1');
    html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<pre)/g, '$1');
    html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<blockquote)/g, '$1');
    html = html.replace(/(<\/blockquote>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<hr)/g, '$1');
    html = html.replace(/(\/>\s*)<\/p>/g, '$1');

    return html;
}
