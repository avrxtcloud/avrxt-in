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
    Filter,
    Mail,
    Instagram,
    Copy,
    CheckCircle2,
    Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Reveal from '@/components/Reveal';
import SpotlightBox from '@/components/SpotlightBox';
import Tilt from '@/components/Tilt';
import Magnetic from '@/components/Magnetic';

const PERSONAL_PHOTOS = [
    'https://cdn.avxt.qzz.io/images/14041223_125659207.jpg',
    'https://cdn.avxt.qzz.io/images/14041223_125715885.jpg'
];

const CATEGORIES = ['All', 'Web', 'Infrastructure', 'AI', 'Full-Stack'];

const PROJECTS = [
    {
        id: 1,
        title: 'ebnn.xyz',
        category: 'Web',
        description: 'A personal Web Engine designed for high-performance, modular content delivery.',
        tags: ['Next.js', 'Web Engine', 'Architecture'],
        link: 'https://www.ebnn.xyz/',
        github: '#',
        status: 'Production'
    },
    {
        id: 2,
        title: 'axtcity.online',
        category: 'Web',
        description: 'A comprehensive Fivem Roleplay community platform with integrated stats and management.',
        tags: ['React', 'Gaming', 'Community'],
        link: 'https://www.axtcity.online/',
        github: '#',
        status: 'Live'
    },
    {
        id: 3,
        title: 'AxtCloud Hosting',
        category: 'Infrastructure',
        description: 'Premium hosting solutions engineered for speed, security, and developer productivity.',
        tags: ['Cloud', 'Hosting', 'Infrastructure'],
        link: 'https://www.goaxt.cloud/',
        github: '#',
        status: 'Operational'
    },
    {
        id: 4,
        title: 'AxtCloud S3 Storage',
        category: 'Infrastructure',
        description: 'High-availability S3 compatible object storage with global edge distribution.',
        tags: ['Storage', 'S3', 'Cloudflare'],
        link: 'https://s3.goaxt.cloud/',
        github: '#',
        status: 'Production'
    },
    {
        id: 5,
        title: 'Relume AI Core',
        category: 'AI',
        description: 'Advanced backend engineering for Relume AI, optimizing high-scale neural workflows.',
        tags: ['AI', 'Backend', 'Relume'],
        link: 'https://www.relume.io/',
        github: '#',
        status: 'Team Backend Engineer'
    },
    {
        id: 6,
        title: 'aviorxt.aero',
        category: 'AI',
        description: 'Next-generation aero-designed web ecosystem powered by intelligent automation.',
        tags: ['Aero', 'Design', 'AI'],
        link: 'https://aviorxt.aero',
        github: '#',
        status: 'Live'
    }
];

