'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    ArrowUpRight,
    ExternalLink,
    Github,
    Layers,
    Layout,
    Cpu,
    ShieldCheck,
    Globe,
    Smartphone,
    Search,
    ChevronRight,
    Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Reveal from '@/components/Reveal';
import SpotlightBox from '@/components/SpotlightBox';

const CATEGORIES = ['All', 'Web', 'Infrastructure', 'AI', 'Full-Stack'];

const PROJECTS = [
    {
        id: 1,
        title: 'Zenith Cloud Infrastructure',
        category: 'Infrastructure',
        description: 'Next-gen monitoring with real-time health pulse and automated failover orchestration.',
        tags: ['React', 'Next.js', 'Cloudflare', 'D1'],
        image: 'https://objects.avrxt.in/images/aviorxt_01.jpg',
        link: 'https://ping.avrxt.in',
        github: '#',
        status: 'Operational'
    },
    {
        id: 2,
        title: 'Aura AI Agentic Core',
        category: 'AI',
        description: 'Multi-agent neural workflow system designed for high-throughput task automation.',
        tags: ['Python', 'OpenAI', 'FastAPI', 'Redis'],
        image: 'https://objects.avrxt.in/assets/screenshot-zoom-analytics.webp',
        link: '#',
        github: '#',
        status: 'Beta'
    },
    {
        id: 3,
        title: 'Ghost Node Proxy',
        category: 'Infrastructure',
        description: 'Privacy-focused API gateway with built-in geofencing and anti-ISP filtering.',
        tags: ['Go', 'TypeScript', 'Workers', 'Redis'],
        image: 'https://cdn.avrxt.in/icons/favicon.jpg',
        link: '#',
        github: '#',
        status: 'Private'
    },
    {
        id: 4,
        title: 'Nexus Enterprise Stack',
        category: 'Web',
        description: 'Comprehensive ERP layer for enterprise management with high-performance dashboarding.',
        tags: ['React', 'Supabase', 'Tailwind', 'PostgreSQL'],
        image: 'https://objects.avrxt.in/assets/logo.png',
        link: '#',
        github: '#',
        status: 'Production'
    },
    {
        id: 5,
        title: 'Core Portfolio V2',
        category: 'Full-Stack',
        description: 'Minimalist, performant, and aero-designed personal ecosystem Hub.',
        tags: ['Next.js', 'TypeScript', 'Motion', 'Vercel'],
        image: 'https://objects.avrxt.in/assets/banner_02.webp',
        link: '/me',
        github: '#',
        status: 'Live'
    }
];

export default function PortfolioClient() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredProjects = PROJECTS.filter(project => {
        const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/10 overflow-x-hidden pt-32 pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-800/20 blur-[150px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Header */}
                <Reveal className="mb-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-500 mb-6">
                        <Layers className="w-3 h-3" /> System_Archive
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 gradient-heading">
                        Portfolio.
                    </h1>
                    <p className="max-w-2xl text-zinc-400 text-lg md:text-xl leading-relaxed">
                        A collection of high-performance digital infrastructure,
                        automated architectures, and premium design engineering.
                    </p>
                </Reveal>

                {/* Filters */}
                <Reveal className="mb-12 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-mono border transition-all duration-300 uppercase tracking-widest",
                                    activeCategory === cat
                                        ? "bg-white text-black border-white"
                                        : "bg-white/5 text-zinc-500 border-white/5 hover:border-white/20 hover:text-white"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative group max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Locate Project_"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white placeholder:text-zinc-600 outline-none focus:border-white/30 transition-all"
                        />
                    </div>
                </Reveal>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project, idx) => (
                            <Reveal key={project.id} className="group" style={{ transitionDelay: `${idx * 0.1}s` }}>
                                <SpotlightBox className="h-full overflow-hidden rounded-3xl">
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[8px] font-mono text-white tracking-widest uppercase">
                                                {project.category}
                                            </span>
                                        </div>

                                        <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                            <Link href={project.link} target={project.link.startsWith('http') ? "_blank" : undefined} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-2xl">
                                                <ArrowUpRight className="w-5 h-5" />
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="p-8">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-2xl font-bold tracking-tighter text-white group-hover:text-emerald-400 transition-colors">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md border border-white/10 bg-white/5">
                                                <div className={cn(
                                                    "w-1 h-1 rounded-full",
                                                    project.status === 'Operational' || project.status === 'Live' || project.status === 'Production' ? "bg-emerald-500 animate-pulse" : "bg-zinc-600"
                                                )} />
                                                <span className="text-[7px] font-mono text-zinc-400 uppercase tracking-widest">{project.status}</span>
                                            </div>
                                        </div>

                                        <p className="text-zinc-500 text-sm leading-relaxed mb-8 line-clamp-2">
                                            {project.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 pt-6 border-t border-white/5">
                                            {project.tags.map(tag => (
                                                <span key={tag} className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </SpotlightBox>
                            </Reveal>
                        ))
                    ) : (
                        <div className="col-span-full py-32 text-center">
                            <Reveal>
                                <div className="text-zinc-700 text-4xl mb-4 font-black">404_NULL</div>
                                <p className="text-zinc-600 font-mono uppercase tracking-[0.3em] text-xs">No project archives found matching this query.</p>
                            </Reveal>
                        </div>
                    )}
                </div>

                {/* CTA */}
                <Reveal className="mt-32 p-12 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-white/[0.03] to-transparent text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-emerald-500/10 transition-colors duration-700" />

                    <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-white mb-6">Want to initiate a <br />new build?</h2>
                    <p className="text-zinc-500 mb-10 max-w-xl mx-auto leading-relaxed">
                        I&apos;m currently accepting premium commissions for enterprise infrastructure,
                        advanced AI systems, and high-performance Web apps.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/hireme" className="inline-flex items-center gap-3 bg-white text-black px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                            Initiate Hire <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                        <Link href="/contact" className="inline-flex items-center gap-3 border border-white/10 hover:bg-white/5 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all">
                            Consultation <ChevronRight className="w-4 h-4 ml-2" />
                        </Link>
                    </div>
                </Reveal>
            </div>

            {/* Footer padding */}
            <div className="h-10" />
        </main>
    );
}

function ArrowRight({ className, ...props }: any) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            {...props}
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    );
}
