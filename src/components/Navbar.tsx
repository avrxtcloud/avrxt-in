'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CLOUD_SERVICES } from '@/lib/cloud-services';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();

    // Sliding highlight state
    const [hoverStyle, setHoverStyle] = useState({ left: 0, width: 0, opacity: 0 });
    const navRef = useRef<HTMLDivElement>(null);

    const searchItems = useMemo(() => {
        const baseItems = [
            { name: '/', href: '/', description: 'Home and overview' },
            { name: '/me', href: '/me', description: "Profile and Link's" },
            { name: '/portfolio', href: '/portfolio', description: 'Showcase of work' },
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

    // Hide navbar on /me routes
    if (pathname.startsWith('/me')) {
        return null;
    }

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/#about' },
        { name: 'Works', href: '/portfolio' },
        { name: 'Cloud', href: '/cloud' },
        { name: 'Docs', href: '/docs' },
    ];

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
        const target = e.currentTarget;
        setHoverStyle({
            left: target.offsetLeft,
            width: target.offsetWidth,
            opacity: 1
        });
    };

    const handleMouseLeave = () => {
        setHoverStyle(prev => ({ ...prev, opacity: 0 }));
    };

    const handleToggleMenu = () => {
        setIsOpen((prev) => !prev);
        setIsSearchOpen(false);
    };

    const handleToggleSearch = () => {
        setIsSearchOpen((prev) => !prev);
        setIsOpen(false);
    };

    return (
        <header className="fixed top-6 left-0 right-0 z-[100] flex justify-center px-6">
            <nav 
                ref={navRef}
                className="relative flex items-center bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20"
            >
                {/* Logo */}
                <Link href="/" className="px-4 py-2 transition-transform hover:scale-110 active:scale-95">
                    <img
                        src="https://cdn.avrxt.in/assets/logo.png"
                        alt="avrxt"
                        className="h-6 w-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]"
                    />
                </Link>

                {/* Sliding Highlight */}
                <div 
                    className="absolute h-[32px] bg-white/10 rounded-full transition-all duration-300 ease-out pointer-events-none"
                    style={{
                        left: `${hoverStyle.left}px`,
                        width: `${hoverStyle.width}px`,
                        opacity: hoverStyle.opacity
                    }}
                />

                {/* Nav Links - Desktop */}
                <div className="hidden sm:flex items-center gap-1 relative">
                    {navLinks.map((link) => {
                        const isActive = link.href === pathname || (link.href.startsWith('/#') && pathname === '/');
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                                className={cn(
                                    "px-4 py-2 text-[13px] font-medium transition-colors relative z-10",
                                    isActive ? "text-white" : "text-zinc-500 hover:text-white"
                                )}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop Search Trigger */}
                <button
                    onClick={handleToggleSearch}
                    className="hidden sm:flex items-center gap-2 ml-2 pl-3 pr-4 py-2 rounded-full hover:bg-white/5 transition-colors text-zinc-500 group"
                >
                    <Search className="w-3.5 h-3.5 group-hover:text-white transition-colors" />
                    <span className="text-[11px] font-mono opacity-50 uppercase tracking-widest hidden lg:block">Search</span>
                    <div className="flex items-center gap-1 border border-white/10 bg-black/40 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-600">
                        <Command className="w-2.5 h-2.5" />
                        <span>K</span>
                    </div>
                </button>

                {/* Mobile Icons */}
                <div className="flex sm:hidden items-center gap-1">
                    <button 
                        onClick={handleToggleSearch}
                        className="p-2 text-zinc-400 hover:text-white transition-colors"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={handleToggleMenu}
                        className="p-2 text-zinc-400 hover:text-white transition-colors relative z-[110]"
                    >
                        {isOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>

                {/* Search Modal (Simplified Overlay) */}
                {isSearchOpen && (
                    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-6">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)} />
                        <div className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-6 flex items-center gap-4 border-b border-white/5 bg-black/20">
                                <Search className="w-5 h-5 text-zinc-500" />
                                <input
                                    autoFocus
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Execute search command..."
                                    className="bg-transparent border-none outline-none text-white w-full text-lg placeholder:text-zinc-700 font-mono"
                                />
                                <button onClick={() => setIsSearchOpen(false)} className="text-zinc-600 hover:text-white font-mono text-xs uppercase tracking-widest">Esc</button>
                            </div>
                            <div className="max-h-[50vh] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                {filteredSearchItems.map((item, i) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsSearchOpen(false)}
                                        className="group flex items-center justify-between p-4 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all"
                                    >
                                        <div>
                                            <div className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{item.name}</div>
                                            <div className="text-[11px] text-zinc-600 group-hover:text-zinc-500 transition-colors uppercase tracking-widest">{item.description}</div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="px-2 py-1 rounded bg-white text-black text-[9px] font-black uppercase tracking-tighter">Enter</div>
                                        </div>
                                    </Link>
                                ))}
                                {filteredSearchItems.length === 0 && (
                                    <div className="p-8 text-center text-zinc-600 font-mono text-xs uppercase tracking-[0.2em]">
                                        No matching commands found.
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-3 bg-black/40 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                                <span>{filteredSearchItems.length} results found</span>
                                <div className="flex gap-4">
                                    <span>↑↓ Navigate</span>
                                    <span>↵ Select</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Fullscreen Menu */}
                {isOpen && (
                    <div className="fixed inset-0 z-[105] bg-black/98 backdrop-blur-3xl flex flex-col pt-32 px-10 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="space-y-6">
                            {navLinks.map((link, i) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-5xl font-black tracking-tighter text-zinc-800 hover:text-white transition-all hover:scale-105 origin-left"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link 
                                href="/me" 
                                onClick={() => setIsOpen(false)}
                                className="block text-5xl font-black tracking-tighter text-emerald-500/50 hover:text-emerald-400 transition-all hover:scale-105 origin-left"
                            >
                                /me
                            </Link>
                        </div>
                        <div className="mt-auto pb-20">
                            <Link 
                                href="/contact" 
                                onClick={() => setIsOpen(false)}
                                className="block w-full bg-white text-black text-center py-6 rounded-3xl font-black uppercase tracking-widest text-sm active:scale-[0.98] transition-transform shadow-2xl"
                            >
                                Initiate_Contact_
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}

