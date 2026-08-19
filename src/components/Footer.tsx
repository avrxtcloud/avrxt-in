'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Github, Mail, Instagram } from 'lucide-react';

import StatusBadge from './StatusBadge';

export default function Footer() {
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const year = new Date().getFullYear();
    const isMeRoute = pathname.startsWith('/me');

    if (isMeRoute) {
        return null;
    }

    return (
        <footer className="py-12 border-t border-white/5 bg-zinc-900/30 backdrop-blur-sm">
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 items-center gap-4 text-center">
                <div className="md:text-left order-2 md:order-1">
                    <p className="text-zinc-500 text-xs tracking-[0.4em] uppercase font-mono mb-1">
                        &copy; {isMounted ? year : '2026'} avrxt.dev
                    </p>
                    <p className="text-zinc-700 text-[10px] tracking-widest uppercase">
                        Infrastructure Layer Active
                    </p>
                </div>
{/* ... remaining code ... */}

                <div className="footer-status-blend flex justify-center order-1 md:order-2">
                    <StatusBadge />
                </div>

                <div className="flex justify-center md:justify-end gap-x-6 gap-y-2 text-zinc-500 text-[10px] font-mono uppercase tracking-widest order-3 flex-wrap">
                    <Link href="https://status.avrxt.dev" target="_blank" className="hover:text-white transition-colors">/status</Link>
                    <Link href="/terms" className="hover:text-white transition-colors">/terms</Link>
                    <Link href="/privacy" className="hover:text-white transition-colors">/privacy</Link>
                    <Link href="/refund" className="hover:text-white transition-colors">/refund</Link>
                    <Link href="/security" className="hover:text-white transition-colors">/security</Link>
                </div>
            </div>
        </footer>
    );
}
