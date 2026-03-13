'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Reveal from '@/components/Reveal';
import Tilt from '@/components/Tilt';
import Magnetic from '@/components/Magnetic';
import { DocArticle } from '@/lib/docs-config';

interface DocsClientProps {
    articles: DocArticle[];
}

export default function DocsClient({ articles }: DocsClientProps) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.length > 0 ? (
                articles.map((article, idx) => (
                    <Reveal key={article.slug} delay={idx * 0.1} direction="up" className="h-full">
                        <Tilt intensity={5} className="h-full">
                            <Link
                                href={`/docs/${article.slug}`}
                                className={cn(
                                    "interactive-panel bg-white/[0.02] border border-[#333] rounded-2xl transition-all duration-400 hover:shadow-2xl h-full group block relative overflow-hidden",
                                    article.color === 'blue' && "hover:border-blue-500/50",
                                    article.color === 'cyan' && "hover:border-cyan-500/50",
                                    article.color === 'purple' && "hover:border-purple-500/50",
                                    article.color === 'green' && "hover:border-green-500/50",
                                    article.color === 'orange' && "hover:border-orange-500/50",
                                    article.color === 'pink' && "hover:border-pink-500/50"
                                )}
                            >
                                <div className="p-8 h-full flex flex-col justify-between relative z-10">
                                    <div>
                                        <span className={cn(
                                            "text-[10px] font-mono border px-3 py-1 rounded-full mb-6 inline-block uppercase tracking-widest",
                                            article.color === 'blue' && "text-blue-400 border-blue-500/30 bg-blue-900/10",
                                            article.color === 'cyan' && "text-cyan-400 border-cyan-500/30 bg-cyan-900/10",
                                            article.color === 'purple' && "text-purple-400 border-purple-500/30 bg-purple-900/10",
                                            article.color === 'green' && "text-green-400 border-green-500/30 bg-green-900/10",
                                            article.color === 'orange' && "text-orange-400 border-orange-500/30 bg-orange-900/10",
                                            article.color === 'pink' && "text-pink-400 border-pink-500/30 bg-pink-900/10"
                                        )}>
                                            {article.category}
                                        </span>
                                        <h3 className="text-2xl font-bold text-white mb-4 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-500 transition-all duration-500">
                                            {article.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-8">
                                            {article.description}
                                        </p>
                                    </div>
                                    <div className="flex justify-between items-center pt-6 border-t border-white/5">
                                        <span className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">
                                            {article.date}
                                        </span>
                                        <Magnetic>
                                            <div className="flex items-center gap-2 group-hover:text-white group-hover:translate-x-1 transition-all">
                                                <span className="text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">Read_More</span>
                                                <ArrowRight className="w-4 h-4 text-gray-500" />
                                            </div>
                                        </Magnetic>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                        </Tilt>
                    </Reveal>
                ))
            ) : (
                <div className="col-span-full text-center py-24 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest shrink-0">No_Archives_Found</p>
                    <p className="text-zinc-700 text-[10px] mt-4 uppercase tracking-tighter italic">Connect to core to fetch documents</p>
                </div>
            )}
        </div>
    );
}
