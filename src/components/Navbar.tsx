'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CLOUD_SERVICES } from '@/lib/cloud-services';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
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
        { name: '/me', href: '/me' },
        { name: '/cloud', href: '/cloud' },
        { name: '/cupcake', href: '/cupcake' },
        { name: '/biz', href: '/#solutions' },
    ];

    const searchItems = useMemo(() => {
        const baseItems = [
            { name: '/', href: '/', description: 'Home and overview' },
            { name: '/me', href: '/me', description: "Profile and Link's" },
            { name: '/uses', href: '/uses', description: 'Tools, apps, and gear' },
            { name: '/subscribe', href: '/subscribe', description: 'Newsletter Subscription' },
            { name: '/contact', href: '/contact', description: 'Contact @avrxt' },
            { name: '/guestbook', href: '/guestbook', description: 'Leave a footprint' },
            { name: '/cloud', href: '/cloud', description: 'Cloud services' },
            { name: '/gallery', href: '/gallery', description: 'Visual gallery' },
            { name: '/docs', href: '/docs', description: 'Docs and resources' },
            { name: '/hireme', href: '/hireme', description: 'Work with avrxt' },
            { name: '/cupcake', href: '/cupcake', description: 'Support the work' },
            { name: '/privacy', href: '/privacy', description: 'Privacy policy' },
            { name: '/terms', href: '/terms', description: 'Terms of service' },
            { name: '/refund', href: '/refund', description: 'Refund policy' },
            { name: '/security', href: '/security', description: 'Security policy' },
        ];

        const cloudItems = CLOUD_SERVICES.map((service) => ({
            name: service.title,
            href: `/cloud/${service.id}`,
            description: service.description,
        }));

        return [...baseItems, ...cloudItems];
    }, []);

    const filteredSearchItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return searchItems;
        return searchItems.filter((item) => {
            const name = item.name.toLowerCase();
            const description = item.description.toLowerCase();
            const href = item.href.toLowerCase();
            return name.includes(query) || description.includes(query) || href.includes(query);
        });
    }, [searchQuery, searchItems]);

    const handleToggleMenu = () => {
        setIsOpen((prev) => !prev);
        setIsSearchOpen(false);
    };

    const handleToggleSearch = () => {
        setIsSearchOpen((prev) => !prev);
        setIsOpen(false);
    };

    return (
        <header className="fixed top-0 w-full z-50 text-white">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/5" />
            <div className="bg-black/80 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]" style={{ paddingTop: "env(safe-area-inset-top)" }}>
                <nav className="max-w-6xl mx-auto px-6 py-2 sm:py-0 sm:h-20 grid grid-cols-[auto,1fr,auto] items-start sm:items-center gap-6">
                    <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
                        <img src="https://cdn.avrxt.in/assets/logo.png" alt="avrxt" className="h-9 sm:h-10 md:h-12 w-auto" />
                        <div className="hidden md:block">
                            <div className="text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500">avrxt</div>
                            <div className="text-[11px] text-zinc-400">Premium Stack</div>
                        </div>
                    </Link>

                    <div className="hidden sm:flex items-center justify-center gap-6 text-[12px] font-medium tracking-tight text-zinc-400">
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
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <div
                            className="relative hidden md:block"
                            onFocus={() => setIsSearchOpen(true)}
                            onBlur={() => setTimeout(() => setIsSearchOpen(false), 120)}
                        >
                            <button
                                type="button"
                                onClick={handleToggleSearch}
                                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white/30 hover:text-white"
                            >
                                <Search className="h-4 w-4 text-zinc-500" />
                                Search
                            </button>

                            {isSearchOpen && (
                                <div className="absolute right-0 mt-3 w-72 rounded-2xl border border-white/10 bg-black/90 p-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                                    <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                                        Search Pages
                                    </div>
                                    <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400">
                                        <Search className="h-4 w-4 text-zinc-500" />
                                        <input
                                            value={searchQuery}
                                            onChange={(event) => setSearchQuery(event.target.value)}
                                            placeholder="Type to filter pages"
                                            className="bg-transparent outline-none placeholder:text-zinc-600 w-full"
                                        />
                                    </div>
                                    <div className="mt-3 space-y-2 max-h-64 overflow-y-auto pr-1">
                                        {filteredSearchItems.length === 0 ? (
                                            <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-500">
                                                No matches. Try another keyword.
                                            </div>
                                        ) : (
                                            filteredSearchItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="block rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                                                    onClick={() => setIsSearchOpen(false)}
                                                >
                                                    <div className="font-semibold">{item.name}</div>
                                                    <div className="text-[11px] text-zinc-500">{item.description}</div>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            href="/contact"
                            className="hidden sm:inline-flex bg-white text-black px-4 py-1.5 rounded-full hover:scale-105 transition-transform font-bold"
                        >
                            Contact
                        </Link>

                        <button
                            type="button"
                            className="md:hidden rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:border-white/30 hover:bg-white/10"
                            onClick={handleToggleSearch}
                        >
                            <Search className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            className="sm:hidden rounded-full border border-white/10 bg-white/5 p-2 text-white transition-colors hover:border-white/30 hover:bg-white/10"
                            onClick={handleToggleMenu}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>
            </div>

            <div
                className={cn(
                    "md:hidden bg-black/80 border-b border-white/5 px-6 overflow-hidden transition-all duration-400 backdrop-blur-2xl",
                    isSearchOpen ? "max-h-[70vh] py-4 opacity-100" : "max-h-0 py-0 opacity-0"
                )}
                style={{ paddingBottom: isSearchOpen ? "calc(env(safe-area-inset-bottom) + 20px)" : undefined }}
            >
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-zinc-400">
                    <Search className="h-4 w-4 text-zinc-500" />
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search pages"
                        className="bg-transparent outline-none placeholder:text-zinc-600 w-full"
                    />
                </div>
                <div className="mt-3 space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                    {filteredSearchItems.length === 0 ? (
                        <div className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-500">
                            No matches. Try another keyword.
                        </div>
                    ) : (
                        filteredSearchItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="block rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-xs text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                                onClick={() => setIsSearchOpen(false)}
                            >
                                <div className="font-semibold">{item.name}</div>
                                <div className="text-[11px] text-zinc-500">{item.description}</div>
                            </Link>
                        ))
                    )}
                </div>
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
