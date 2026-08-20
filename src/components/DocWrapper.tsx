'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DocWrapperProps {
    children: React.ReactNode;
    title: string;
    category: string;
    date: string;
}

export default function DocWrapper({ children, title, category, date }: DocWrapperProps) {
    return (
        <div className="bg-[#000000] text-[#f8f8f8] min-h-screen font-sans selection:bg-white/10 selection:text-white">
            <header className="sticky top-0 z-50 bg-[#000000]/90 backdrop-blur-sm border-b border-[#333]">
                <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="text-2xl font-bold tracking-widest uppercase font-mono">
                        <img src="https://cdn.avxt.qzz.io/assets/logo.png" alt="avrxt logo" className="h-8 w-auto" />
                    </Link>
                    <Link href="/docs" className="text-sm border border-[#f8f8f8] px-3 py-1 hover:bg-[#f8f8f8] hover:text-[#000000] transition-all duration-300 font-mono">
                        /back_to_library
                    </Link>
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-16">
                <section className="animate-fade-in">
                    <p className="text-sm text-[#666666] mb-2 tracking-widest font-mono">{"// "}{category}</p>
                    <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 font-mono text-cyan-400">
                        {title}
                    </h1>
                    <p className="text-xs text-[#666666] font-mono">📅 {date}</p>
                </section>

                <hr className="border-[#333] my-12" />

                <article className="prose prose-invert max-w-none">
                    {children}
                </article>

                <hr className="border-[#333] my-12" />

                <p className="text-xl text-[#f8f8f8] font-bold font-mono text-center py-4">
                    Best regards @avrxt
                </p>

                <footer className="mt-8 py-8 border-t border-[#333] text-center text-gray-400">
                    <p className="font-mono text-sm">&copy; 2025 avrxt. All rights reserved.</p>
                </footer>
            </main>
        </div>
    );
}
