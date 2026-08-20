import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: ['GPTBot', 'ClaudeBot', 'anthropic-ai', 'Bytespider', 'CCBot'],
                allow: '/',
            },
            {
                userAgent: '*',
                allow: ['/', '/_next/static/'],
                disallow: [
                    '/me/admin',
                    '/docs/admin',
                    '/api/',
                    '/auth/',
                    '/login',
                    '/_next/',
                    '/private/',
                ],
            },
        ],
        sitemap: 'https://avrxt.dev/sitemap.xml',
    };
}
