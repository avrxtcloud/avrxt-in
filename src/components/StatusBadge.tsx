'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, ExternalLink, AlertTriangle, AlertCircle } from 'lucide-react';

type StatusState = {
    status: 'operational' | 'down' | 'maintenance' | 'unknown' | 'degraded';
    label: string;
};

export default function StatusBadge() {
    const [data, setData] = useState<StatusState>({
        status: 'operational',
        label: 'Systems Operational'
    });

    useEffect(() => {
        let mounted = true;
        let lastFetchAt = 0;

        const fetchStatus = async () => {
            try {
                const response = await fetch('/api/status', {
                    method: 'GET',
                    cache: 'no-store'
                });

                if (!response.ok) {
                    return;
                }

                const result = await response.json();
                if (mounted) {
                    setData(result as StatusState);
                }
            } catch {
                // Keep previous status on transient network issues.
            }
        };

        const fetchStatusThrottled = () => {
            const now = Date.now();
            if (lastFetchAt && now - lastFetchAt < 60000) return;
            lastFetchAt = now;
            fetchStatus();
        };

        fetchStatusThrottled();

        const interval = setInterval(fetchStatusThrottled, 60000);
        const refreshOnFocus = () => {
            if (document.visibilityState === 'visible') {
                fetchStatusThrottled();
            }
        };

        document.addEventListener('visibilitychange', refreshOnFocus);
        window.addEventListener('focus', fetchStatusThrottled);

        return () => {
            mounted = false;
            clearInterval(interval);
            document.removeEventListener('visibilitychange', refreshOnFocus);
            window.removeEventListener('focus', fetchStatusThrottled);
        };
    }, []);

    const getStatusConfig = () => {
        switch (data.status) {
            case 'down':
                return {
                    color: 'text-red-400',
                    bg: 'bg-red-500/20',
                    dot: 'bg-red-500',
                    shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.7)]',
                    border: 'border-red-400/30',
                    icon: AlertCircle,
                    glow: 'via-red-500/5'
                };
            case 'maintenance':
                return {
                    color: 'text-yellow-400',
                    bg: 'bg-yellow-500/20',
                    dot: 'bg-yellow-500',
                    shadow: 'shadow-[0_0_10px_rgba(234,179,8,0.7)]',
                    border: 'border-yellow-400/30',
                    icon: AlertTriangle,
                    glow: 'via-yellow-500/5'
                };
            case 'degraded':
                return {
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/20',
                    dot: 'bg-amber-500',
                    shadow: 'shadow-[0_0_10px_rgba(245,158,11,0.7)]',
                    border: 'border-amber-400/30',
                    icon: AlertTriangle,
                    glow: 'via-amber-500/5'
                };
            default:
                return {
                    color: 'text-emerald-400/90',
                    bg: 'bg-emerald-500/10',
                    dot: 'bg-emerald-500',
                    shadow: 'shadow-[0_0_10px_rgba(16,185,129,0.7)]',
                    border: 'border-emerald-400/20',
                    icon: ShieldCheck,
                    glow: 'via-emerald-500/5'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className="flex items-center justify-center p-0.5">
            <a
                href="https://status.avrxt.in"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-3 px-4 py-1.5 bg-zinc-900/20 backdrop-blur-md border border-white/5 rounded-xl transition-all duration-500 hover:border-white/10 hover:bg-zinc-900/40 hover:shadow-[0_0_30px_-10px_rgba(255,255,255,0.05)] overflow-hidden scale-[0.92]"
            >
                {/* Animated Glow Backlight */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-transparent ${config.glow} to-transparent opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700`} />

                {/* Dynamic Status Indicator */}
                <div className="relative flex items-center justify-center">
                    <div className={`absolute h-3 w-3 ${config.bg} rounded-full animate-ping opacity-60`} />
                    <div className={`absolute h-2 w-2 ${config.bg} rounded-full group-hover:scale-150 transition-transform duration-700`} />
                    <div className={`relative h-2 w-2 ${config.dot} rounded-full ${config.shadow} border ${config.border}`} />
                </div>

                <div className="flex flex-col gap-0 relative z-10">
                    <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold font-mono tracking-[0.12em] ${config.color} uppercase`}>
                            {data.label}
                        </span>
                        <Icon className={`w-2.5 h-2.5 ${config.color} opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[7px] font-mono text-zinc-600 tracking-[0.2em] uppercase transition-colors group-hover:text-zinc-500">
                            Infrastructure
                        </span>
                        <div className="h-[1px] w-4 bg-zinc-800/50 group-hover:w-6 group-hover:bg-white/5 transition-all duration-700" />
                        <Activity className="w-2 h-2 text-zinc-800 group-hover:text-zinc-600 transition-colors animate-pulse" />
                    </div>
                </div>

                {/* Shine Sweep Effect */}
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-20" />

                {/* External Link Icon (shows on hover) */}
                <div className="absolute top-1 right-1.5 opacity-0 group-hover:opacity-40 transition-opacity duration-500">
                    <ExternalLink className="w-1.5 h-1.5 text-zinc-600" />
                </div>
            </a>
        </div>
    );
}
