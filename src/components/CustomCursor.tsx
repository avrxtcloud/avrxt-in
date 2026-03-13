'use client';

import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isHidden, setIsHidden] = useState(true);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            setIsHidden(false);
            if (cursorRef.current && followerRef.current) {
                const { clientX: x, clientY: y } = e;
                
                // Primary small dot
                cursorRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
                
                // Trailing larger circle
                followerRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            }
        };

        const handleHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isClickable = target.closest('a, button, [role="button"], input, select, textarea');
            setIsHovering(!!isClickable);
        };

        const handleMouseLeave = () => setIsHidden(true);
        const handleMouseEnter = () => setIsHidden(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHover);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHover);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, []);

    return (
        <>
            <div
                ref={cursorRef}
                className={cn(
                    "fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 hidden sm:block",
                    isHidden ? "opacity-0" : "opacity-100",
                    isHovering && "scale-150 bg-emerald-400"
                )}
            />
            <div
                ref={followerRef}
                className={cn(
                    "fixed top-0 left-0 w-8 h-8 border border-white/20 rounded-full z-[9998] pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-out hidden sm:block",
                    isHidden ? "opacity-0" : "opacity-100",
                    isHovering ? "scale-150 border-emerald-400/40 bg-emerald-400/5 blur-[2px]" : "scale-100"
                )}
            />
        </>
    );
}
