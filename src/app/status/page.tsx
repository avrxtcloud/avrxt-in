'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    Activity,
    ShieldCheck,
    AlertCircle,
    Clock,
    ChevronRight,
    Monitor,
    Database,
    Globe,
    Zap,
    Hammer
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { getStatusOverview } from '@/app/actions/status';
import { cn } from '@/lib/utils';

export default function StatusPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getStatusOverview();
                setData(res);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const getGlobalStatusColor = () => {
        if (loading) return 'text-zinc-500';
        switch (data?.status) {
            case 'operational': return 'text-emerald-500';
            case 'down': return 'text-red-500';
            case 'degraded': return 'text-yellow-500';
            case 'maintenance': return 'text-blue-500';
            default: return 'text-zinc-500';
        }
    };

    const StatusIcon = () => {
        if (loading) return <Activity className="w-12 h-12 text-zinc-800 animate-pulse" />;
        switch (data?.status) {
            case 'operational': return <ShieldCheck className="w-12 h-12 text-emerald-500" />;
            case 'down': return <AlertCircle className="w-12 h-12 text-red-500" />;
            case 'maintenance': return <Hammer className="w-12 h-12 text-blue-500" />;
            default: return <Activity className="w-12 h-12 text-yellow-500" />;
        }
    };

    return (
        <main className="max-w-6xl mx-auto px-6 py-24">
            {/* Hero Status Header */}
            <Reveal className="text-center mb-24 pt-12">
                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-white/[0.02] border border-white/5 backdrop-blur-xl mb-8 relative">
                    <div className={cn(
                        "absolute inset-0 blur-3xl opacity-20",
                        getGlobalStatusColor().replace('text-', 'bg-')
                    )} />
                    <StatusIcon />
                </div>
                <h1 className={cn(
                    "text-5xl md:text-7xl font-black tracking-tighter mb-4",
                    getGlobalStatusColor()
                )}>
                    {loading ? 'Initializing_Sync...' : data?.status === 'operational' ? 'All Systems Operational' : 'Infrastructure Distress'}
                </h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">
                    {loading ? 'Fetching telemetry from global nodes...' : `Global Uptime Sequence Active • Last Check: ${new Date(data?.lastUpdated).toLocaleTimeString()}`}
                </p>
            </Reveal>

            {/* Service Nodes Grid */}
            <Reveal className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-24">
                {loading ? (
                    [1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-32 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                    ))
                ) : (
                    data?.components?.map((component: any) => (
                        <div key={component.id} className="resend-card p-6 rounded-2xl group transition-all hover:border-white/20">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-400 group-hover:text-white transition-colors">
                                    {component.name.toLowerCase().includes('api') ? <Zap size={18} /> :
                                        component.name.toLowerCase().includes('cdn') ? <Globe size={18} /> :
                                            component.name.toLowerCase().includes('database') ? <Database size={18} /> :
                                                <Monitor size={18} />}
                                </div>
                                <div className={cn(
                                    "flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase",
                                    component.status === 0 ? "text-emerald-500" : component.status === 4 ? "text-blue-500" : "text-red-500"
                                )}>
                                    <span className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        component.status === 0 ? "bg-emerald-500" : component.status === 4 ? "bg-blue-500" : "bg-red-500"
                                    )} />
                                    {component.status === 0 ? 'Operational' : component.status === 4 ? 'Maintenance' : 'Disturbed'}
                                </div>
                            </div>
                            <h3 className="text-lg font-bold tracking-tight text-white mb-1 uppercase font-mono">{component.name}</h3>
                            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mt-4">
                                <div className={cn(
                                    "h-full transition-all duration-1000",
                                    component.status === 0 ? "bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)] w-full" :
                                        component.status === 4 ? "bg-blue-500/50 w-full" : "bg-red-500/50 w-1/2"
                                )} />
                            </div>
                        </div>
                    ))
                )}
            </Reveal>

            {/* Quick Links Section */}
            <Reveal className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-24">
                <Link href="/status/incidents" className="resend-card p-8 rounded-2xl group flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-zinc-500 group-hover:text-red-500/70 transition-colors">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Incident History</h3>
                            <p className="text-zinc-500 text-sm mt-1">Review historical post-mortems and resolutions.</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </Link>

                <Link href="/status/maintenance" className="resend-card p-8 rounded-2xl group flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-zinc-500 group-hover:text-blue-500/70 transition-colors">
                            <Hammer className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-white uppercase font-mono">Maintenance Schedule</h3>
                            <p className="text-zinc-500 text-sm mt-1">Upcoming windows for infrastructure upgrades.</p>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </Link>
            </Reveal>

            {/* Infrastructure Schematic Visualization (Visual Only) */}
            <Reveal className="p-12 rounded-3xl bg-white/[0.01] border border-white/5 backdrop-blur-3xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.05)_0%,transparent_50%)]" />
                <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.4em] mb-12 relative z-10">Protocol_Visualizer_Node</p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 relative z-10">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-white/10 bg-black flex items-center justify-center text-zinc-500">
                            <Globe size={20} />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Global Edge</span>
                    </div>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                            <ShieldCheck size={28} />
                        </div>
                        <span className="text-[10px] font-bold font-mono text-emerald-500 uppercase tracking-[0.2em]">Core Mesh</span>
                    </div>
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-white/10 bg-black flex items-center justify-center text-zinc-500">
                            <Database size={20} />
                        </div>
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Data Plane</span>
                    </div>
                </div>

                <div className="mt-16 text-zinc-800 font-mono text-[8px] uppercase tracking-[0.5em]">
                    End-to-End Encryption Sequence Verified
                </div>
            </Reveal>
        </main>
    );
}
