import { SERVICES } from './cloud/page';
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
        '/privacy',
        '/terms',
        '/refund',
        '/security',
        '/cupcake',
        '/guestbook',
        '/gallery',
        '/cloud',
        '/subscribe',
        '/uses',
    ];

    const staticSitemap = staticPages.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic service pages
    const serviceSitemap = SERVICES.map((service) => ({
        url: `${baseUrl}/cloud/${service.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [...staticSitemap, ...serviceSitemap];
}
