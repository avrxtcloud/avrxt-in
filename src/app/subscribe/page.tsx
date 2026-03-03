'use client';

import { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { cn } from '@/lib/utils';

export default function Subscribe() {
    const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormStatus({ type: null, message: '' });

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('https://api.avrxt.in/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setFormStatus({ type: 'success', message: '// SUCCESS: SUBSCRIPTION_ACTIVE' });
                (e.target as HTMLFormElement).reset();
            } else {
                setFormStatus({ type: 'error', message: '// ERROR: UPLINK_DENIED' });
            }
        } catch (error) {
            setFormStatus({ type: 'error', message: '// ERROR: UPLINK_LOST' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="max-w-4xl mx-auto px-6 pt-48 pb-32">
            <Reveal className="text-center mb-16 active">
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-6 font-mono">{"// Transmission_List_v1"}</p>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 gradient-heading">
                    Newsletter <span className="text-zinc-500">Node_</span>
                </h1>
                <p className="text-lg text-zinc-400 font-mono leading-relaxed max-w-2xl mx-auto">
                    Join 500+ developers receiving monthly technical insights on full-stack architecture, automation, and API design.
                </p>
            </Reveal>

            <Reveal className="max-w-xl mx-auto">
                {formStatus.type && (
                    <div className={cn(
                        "mb-8 p-5 rounded-xl border font-mono text-[11px] uppercase tracking-widest",
                        formStatus.type === 'success' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                        {formStatus.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex flex-col md:flex-row gap-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email address"
                            required
                            className="flex-1 px-6 py-5 rounded-xl bg-black border border-zinc-800 text-white font-mono text-sm outline-none focus:border-white/30 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-5 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs disabled:opacity-50"
                        >
                            {isSubmitting ? 'JOINING...' : 'Join_List'} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                <p className="text-center mt-8 text-zinc-600 font-mono text-[10px] uppercase tracking-[0.2em]">
                    Zero Spam // One Signal Per Month
                </p>
            </Reveal>
        </main>
    );
}
