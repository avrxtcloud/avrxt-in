import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { getDocBySlug } from '@/app/actions/docs';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';
import DocContent from './DocContent';

export const revalidate = 60;

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
        keywords: ['docs', 'avrxt', doc.category, doc.slug, doc.title, ...(doc.tags || [])],
        noIndex: !doc.published,
        path: `/docs/${slug}`,
    });
}

const colorMap: Record<string, string> = {
    blue: 'text-blue-400 border-blue-500/30 bg-blue-900/10',
    cyan: 'text-cyan-400 border-cyan-500/30 bg-cyan-900/10',
    purple: 'text-purple-400 border-purple-500/30 bg-purple-900/10',
    green: 'text-green-400 border-green-500/30 bg-green-900/10',
    orange: 'text-orange-400 border-orange-500/30 bg-orange-900/10',
    pink: 'text-pink-400 border-pink-500/30 bg-pink-900/10',
};

export default async function DocPage({ params }: Props) {
    const { slug } = await params;
    const doc = await getDocBySlug(slug);
    if (!doc) notFound();

    return (
        <div className="bg-[#050505] min-h-screen text-gray-300 selection:bg-white/10 selection:text-white">
            {/* Ambient background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[40%] bg-blue-500/3 blur-[140px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[40%] bg-purple-500/3 blur-[140px] rounded-full" />
            </div>

            <main className="max-w-3xl mx-auto px-5 sm:px-6 py-16 sm:py-24 relative z-10">
                {/* Back button */}
                <Link href="/docs"
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-mono mb-12 group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Docs
                </Link>

                <article>
                    {/* Doc header */}
                    <header className="mb-12 pb-10 border-b border-white/5">
                        <div className="flex flex-wrap items-center gap-2 mb-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colorMap[doc.color] || colorMap.blue}`}>
                                {doc.category}
                            </span>
                            {doc.published
                                ? <span className="text-[10px] text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase tracking-tighter bg-emerald-900/10">Published</span>
                                : <span className="text-[10px] text-yellow-500 border border-yellow-500/30 px-2 py-0.5 rounded-full uppercase tracking-tighter bg-yellow-900/10">Draft</span>
                            }
                        </div>

                        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 leading-tight tracking-tight">
                            {doc.title}
                        </h1>

                        {doc.description && (
                            <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed mb-8 font-light">
                                {doc.description}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-zinc-500 font-mono uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <User size={13} />
                                <span>{doc.author || 'avrxt'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={13} />
                                <span>{doc.date || doc.lastModified}</span>
                            </div>
                            {doc.tags && doc.tags.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Tag size={13} />
                                    <span>{doc.tags.join(', ')}</span>
                                </div>
                            )}
                        </div>
                    </header>

                    {/* Rendered Markdown */}
                    <DocContent content={doc.content} />
                </article>

                {/* Footer nav */}
                <div className="mt-16 pt-8 border-t border-white/5 flex justify-between items-center">
                    <Link href="/docs"
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm font-mono group">
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        All Docs
                    </Link>
                    <span className="text-[10px] text-zinc-700 font-mono uppercase tracking-widest">avrxt.dev/docs</span>
                </div>
            </main>
        </div>
    );
}
