import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://avrxt.dev';

    const staticPages: {
        route: string;
        priority: number;
        changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    }[] = [
        { route: '',            priority: 1.0, changeFrequency: 'weekly'  },
        { route: '/me',         priority: 0.9, changeFrequency: 'monthly' },
        { route: '/portfolio',  priority: 0.9, changeFrequency: 'weekly'  },
        { route: '/hireme',     priority: 0.9, changeFrequency: 'monthly' },
        { route: '/contact',    priority: 0.8, changeFrequency: 'monthly' },
        { route: '/guestbook',  priority: 0.7, changeFrequency: 'weekly'  },
        { route: '/gallery',    priority: 0.7, changeFrequency: 'weekly'  },
        { route: '/docs',       priority: 0.7, changeFrequency: 'monthly' },
        { route: '/docs/welcome',    priority: 0.7, changeFrequency: 'monthly' },
        { route: '/docs/nxtdev.xyz', priority: 0.6, changeFrequency: 'monthly' },
        { route: '/uses',       priority: 0.6, changeFrequency: 'monthly' },
        { route: '/subscribe',  priority: 0.6, changeFrequency: 'monthly' },
        { route: '/cupcake',    priority: 0.5, changeFrequency: 'monthly' },
        { route: '/privacy',    priority: 0.3, changeFrequency: 'yearly'  },
        { route: '/terms',      priority: 0.3, changeFrequency: 'yearly'  },
        { route: '/dc/privacy', priority: 0.3, changeFrequency: 'yearly'  },
        { route: '/dc/terms',   priority: 0.3, changeFrequency: 'yearly'  },
        { route: '/refund',     priority: 0.3, changeFrequency: 'yearly'  },
        { route: '/security',   priority: 0.3, changeFrequency: 'yearly'  },
    ];

    return staticPages.map(({ route, priority, changeFrequency }) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency,
        priority,
    }));
}
