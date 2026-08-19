'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CustomCursor from '@/components/CustomCursor';
import ParallaxBackground from '@/components/ParallaxBackground';
import PremiumLoader from '@/components/PremiumLoader';
import GlobalLinkPreview from '@/components/GlobalLinkPreview';

const CHROMELESS_ROUTES = new Set([
    '/', '/home', '/me', '/maintenance', '/link-error-404',
    '/400', '/401', '/403', '/404', '/408', '/429',
    '/500', '/502', '/503', '/504',
]);

export default function SiteChrome({ position }: { position: 'before' | 'after' }) {
    const pathname = usePathname();
    if (CHROMELESS_ROUTES.has(pathname)) return null;

    if (position === 'before') {
        return (
            <>
                <Suspense fallback={null}><PremiumLoader /></Suspense>
                <CustomCursor />
                <ParallaxBackground />
                <div className="mesh-gradient" />
                <Navbar />
            </>
        );
    }

    return (
        <>
            <GlobalLinkPreview />
            <Footer />
        </>
    );
}
