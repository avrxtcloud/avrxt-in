'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotFound() {
    const [requestId, setRequestId] = useState('');
    const [path, setPath] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setPath(window.location.pathname);
            const chars = '0123456789ABCDEF';
            let id = '';
            for (let i = 0; i < 12; i++) {
                if (i > 0 && i % 4 === 0) id += ':';
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            setRequestId(id);
        }
    }, []);

    return (
        <main className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center overflow-hidden font-mono text-[#666] selection:bg-white selection:text-black relative">
            <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_50%,#111_0%,#000_80%)]"></div>
            <div className="absolute inset-0 z-0 w-full h-0.5 bg-white/5 animate-scan top-0"></div>

            <div className="max-w-md w-full bg-zinc-950/60 backdrop-blur-xl border border-white/5 shadow-2xl p-8 md:p-12 relative z-10 mb-12 rounded-2xl">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                    <Link href="/">
                        <img src="https://cdn.avrxt.in/assets/logo.png" alt="avrxt logo" className="h-6 opacity-40 hover:opacity-100 transition-opacity" />
                    </Link>
                </div>

                <h1 className="text-7xl font-black mb-1 text-white tracking-tighter italic">404</h1>
                <p className="text-[9px] uppercase tracking-[0.5em] mb-12 text-zinc-500">Signal_Lost: node_not_found<span className="animate-blink">_</span></p>

                <div className="text-left bg-black/60 p-5 rounded-lg border border-white/5 mb-10 text-[10px] space-y-3">
                    <div className="flex justify-between border-b border-white/5 pb-2 mb-2">
                        <span className="text-zinc-600 uppercase tracking-widest">Diagnostic_Log</span>
                        <span className="text-emerald-500/50 uppercase">Secure_Link</span>
                    </div>
                    <p><span className="text-zinc-500 uppercase">Path:</span> <span className="text-zinc-300">{path.length > 25 ? path.substring(0, 25) + '...' : path}</span></p>
                    <p><span className="text-zinc-500 uppercase">Trace:</span> <span className="text-cyan-500 font-bold">{requestId}</span></p>
                    <p><span className="text-zinc-500 uppercase">Status:</span> <span className="text-red-500/80 italic">Routing_Error_Detected</span></p>
                </div>

                <div className="space-y-4">
                    <Link href="/" className="block w-full py-4 text-[11px] text-white uppercase font-bold tracking-[0.3em] rounded-xl border border-white/10 hover:bg-white hover:text-black transition-all">
                        Reconnect_To_Core
                    </Link>

                    <Link href="/contact" className="block w-full py-2 text-[10px] text-zinc-600 uppercase font-bold hover:text-cyan-400 transition-all tracking-[0.2em]">
                        [ Request_Support ]
                    </Link>
                </div>
            </div>

            <div className="text-center opacity-40 relative z-10">
                <p className="text-[8px] tracking-[0.6em] uppercase text-zinc-500 mb-2">Environment_Protected_v3.1</p>
                <div className="flex items-center justify-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-cyan-500 animate-pulse"></span>
                    <p className="text-[10px] font-bold text-zinc-300 tracking-[0.2em] uppercase">secure.avrxt.in</p>
                </div>
            </div>

            <style jsx global>{`
        @keyframes scan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1.2s step-end infinite;
        }
      `}</style>
        </main>
    );
}
