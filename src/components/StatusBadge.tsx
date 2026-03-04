'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, ExternalLink, AlertTriangle, AlertCircle } from 'lucide-react';
import { getBetterstackStatus } from '@/app/actions/status';

type StatusState = {
    status: 'operational' | 'down' | 'maintenance' | 'unknown';
    label: string;
};

export default function StatusBadge() {
    const [data, setData] = useState<StatusState>({
        status: 'operational',
        label: 'Systems Operational'
    });

    useEffect(() => {
        async function fetchStatus() {
            const res = await getBetterstackStatus();
            setData(res as StatusState);
        }
        fetchStatus();
        // Refresh every 5 minutes
        const interval = setInterval(fetchStatus, 300000);
        return () => clearInterval(interval);
    }, []);

    const getStatusConfig = () => {
        switch (data.status) {
            case 'down':
                return {
                    color: 'text-red-400',
                    bg: 'bg-red-500/20',
                    dot: 'bg-red-500',
                    shadow: 'shadow-[0_0_12px_rgba(239,68,68,0.9)]',
                    border: 'border-red-400/50',
                    icon: AlertCircle,
                    glow: 'via-red-500/10'
                };
            case 'maintenance':
                return {
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/20',
                    dot: 'bg-yellow-500',
                    shadow: 'shadow-[0_0_12px_rgba(234,179,8,0.9)]',
                    border: 'border-yellow-400/50',
                    icon: AlertTriangle,
                    glow: 'via-yellow-500/10'
                };
            default:
                return {
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/20',
                    dot: 'bg-emerald-500',
                    shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.9)]',
                    border: 'border-emerald-400/50',
                    icon: ShieldCheck,
                    glow: 'via-emerald-500/10'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-center p-1">
            <a
                href="https://status.avrxt.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-4 px-5 py-2.5 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl transition-all duration-500 hover:border-emerald-500/40 hover:bg-zinc-900/60 hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)] overflow-hidden"
            >
                {/* Animated Glow Backlight */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-transparent ${config.glow} to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700`} />

                {/* Dynamic Status Indicator */}
                <div className="relative flex items-center justify-center">
                    <div className={`absolute h-4 w-4 ${config.bg} rounded-full animate-ping`} />
                    <div className={`absolute h-3 w-3 ${config.bg} rounded-full group-hover:scale-150 transition-transform duration-700`} />
                    <div className={`relative h-2.5 w-2.5 ${config.dot} rounded-full ${config.shadow} border ${config.border}`} />
                </div>

                <div className="flex flex-col gap-0.5 relative z-10">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold font-mono tracking-[0.15em] ${config.color} uppercase`}>
                            {data.label}
                        </span>
                        <Icon className={`w-3 h-3 ${config.color} opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500`} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono text-zinc-500 tracking-[0.25em] uppercase transition-colors group-hover:text-zinc-400">
                            Infrastructure Node
                        </span>
                        <div className="h-[1px] w-6 bg-zinc-800 group-hover:w-10 group-hover:bg-white/10 transition-all duration-700" />
                        <Activity className="w-2.5 h-2.5 text-zinc-700 group-hover:text-zinc-500 transition-colors animate-pulse" />
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
