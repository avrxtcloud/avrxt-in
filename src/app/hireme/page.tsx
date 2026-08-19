'use client';

import { useState } from 'react';
import { Layout, Database, BrainCircuit, ShieldCheck, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import Reveal from '@/components/Reveal';
import { cn } from '@/lib/utils';
import { apiUrl } from '@/lib/api-gateway';

// Metadata is not allowed in Client Components, but we can set it via a side-file or document head.
// However, in Next.js App Router, for client pages we usually use a separate layout or head component if we want dynamic.
// But for static SEO, we can just use the title tag in the component if needed, or wrap it in a Server Layout.
// Actually, I'll create a layout.tsx for hireme if it doesn't exist to set the metadata there.


export default function HireMe() {
    const [totalPrice, setTotalPrice] = useState(0);
    const [totalWeeks, setTotalWeeks] = useState(0);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const modules = [
        { id: 'frontend', name: 'Frontend', icon: Layout, price: 35000, weeks: 2 },
        { id: 'backend', name: 'Backend', icon: Database, price: 45000, weeks: 3 },
        { id: 'ailogic', name: 'AI Logic', icon: BrainCircuit, price: 60000, weeks: 4 },
        { id: 'devops', name: 'DevOps', icon: ShieldCheck, price: 25000, weeks: 1 },
    ];

    const toggleModule = (id: string, price: number, weeks: number) => {
        if (selectedModules.includes(id)) {
            setSelectedModules(selectedModules.filter(m => m !== id));
            setTotalPrice(prev => prev - price);
            setTotalWeeks(prev => prev - weeks);
        } else {
            setSelectedModules([...selectedModules, id]);
            setTotalPrice(prev => prev + price);
            setTotalWeeks(prev => prev + weeks);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormStatus({ type: null, message: '' });

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch(apiUrl('/v1/hire', '/api/hireme'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                setFormStatus({ type: 'success', message: '// SUCCESS: INTAKE_COMPLETE' });
                (e.target as HTMLFormElement).reset();
                setSelectedModules([]);
                setTotalPrice(0);
                setTotalWeeks(0);
            } else {
                setFormStatus({ type: 'error', message: `// ERROR: ${result.message || result.error || 'TRANSMISSION_DENIED'}` });
            }
        } catch (error) {
            console.error('Fetch error:', error);
            setFormStatus({ type: 'error', message: '// ERROR: UPLINK_LOST' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="max-w-5xl mx-auto px-6 pt-48 pb-32">
            <Reveal className="text-center mb-16 active">
                <p className="text-xs uppercase tracking-[0.4em] text-zinc-500 mb-6 font-mono">// Project_Inquiry_v2.0</p>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 gradient-heading">
                    Project <span className="text-zinc-500">Intake_</span>
                </h1>
            </Reveal>

            <Reveal className="mb-24">
                <div className="mb-10 text-center">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-2">Pre-Submission Estimator</h3>
                    <p className="text-xs text-zinc-600 font-mono">Select modules to calculate baseline resource allocation.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    {modules.map((m) => (
                        <div
                            key={m.id}
                            className={cn(
                                "resend-card p-6 rounded-2xl text-center cursor-pointer transition-all border border-white/5",
                                selectedModules.includes(m.id) ? "border-white bg-white/10" : "hover:border-white/20"
                            )}
                            onClick={() => toggleModule(m.id, m.price, m.weeks)}
                        >
                            <m.icon className={cn("w-5 h-5 mx-auto mb-3", selectedModules.includes(m.id) ? "text-white" : "text-zinc-500")} />
                            <p className="text-[10px] font-bold uppercase tracking-tighter text-white">{m.name}</p>
                        </div>
                    ))}
                </div>

                <div className="max-w-md mx-auto p-8 border border-white/5 rounded-3xl bg-white/[0.01] text-center">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] uppercase text-zinc-600 font-bold mb-1">Est. Budget</p>
                            <p className="text-2xl font-mono text-white">₹{totalPrice.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-zinc-600 font-bold mb-1">Est. Time</p>
                            <p className="text-2xl font-mono text-white">{totalWeeks}w</p>
                        </div>
                    </div>
                </div>
            </Reveal>

            <Reveal id="form-section" className="max-w-3xl mx-auto">
                {formStatus.type && (
                    <div className={cn(
                        "mb-8 p-5 rounded-xl border font-mono text-[11px] uppercase tracking-widest",
                        formStatus.type === 'success' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" : "bg-red-500/5 text-red-500 border-red-500/20"
                    )}>
                        {formStatus.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 ml-1">01. Identity</label>
                            <input type="text" name="name" placeholder="Name or Organization" required className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 font-mono text-sm outline-none focus:border-white/30 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 ml-1">02. Communication_Node</label>
                            <input type="email" name="email" placeholder="email@provider.com" required className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 font-mono text-sm outline-none focus:border-white/30 transition-all" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 ml-1">03. Project_Type</label>
                            <select name="projectType" required className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-white font-mono text-xs outline-none focus:border-white/30 transition-all appearance-none cursor-pointer">
                                <option value="Custom Web App" className='bg-black'>Custom Web App</option>
                                <option value="API Development" className='bg-black'>API Development</option>
                                <option value="AI Automation" className='bg-black'>AI Automation</option>
                                <option value="ERP Implementation" className='bg-black'>ERP Implementation</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 ml-1">04. Resource_Allocation</label>
                            <select name="budget" required className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-white font-mono text-xs outline-none focus:border-white/30 transition-all appearance-none cursor-pointer">
                                <option value="N/A (Quote Required)" className='bg-black'>Quote Required</option>
                                <option value="₹10k - ₹50k" className='bg-black'>₹10k - ₹50k</option>
                                <option value="₹50k - ₹1.5L" className='bg-black'>₹50k - ₹1.5L</option>
                                <option value="₹1.5L - ₹5L" className='bg-black'>₹1.5L - ₹5L</option>
                                <option value="₹5L+" className='bg-black'>₹5L+</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 ml-1">05. Time_Frame</label>
                            <select name="timeline" required className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-white font-mono text-xs outline-none focus:border-white/30 transition-all appearance-none cursor-pointer">
                                <option value="3-5 Weeks" className='bg-black'>3-5 Weeks</option>
                                <option value="6-12 Weeks" className='bg-black'>6-12 Weeks</option>
                                <option value="3+ Months" className='bg-black'>3+ Months</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-600 ml-1">06. Scope_Payload</label>
                        <textarea name="description" rows={8} placeholder="Outline technical requirements..." required className="w-full px-6 py-4 rounded-xl bg-white/[0.02] border border-white/10 text-white placeholder-zinc-700 font-mono text-sm resize-none outline-none focus:border-white/30 transition-all"></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-black py-5 rounded-xl hover:shadow-[0_0_40px_rgba(255,255,255,0.15)] transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSubmitting ? 'UPLOADING...' : 'Transmit_Intake_Data_'} <UploadCloud className="w-4 h-4" />
                    </button>

                    <p className="mt-8 text-[9px] text-zinc-600 uppercase tracking-widest leading-relaxed text-center px-4">
                        By transmitting, you agree to our <Link href="/terms" className="text-zinc-500 hover:text-white underline underline-offset-4">Terms</Link> and <Link href="/privacy" className="text-zinc-500 hover:text-white underline underline-offset-4">Privacy Policy</Link>. <br />
                        Submitted data is processed securely through our internal API.
                    </p>
                </form>
            </Reveal>
        </main>
    );
}

