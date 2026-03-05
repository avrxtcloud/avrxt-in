'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Clock,
    ExternalLink,
    AlertCircle,
    CheckCircle2,
    Info,
    Calendar
} from 'lucide-react';
import Reveal from '@/components/Reveal';
import { getStatusHistory } from '@/app/actions/status';
import { cn } from '@/lib/utils';

export default function IncidentsPage() {
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await getStatusHistory();
                setIncidents(res.incidents || []);
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
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4">INCIDENT_LOGS</h1>
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.3em]">Historical records of infrastructure events and post-mortems.</p>
            </Reveal>

            <div className="space-y-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-white/[0.02] border border-white/5 rounded-2xl animate-pulse" />
                    ))
                ) : incidents.length === 0 ? (
                    <Reveal className="p-12 text-center rounded-2xl border border-white/5 bg-white/[0.01]">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500/50 mx-auto mb-4" />
                        <h3 className="text-white font-bold opacity-80 uppercase tracking-widest font-mono">Archive Empty</h3>
                        <p className="text-zinc-600 text-xs font-mono uppercase mt-2">No critical incidents recorded in the current epoch.</p>
                    </Reveal>
                ) : (
                    incidents.map((incident, idx) => (
                        <Reveal key={incident.id} className="resend-card p-8 rounded-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <div className={cn(
                                    "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest border",
                                    incident.status === 'resolved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                                )}>
                                    {incident.status}
                                </div>
                            </div>

                            <div className="flex gap-6 items-start">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-500">
                                    <Clock size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
                                            {new Date(incident.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                        <span className="text-[10px] font-mono text-zinc-700 uppercase tracking-tighter">ID: {incident.id.substring(0, 8)}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4 tracking-tight group-hover:text-emerald-400/90 transition-colors uppercase font-mono">{incident.title}</h3>

                                    {/* Incident Timeline */}
                                    <div className="space-y-4 border-l border-white/5 ml-1 pl-6 pt-2">
                                        {incident.updates.reverse().map((update: any, idx: number) => (
                                            <div key={idx} className="relative">
                                                <div className="absolute -left-[27px] top-1 w-2 h-2 rounded-full bg-zinc-800 border border-black" />
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase">{update.status}</span>
                                                    <span className="text-[8px] font-mono text-zinc-700">{new Date(update.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">{update.body}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))
                )}
            </div>

            {/* Footer Decoration */}
            <Reveal className="mt-24 pt-12 border-t border-white/5 text-center opacity-40">
                <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-zinc-700 mb-2">Legacy Protocol Archive Active</p>
                <div className="flex justify-center gap-1">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-0.5 bg-zinc-900" />)}
                </div>
            </Reveal>
        </main>
    );
}