export default function PortfolioClient() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCopyEmail = () => {
        navigator.clipboard.writeText('dev@avrxt.dev');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const filteredProjects = PROJECTS.filter(project => {
        const matchesCategory = activeCategory === 'All' || project.category === activeCategory;
        const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/10 overflow-x-hidden pt-24 sm:pt-32 pb-20">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[60%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[90%] h-[70%] bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute top-[30%] left-[40%] w-[40%] h-[40%] bg-purple-500/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay"></div>
            </div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Header */}
                <Reveal className="mb-20" direction="down" delay={0.1}>
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500">
                            <Layers className="w-3 h-3" /> System_Archive
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-[9px] font-mono uppercase tracking-[0.3em] text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                            <Briefcase className="w-3 h-3" /> Active: Indigo Airlines
                        </div>
                    </div>
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-8 gradient-heading leading-[0.8] py-2">
                        Portfolio.
                    </h1>
                    <p className="max-w-2xl text-zinc-400 text-base md:text-xl leading-relaxed mb-10 px-1 border-l-2 border-white/5">
                        Become a 10x engineer, learn to refactor and write clean code.
                        Architecture of high-performance digital ecosystems and premium design engineering.
                    </p>

                    <div className="flex flex-wrap gap-4 sm:gap-8 items-center">
                        <div className="flex items-center gap-3 group cursor-pointer" onClick={handleCopyEmail}>
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-xl">
                                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Mail className="w-4 h-4" />}
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">Email Payload</div>
                                <div className="text-sm font-bold text-zinc-300">dev@avrxt.dev</div>
                            </div>
                        </div>

                        <Link href="https://github.com/aviorxt" target="_blank" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-xl">
                                <Github className="w-4 h-4" />
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">Source Node</div>
                                <div className="text-sm font-bold text-zinc-300">github/aviorxt</div>
                            </div>
                        </Link>

                        <Link href="https://instagram.com/aviorxt" target="_blank" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-xl">
                                <Instagram className="w-4 h-4" />
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-[9px] font-mono uppercase tracking-widest text-zinc-600">Visual Feed</div>
                                <div className="text-sm font-bold text-zinc-300">@aviorxt</div>
                            </div>
                        </Link>
                    </div>
                </Reveal>

                {/* Personal Gallery */}
                <Reveal className="mb-24" direction="up" delay={0.2}>
                    <div className="flex items-center gap-3 mb-10">
                        <div className="h-px w-8 bg-emerald-500/50" />
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.5em] whitespace-nowrap">The_Engineer_Visuals</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 via-white/5 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                        {PERSONAL_PHOTOS.map((photo, i) => (
                            <Reveal key={i} delay={0.3 + (i * 0.1)} direction="up" className="group">
                                <Tilt intensity={5}>
                                    <div className="relative aspect-[4/5] md:aspect-[16/10] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-700">
                                        <img
                                            src={photo}
                                            alt="avrxt"
                                            loading="lazy"
                                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                                        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
                                            <div className="text-[9px] font-mono text-emerald-500/80 uppercase tracking-widest mb-1">// SEC_00{i + 1}</div>
                                            <div className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">Identity_V3</div>
                                        </div>
                                    </div>
                                </Tilt>
                            </Reveal>
                        ))}
                    </div>
                </Reveal>

                {/* Filters */}
                <Reveal className="mb-12 flex flex-col md:flex-row gap-6 md:items-center justify-between" direction="up" delay={0.4}>
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
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs font-mono text-white placeholder:text-zinc-700 outline-none focus:border-white/30 transition-all font-mono"
                        />
                    </div>
                </Reveal>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map((project, idx) => (
                            <Reveal key={project.id} className="group" delay={idx * 0.1} direction="up">
                                <Link
                                    href={project.link}
                                    target="_blank"
                                    className="block h-full cursor-none"
                                >
                                    <Tilt intensity={8} className="h-full">
                                        <SpotlightBox className="h-full overflow-hidden rounded-[2rem] md:rounded-[3rem] border border-white/5 bg-[#0a0a0a]/40 backdrop-blur-xl transition-all duration-700 group-hover:border-emerald-500/30 group-hover:bg-[#111]/60 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
                                            <div className="relative aspect-[4/3] md:aspect-[16/10] overflow-hidden bg-zinc-900">
                                                <img
                                                    src={`https://api.microlink.io/?url=${encodeURIComponent(project.link)}&screenshot=true&meta=false&embed=screenshot.url`}
                                                    alt={project.title}
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = `https://s0.wp.com/mshots/v1/${encodeURIComponent(project.link)}?w=1280&h=800`;
                                                    }}
                                                    className="w-full h-full object-cover grayscale-[80%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                                <div className="absolute top-4 left-4 md:top-8 md:left-8">
                                                    <span className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-[8px] font-mono text-white tracking-widest uppercase shadow-2xl">
                                                        {project.category}
                                                    </span>
                                                </div>

                                                <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                                                        <ArrowUpRight className="w-6 h-6 md:w-8 md:h-8" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 md:p-12">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                                    <h3 className="text-3xl md:text-5xl font-black tracking-tighter text-white group-hover:text-emerald-400 transition-colors uppercase italic">
                                                        {project.title}
                                                    </h3>
                                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-white/5 self-start">
                                                        <div className={cn(
                                                            "w-1.5 h-1.5 rounded-full",
                                                            ['Operational', 'Live', 'Production', 'Team Backend Engineer'].includes(project.status) ? "bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-600"
                                                        )} />
                                                        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{project.status}</span>
                                                    </div>
                                                </div>

                                                <p className="text-zinc-500 text-sm md:text-lg leading-relaxed mb-10 line-clamp-3 font-medium">
                                                    {project.description}
                                                </p>

                                                <div className="flex flex-wrap gap-4 pt-8 border-t border-white/5">
                                                    {project.tags.map(tag => (
                                                        <span key={tag} className="text-[9px] font-mono text-zinc-700 uppercase tracking-[0.2em] group-hover:text-zinc-400 transition-colors">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </SpotlightBox>
                                    </Tilt>
                                </Link>
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
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-emerald-500/20 transition-colors duration-700" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full -ml-32 -mb-32 group-hover:bg-blue-500/20 transition-colors duration-700" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-mono uppercase tracking-widest text-zinc-400 mb-8">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Available For Freelance Web Development
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6">
                            Initiate a <span className="text-zinc-500">New_Build_</span>
                        </h2>
                        <p className="text-zinc-500 mb-12 max-w-xl mx-auto leading-relaxed text-lg">
                            Accepting premium commissions for enterprise infrastructure,
                            advanced AI systems, and high-performance Web apps.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Magnetic>
                                <Link href="/hireme" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-white text-black px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 hover:shadow-[0_0_50px_rgba(255,255,255,0.2)] transition-all">
                                    Initiate Hire <ArrowRight className="w-4 h-4" />
                                </Link>
                            </Magnetic>
                            <Magnetic>
                                <Link href="/contact" className="w-full sm:w-auto inline-flex items-center justify-center gap-3 border border-white/10 hover:bg-white/5 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all backdrop-blur-sm">
                                    Consultation <ChevronRight className="w-4 h-4" />
                                </Link>
                            </Magnetic>
                        </div>
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
