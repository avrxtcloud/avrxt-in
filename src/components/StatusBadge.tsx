'use client';

import React from 'react';
import { ShieldCheck, Activity, ExternalLink } from 'lucide-react';

export default function StatusBadge() {
    return (
        <div className="flex items-center justify-center p-1">
            <a
                href="https://status.avrxt.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 px-5 py-2.5 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl transition-all duration-500 hover:border-emerald-500/40 hover:bg-zinc-900/60 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] overflow-hidden"
            >
                {/* Animated Glow Backlight */}
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700" />

                {/* Dynamic Status Indicator */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute h-4 w-4 bg-emerald-500/20 rounded-full animate-ping" />
                    <div className="absolute h-3 w-3 bg-emerald-500/40 rounded-full group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative h-2.5 w-2.5 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.9)] border border-emerald-400/50" />
                </div>

                <div className="flex flex-col gap-0.5 relative z-10">
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold font-mono tracking-[0.15em] text-emerald-400 uppercase">
                            Systems Operational
                        </span>
                        <ShieldCheck className="w-3 h-3 text-emerald-400/70 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-zinc-500 tracking-[0.25em] uppercase transition-colors group-hover:text-zinc-400">
                            Betterstack Status
                        </span>
                        <div className="h-[1px] w-6 bg-zinc-800 group-hover:w-10 group-hover:bg-emerald-500/40 transition-all duration-700" />
                        <Activity className="w-2.5 h-2.5 text-zinc-700 group-hover:text-emerald-500/60 transition-colors animate-pulse" />
                    </div>
                </div>

                {/* Shine Sweep Effect */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-20" />

                {/* External Link Icon (shows on hover) */}
                <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ExternalLink className="w-2 h-2 text-zinc-600" />
                </div>
            </a>
        </div>
    );
}
