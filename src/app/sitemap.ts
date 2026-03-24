import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.avrxt.in';

    // Base pages
    const staticPages = [
        '',
        '/me',
        '/docs',
        '/hireme',
        '/contact',
        '/portfolio',
        '/privacy',
        '/terms',
        '/refund',
        '/security',
        '/cupcake',
        '/guestbook',
        '/gallery',
        '/subscribe',
        '/uses',
    ];

    const staticSitemap = staticPages.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return staticSitemap;
}
