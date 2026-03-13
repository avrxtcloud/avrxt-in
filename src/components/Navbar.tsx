'use client';

import { useMemo, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Search, Command } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CLOUD_SERVICES } from '@/lib/cloud-services';
import Magnetic from '@/components/Magnetic';

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

    // Hide navbar on restricted/full-screen routes
    if (pathname.startsWith('/me') || pathname.startsWith('/docs/admin')) {
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

    // Keyboard listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setIsSearchOpen(false);
            }
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <>
            <header 
                className={cn(
                    "fixed top-6 left-0 right-0 flex justify-center px-6 pointer-events-none transition-all duration-500",
                    (isOpen || isSearchOpen) ? "z-[300]" : "z-[100]"
                )}
            >
                <nav 
                    ref={navRef}
                    className="relative flex items-center bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-white/20 pointer-events-auto"
                >
                    {/* Logo */}
                    <Magnetic>
                        <Link href="/" className="px-4 py-2 transition-transform hover:scale-110 active:scale-95 flex items-center">
                            <img
                                src="/logo.png"
                                alt="avrxt"
                                className="h-[22px] w-auto drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] translate-y-[2px]"
                            />
                        </Link>
                    </Magnetic>

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
                    <Magnetic>
                        <button
                            onClick={handleToggleSearch}
                            className="hidden sm:flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-full transition-all group"
                        >
                            <Search className="w-3 h-3 group-hover:text-white transition-colors" />
                            <span className="text-[11px] font-mono opacity-50 uppercase tracking-widest hidden lg:block">Search</span>
                            <div className="flex items-center gap-1 border border-white/10 bg-black/40 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-600">
                                <Command className="w-2.5 h-2.5" />
                                <span>K</span>
                            </div>
                        </button>
                    </Magnetic>

                    {/* Mobile Icons */}
                    <div className="flex sm:hidden items-center gap-1">
                        <Magnetic>
                            <button 
                                onClick={handleToggleSearch}
                                className="p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <Search className="w-4 h-4" />
                            </button>
                        </Magnetic>
                        <Magnetic>
                            <button 
                                onClick={handleToggleMenu} 
                                className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 transition-all flex items-center gap-2 group"
                            >
                                {isOpen && (
                                    <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest animate-pulse">
                                        ESC
                                    </span>
                                )}
                                {isOpen ? <X className="w-4 h-4 text-emerald-400" /> : <Menu className="w-4 h-4" />}
                            </button>
                        </Magnetic>
                    </div>
                </nav>
            </header>

            {isSearchOpen && (
                <div className="fixed inset-0 z-[250] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 sm:px-6">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl cursor-pointer" onClick={() => setIsSearchOpen(false)} />
                    <div className="relative w-full max-w-2xl bg-[#080808] border border-white/10 rounded-3xl sm:rounded-[2rem] shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 sm:p-6 flex items-center gap-4 border-b border-white/5 bg-white/[0.01]">
                            <Search className="w-5 h-5 text-zinc-600" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Execute command..."
                                className="bg-transparent border-none outline-none text-white w-full text-base sm:text-lg placeholder:text-zinc-800 font-mono"
                            />
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:flex items-center gap-1.5 border border-white/10 bg-black/40 px-2 py-1 rounded text-[9px] font-mono text-zinc-600">
                                    <span>ESC</span>
                                </div>
                                <button onClick={() => setIsSearchOpen(false)} className="text-zinc-600 hover:text-white transition-colors p-1">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-4 space-y-1 custom-scrollbar">
                            {filteredSearchItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSearchOpen(false)}
                                    className="group flex items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-white/[0.04] border border-white/0 hover:border-white/5 transition-all transform hover:translate-x-1"
                                >
                                    <div>
                                        <div className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors flex items-center gap-2">
                                            {item.name}
                                            <div className="w-1 h-1 rounded-full bg-zinc-900 group-hover:bg-emerald-500 transition-colors" />
                                        </div>
                                        <div className="text-[10px] text-zinc-600 group-hover:text-zinc-500 transition-colors uppercase tracking-widest">{item.description}</div>
                                    </div>
                                    <div className="hidden sm:flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-tighter">Enter_Return</span>
                                        <div className="px-2 py-1 rounded bg-white/10 text-white text-[9px] font-black uppercase tracking-tighter border border-white/10">↵</div>
                                    </div>
                                </Link>
                            ))}
                            {filteredSearchItems.length === 0 && (
                                <div className="p-16 text-center">
                                    <Search className="w-12 h-12 mx-auto text-zinc-900 mb-4" />
                                    <div className="text-zinc-700 font-mono text-[10px] uppercase tracking-[0.3em]">
                                        Signal lost. No matching protocols found.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu */}
            {isOpen && (
                <div className="fixed inset-0 z-[200] bg-[#050505] flex flex-col pt-32 px-10 animate-in fade-in duration-500 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:32px_32px]"></div>
                    <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-emerald-500/[0.03] to-transparent pointer-events-none" />
                    
                    <div className="relative z-10 space-y-3">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-px w-6 bg-zinc-800" />
                            <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-[0.4em]">Directory_v5.2</span>
                        </div>
                        {navLinks.map((link, i) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className="group block text-5xl sm:text-6xl font-black tracking-tighter text-zinc-900 hover:text-white transition-all transform hover:translate-x-4 active:scale-95 origin-left"
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                <span className="inline-block group-hover:italic group-hover:tracking-normal transition-all duration-300">
                                    {link.name}
                                </span>
                            </Link>
                        ))}
                        <Link 
                            href="/me" 
                            onClick={() => setIsOpen(false)}
                            className="group block text-5xl sm:text-6xl font-black tracking-tighter text-emerald-500/10 hover:text-emerald-400 transition-all transform hover:translate-x-4 active:scale-95 origin-left"
                        >
                            /me
                        </Link>
                    </div>

                    <div className="relative z-10 mt-auto pb-12 sm:pb-20">
                        <Link 
                            href="/contact" 
                            onClick={() => setIsOpen(false)}
                            className="block w-full bg-white text-black text-center py-6 rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-[0_30px_60px_rgba(255,255,255,0.05)] border border-white"
                        >
                            Initiate_Contact_
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
