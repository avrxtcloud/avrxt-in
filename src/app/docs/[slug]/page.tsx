import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, User } from 'lucide-react';
import { getDocBySlug } from '@/app/actions/docs';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';

// Revalidate every 60 seconds ensuring fresh content
export const revalidate = 60;

// Correct type for Next.js App Router dynamic pages
type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const doc = await getDocBySlug(slug);

    if (!doc) {
        return buildPageMetadata({
            title: 'Docs',
            description: 'Browse engineering docs, playbooks, and technical resources authored by avrxt.',
            noIndex: true,
            path: '/docs',
        });
    }

    return buildPageMetadata({
        title: doc.title,
        description: doc.description || 'Technical documentation by avrxt.',
        keywords: ['docs', 'avrxt', doc.category, doc.slug, doc.title],
        noIndex: !doc.published,
        path: `/docs/${slug}`,
    });
}

export default async function DocPage({ params }: Props) {
    const { slug } = await params;
    const doc = await getDocBySlug(slug);

    if (!doc) {
        notFound();
    }

    return (
        <div className="bg-[#050505] min-h-screen text-gray-300 font-sans selection:bg-white/10 selection:text-white pt-20">
            <header className="fixed top-0 left-0 right-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-[#333]/50 h-16 flex items-center">
                <nav className="max-w-4xl mx-auto px-6 w-full flex items-center gap-4">
                    <Link href="/docs" className="text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <span className="text-sm font-mono text-zinc-500">/ {doc.category.toLowerCase()} / {doc.slug}</span>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
                <article>
                    <header className="mb-10 border-b border-[#333]/50 pb-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border bg-opacity-10 ${doc.color === 'blue' ? 'text-blue-400 border-blue-500/30 bg-blue-500' :
                                    doc.color === 'cyan' ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500' :
                                        doc.color === 'purple' ? 'text-purple-400 border-purple-500/30 bg-purple-500' :
                                            doc.color === 'green' ? 'text-green-400 border-green-500/30 bg-green-500' :
                                                doc.color === 'orange' ? 'text-orange-400 border-orange-500/30 bg-orange-500' :
                                                    'text-pink-400 border-pink-500/30 bg-pink-500'
                                }`}>
                                {doc.category}
                            </span>
                            {doc.published ? (
                                <span className="text-[10px] text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-tighter">Published</span>
                            ) : (
                                <span className="text-[10px] text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full uppercase tracking-tighter">Draft</span>
                            )}
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
                            {doc.title}
                        </h1>

                        <p className="text-xl text-zinc-400 leading-relaxed mb-8 font-light">
                            {doc.description}
                        </p>

                        <div className="flex items-center gap-6 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <User size={14} />
                                <span>{doc.author || 'avrxt'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={14} />
                                <span>{doc.date}</span>
                            </div>
                        </div>
                    </header>

                    <div className="prose prose-invert prose-zinc max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-code:text-pink-300 prose-code:bg-white/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/10">
                        {/* Simple rendering for now. In a real app, use react-markdown */}
                        <div className="whitespace-pre-wrap font-sans text-gray-300 leading-7">
                            {doc.content}
                        </div>
                    </div>
                </article>
            </main>
        </div>
    );
}
