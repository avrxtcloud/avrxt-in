'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Gallery() {
    const [selectedImg, setSelectedImg] = useState<string | null>(null);

    const images = [
        { id: '001', name: 'Thanjavur', src: 'https://cdn.avxt.qzz.io/images/aviorxt_01.jpg', description: 'When art, architecture, and divinity meet' },
        { id: '003', name: "The Wing's Edge", src: 'https://cdn.avxt.qzz.io/images/aviorxt_03.jpg' },
        { id: '005', name: '@Blue', src: 'https://cdn.avxt.qzz.io/images/aviorxt_05.jpg' },
        { id: '006', name: 'Artifact', src: 'https://cdn.avxt.qzz.io/images/aviorxt_06.jpg' },
    ];

    useEffect(() => {
        // Anti-save security protocols from original site
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && (e.key === 's' || e.key === 'u' || e.key === 'p')) e.preventDefault();
            if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <main className={cn(
            "min-h-screen bg-black text-white relative flex flex-col items-center",
            "font-outfit antialiased select-none"
        )}>
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-soft-light"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000_75%)]"></div>
            </div>

            {/* Lightbox */}
            {selectedImg && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-3xl transition-opacity duration-500 animate-in fade-in"
                    onClick={() => setSelectedImg(null)}
                >
                    <button className="absolute top-10 right-10 z-[120] text-zinc-500 hover:text-white transition-all">
                        <X className="w-8 h-8" />
                    </button>
                    <img
                        src={selectedImg}
                        alt="Vault View"
                        className="max-w-[90%] max-h-[80vh] rounded-sm transform transition-all duration-700 animate-in slide-in-from-bottom-5"
                    />
                </div>
            )}

            {/* Header */}
            <header className="relative z-30 w-full max-w-6xl mx-auto px-8 pt-12 flex justify-between items-center animate-fade-in">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center transition-all group-hover:bg-white/10">
                        <ArrowLeft className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-500">System.Exit</span>
                </Link>
                <div className="flex flex-col items-end">
                    <span className="font-mono text-[10px] text-zinc-600 uppercase">Status</span>
                    <span className="text-[10px] text-emerald-500 font-mono animate-pulse tracking-widest">ENCRYPTED_NODE</span>
                </div>
            </header>

            {/* Content */}
            <section className="relative z-20 w-full max-w-6xl mx-auto px-8 pt-20 pb-32">
                <div className="mb-20 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-[0.3em]"># Visual_Archive_2025</span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase mb-6 italic" style={{ fontWeight: 900 }}>Vault</h1>
                    <p className="text-lg text-zinc-400 max-w-xl leading-relaxed font-light">
                        Secured artifacts from the digital frontier. Previews optimized for high-resolution displays.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {images.map((img, i) => (
                        <div
                            key={img.id}
                            className="gallery-card group cursor-pointer rounded-xl overflow-hidden animate-fade-in"
                            style={{ animationDelay: `${0.4 + (i * 0.1)}s` }}
                            onClick={() => setSelectedImg(img.src)}
                        >
                            <div className="aspect-[16/10] overflow-hidden">
                                <img
                                    src={img.src}
                                    alt={img.name}
                                    className="w-full h-full object-cover transition-all duration-700 saturate-0 contrast-[1.2] group-hover:scale-105 group-hover:saturate-100 group-hover:contrast-100"
                                    onContextMenu={(e) => e.preventDefault()}
                                />
                            </div>
                            <div className="p-8 border-t border-white/5">
                                <div>
                                    <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest mb-2">Ref. {img.id}</p>
                                    <h3 className="text-2xl font-bold tracking-tight uppercase text-white">{img.name}</h3>
                                    {img.description && (
                                        <p className="font-accent text-xl text-zinc-400 mt-2 italic">{img.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="mt-40 pt-12 text-center border-t border-white/5">
                    <p className="text-[10px] text-zinc-700 font-mono uppercase tracking-[0.5em]">&copy; 2025 // AVRXT.DEV // SILO_SECURED</p>
                </footer>
            </section>

            <style jsx>{`
        .font-outfit { font-family: 'Outfit', sans-serif; }
        .font-accent { font-family: 'Instrument Serif', serif; }
      `}</style>
        </main>
    );
}
