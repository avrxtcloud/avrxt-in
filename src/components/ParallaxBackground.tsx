'use client';

import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
    const bgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (!bgRef.current) return;
            const scrolled = window.scrollY;
            const val = scrolled * 0.15;
            bgRef.current.style.transform = `translate3d(0, ${val}px, 0)`;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return <div ref={bgRef} className="parallax-bg" />;
}
