'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Hide navbar on /me routes
    if (pathname.startsWith('/me')) {
        return null;
    }

    const navLinks = [
        { name: '/about', href: '/#about' },
        { name: '/skills', href: '/#expertise' },
        { name: '/projects', href: '/#projects' },
        { name: '/uses', href: '/uses' },
        { name: '/cloud', href: '/cloud' },
        { name: '/cupcake', href: '/cupcake' },
        { name: '/biz', href: '/#solutions' },
    ];

    return (
        <header className="fixed top-0 w-full z-50 text-white">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
            <div className="bg-black/80 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
                <nav className="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                        <img src="https://cdn.avrxt.in/assets/logo.png" alt="avrxt" className="h-10 md:h-12 w-auto" />
                        <div className="hidden md:block">
                            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500">avrxt</div>
                            <div className="text-[11px] text-zinc-400">Premium Stack</div>
                        </div>
                    </Link>

                    <div className="hidden sm:flex items-center gap-6 text-[12px] font-medium tracking-tight text-zinc-400">
                        {navLinks.map((link) => {
                            const isActive = link.href === pathname || (link.href.startsWith('/#') && pathname === '/');
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "relative transition-colors hover:text-white",
                                        isActive && "text-white"
                                    )}
                                >
                                    {link.name}
                                    {isActive && (
                                        <span className="absolute -bottom-2 left-0 h-[2px] w-full bg-gradient-to-r from-emerald-400 via-cyan-300 to-transparent" />
                                    )}
                                </Link>
                            );
                        })}
                        <Link
                            href="/contact"
                            className="bg-white text-black px-4 py-1.5 rounded-full hover:scale-105 transition-transform font-bold"
                        >
                            Contact
                        </Link>
                    </div>

                    <button
                        className="sm:hidden rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:border-white/30 hover:bg-white/10"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </nav>
            </div>

            <div
                className={cn(
                    "sm:hidden bg-black/80 border-b border-white/5 px-6 space-y-4 overflow-x-hidden overflow-y-auto transition-all duration-400 backdrop-blur-2xl",
                    isOpen ? "max-h-[80vh] py-6 opacity-100" : "max-h-0 py-0 opacity-0"
                )}
                style={{ paddingBottom: isOpen ? "calc(env(safe-area-inset-bottom) + 24px)" : undefined }}
            >
                {navLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="block text-zinc-300 py-2 transition-colors hover:text-white"
                        onClick={() => setIsOpen(false)}
                    >
                        {link.name}
                    </Link>
                ))}
                <Link href="/contact" className="block bg-white text-black text-center py-3 rounded-lg font-bold" onClick={() => setIsOpen(false)}>
                    Contact
                </Link>
            </div>
        </header>
    );
}
