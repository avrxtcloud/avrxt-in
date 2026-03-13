import Link from 'next/link';
import { BookOpen, Settings } from 'lucide-react';
import { getPublishedDocs } from '@/app/actions/docs';
import { Metadata } from 'next';
import DocsClient from './DocsClient';
import Reveal from '@/components/Reveal';

export const metadata: Metadata = {
    title: 'Technical Library & Documentation | avrxt',
    description: 'Explore in-depth technical guides, architectural deep dives, and performance optimization tutorials by avrxt.',
    keywords: ['technical documentation', 'coding tutorials', 'system architecture', 'software engineering guides', 'avrxt library'],
};

export const revalidate = 60;

export default async function Docs() {
    const articles = await getPublishedDocs();

    return (
        <div className="bg-[#050505] min-h-screen text-gray-300 font-sans selection:bg-white/10 selection:text-white pt-20 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[70%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
            </div>

            <header className="sticky top-16 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center">
                <nav className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-bold tracking-[0.3em] font-mono text-white">LIBRARY_NODE_01</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/docs/admin" className="text-[10px] border border-white/10 px-4 py-1.5 rounded-full hover:bg-white hover:text-black transition-all duration-500 font-mono uppercase tracking-tighter flex items-center gap-2">
                            <Settings size={12} /> /admin
                        </Link>
                        <Link href="/" className="text-[10px] border border-white/10 px-4 py-1.5 rounded-full hover:bg-white/10 transition-all duration-500 font-mono uppercase tracking-tighter">
                            /exit
                        </Link>
                    </div>
                </nav>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-24 relative z-10">
                <section className="mb-24">
                    <Reveal direction="down" delay={0.1}>
                        <p className="text-[10px] text-emerald-400 mb-6 tracking-[0.5em] font-mono uppercase">// System_Documentation_Uplink</p>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.8] text-white">
                            The Archives.
                        </h1>
                        <p className="text-lg md:text-xl text-zinc-400 max-w-3xl leading-relaxed border-l border-white/10 pl-6 italic">
                            A curated selection of technical intelligence, architectural patterns, and performance protocols for the modern decentralized web.
                        </p>
                        <div className="mt-12 flex items-center gap-4 text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">
                            <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                {articles.length} CORE_ARTICLES
                            </div>
                            <span className="opacity-20">|</span>
                            <span>NODE_VER: 5.2.0</span>
                        </div>
                    </Reveal>
                </section>

                <hr className="border-white/5 mb-24" />

                <section>
                    <Reveal className="mb-12" direction="up" delay={0.2}>
                        <h2 className="text-xl font-bold text-white mb-2 font-mono flex items-center gap-3 uppercase tracking-widest">
                            <BookOpen className="text-emerald-500 w-5 h-5" /> Knowledge_Base
                        </h2>
                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest ml-8">Proprietary protocols and engineering notes</p>
                    </Reveal>

                    <DocsClient articles={articles} />
                </section>
            </main>
        </div>
    );
}
