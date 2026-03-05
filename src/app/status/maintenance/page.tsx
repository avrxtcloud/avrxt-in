'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Hammer,
    Calendar,
    Clock,
    Info,
    ArrowRight,
    Monitor
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { getMaintenanceSchedule } from '@/app/actions/status';
import { cn } from '@/lib/utils';

export default function MaintenancePage() {
    const [maintenance, setMaintenance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getMaintenanceSchedule();
                setMaintenance(res.maintenance || []);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return (
        <main className="max-w-4xl mx-auto px-6 py-24 min-h-screen">
            <Reveal className="mb-12">
                <Link href="/status" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em]">Return to Core</span>
                </Link>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">MAINTENANCE_SEQUENCE</h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">Scheduled infrastructure upgrades and synchronization windows.</p>
            </Reveal>

            <div className="space-y-6">
                {loading ? (
                    [1, 2].map(i => (
                        <div key={i} className="h-40 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                    ))
                ) : maintenance.length === 0 ? (
                    <Reveal className="p-12 text-center rounded-2xl border border-white/5 bg-white/[0.01]">
                        <Monitor className="w-12 h-12 text-blue-500/50 mx-auto mb-4" />
                        <h3 className="text-white font-bold opacity-80 uppercase tracking-widest font-mono">No Scheduled Downtime</h3>
                        <p className="text-zinc-600 text-xs font-mono uppercase mt-2">All nodes are running on the latest stable firmware.</p>
                    </Reveal>
                ) : (
                    maintenance.map((m) => (
                        <Reveal key={m.id} className="resend-card p-8 rounded-2xl group border-l-4 border-l-blue-500/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] font-bold font-mono text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                            {m.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">ID: {m.id.substring(0, 8)}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight uppercase font-mono">{m.title}</h3>
                                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">{m.description || 'Routine infrastructure maintenance and performance optimization.'}</p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-zinc-500 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                            <Calendar size={14} className="text-blue-500/70" />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-700 leading-none mb-1">Window Starts</span>
                                                <span className="text-[10px] font-mono text-zinc-400 uppercase leading-none">
                                                    {new Date(m.startsAt).toLocaleDateString()} at {new Date(m.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-zinc-500 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                                            <Clock size={14} className="text-blue-500/70" />
                                            <div className="flex flex-col">
                                                <span className="text-[8px] font-mono uppercase tracking-widest text-zinc-700 leading-none mb-1">Estimated Duration</span>
                                                <span className="text-[10px] font-mono text-zinc-400 uppercase leading-none">
                                                    {Math.round((new Date(m.endsAt).getTime() - new Date(m.startsAt).getTime()) / (1000 * 60 * 60))} Hours
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))
                )}
            </div>

            {/* Info Card */}
            <Reveal className="mt-12 p-6 rounded-2xl bg-blue-500/[0.02] border border-blue-500/10 flex items-start gap-4">
                <Info size={18} className="text-blue-500/50 mt-1 shrink-0" />
                <div>
                    <h4 className="text-xs font-bold text-blue-500/70 uppercase tracking-widest mb-1 italic">Synchronization Protocols</h4>
                    <p className="text-[11px] text-zinc-600 leading-relaxed font-mono uppercase tracking-tighter">
                        Maintenances are scheduled during low-traffic periods to minimize disruption.
                        All core endpoints remain protected by failure-buffering during upgrade windows.
                    </p>
                </div>
            </Reveal>
        </main>
    );
}
