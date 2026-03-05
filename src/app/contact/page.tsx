'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Github, Mail, Instagram, Menu } from 'lucide-react';
import Reveal from '@/components/Reveal';

export default function Contact() {
    const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_ENDPOINT = '/api/contact';

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormStatus({ type: null, message: '' });

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
            });

            const result = await response.json().catch(() => ({}));

            if (response.ok) {
                setFormStatus({ type: 'success', message: '// SUCCESS: SIGNAL_DELIVERED' });
                (e.target as HTMLFormElement).reset();
            } else {
                setFormStatus({ type: 'error', message: `// ERROR: ${result.error || 'UPLINK_DENIED'}` });
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            setFormStatus({ type: 'error', message: '// ERROR: UPLINK_LOST' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="max-w-6xl mx-auto px-4 py-16 md:py-24 pt-40">
            <Reveal className="text-center mb-12 active">
                <p className="text-zinc-500 mb-4 tracking-widest font-mono">// INITIATE_CONNECTION</p>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-4 font-mono text-white">
                    Let&apos;s <span className="text-zinc-500">Connect_</span>
                </h1>
                <p className="text-lg text-zinc-400 font-mono max-w-2xl mx-auto">
                    Discussing architecture, automation, or full-stack integrations.
                </p>
            </Reveal>

            <Reveal className="max-w-3xl mx-auto p-6 md:p-10 border border-zinc-800 bg-black/40 backdrop-blur-xl">
                {formStatus.type && (
                    <div className={`mb-6 p-4 font-mono text-sm border ${formStatus.type === 'success'
                        ? 'bg-green-900/10 text-green-400 border-green-900/50'
                        : 'bg-red-900/10 text-red-400 border-red-900/50'
                        }`}>
                        {formStatus.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 text-white">
                    <div>
                        <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest mb-2 font-mono text-zinc-500">01. Identification</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            placeholder="Name / Organization"
                            required
                            className="bg-black border border-zinc-800 text-white p-4 w-full focus:border-white outline-none transition-colors font-mono"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-xs font-bold uppercase tracking-widest mb-2 font-mono text-zinc-500">02. Return_Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="email@provider.com"
                            required
                            className="bg-black border border-zinc-800 text-white p-4 w-full focus:border-white outline-none transition-colors font-mono"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-xs font-bold uppercase tracking-widest mb-2 font-mono text-zinc-500">03. Payload_Details</label>
                        <textarea
                            id="message"
                            name="message"
                            rows={5}
                            placeholder="Project scope, objectives, or inquiries..."
                            required
                            className="bg-black border border-zinc-800 text-white p-4 w-full focus:border-white outline-none transition-colors font-mono"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-4 bg-white text-black font-bold hover:bg-zinc-200 transition-all font-mono uppercase tracking-widest disabled:opacity-50"
                    >
                        {isSubmitting ? 'TRANSMITTING...' : 'Transmit_Message'}
                    </button>
                </form>
            </Reveal>

            <div className="mt-24 text-center">
                <div className="flex justify-center gap-8 text-zinc-500 transition-all">
                    <Link href="https://github.com/avrxt" target="_blank" className="hover:text-white transition-colors">
                        <Github className="w-6 h-6" />
                    </Link>
                    <Link href="mailto:support@avrxt.in" className="hover:text-white transition-colors">
                        <Mail className="w-6 h-6" />
                    </Link>
                    <Link href="https://instagram.com/avr.me" target="_blank" className="hover:text-white transition-colors">
                        <Instagram className="w-6 h-6" />
                    </Link>
                </div>
            </div>
        </main>
    );
}

