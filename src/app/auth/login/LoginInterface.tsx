'use client';

import { useSearchParams } from 'next/navigation';
import { loginWithDiscord } from '@/app/actions/auth';
import { ShieldAlert, ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function DiscordIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 127.14 96.36" className={className} fill="currentColor">
            <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22c.12-9.23-1.67-19-5.18-27.78C117.91,42.22,112.87,23.36,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
        </svg>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
            {pending ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    INITIALIZING...
                </>
            ) : (
                <>
                    <DiscordIcon className="w-5 h-5" />
                    ACCESS_GATEWAY
                </>
            )}
        </button>
    );
}

export default function LoginInterface() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    // Access Denied View
    if (error) {
        return (
            <div className="w-full max-w-md resend-card p-10 rounded-2xl border border-red-500/20 bg-red-900/5 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="text-center mb-8 relative z-10">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                    </div>

                    <h1 className="text-3xl font-black tracking-tighter mb-4 text-white">
                        Access Denied
                    </h1>

                    <p className="text-zinc-400 font-mono text-xs leading-relaxed uppercase tracking-wide">
                        CLEARANCE_LEVEL_INSUFFICIENT
                    </p>

                    <div className="mt-8 p-4 rounded-lg bg-red-950/30 border border-red-500/10 text-left">
                        <p className="text-[10px] text-red-400 font-mono uppercase tracking-widest mb-2">SYSTEM_LOG:</p>
                        <p className="text-sm text-red-200 font-mono">
                            "{decodeURIComponent(error)}"
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <form action={loginWithDiscord} className="w-full">
                        <button
                            type="submit"
                            className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white border border-white/10 font-bold rounded-xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                        >
                            RE-AUTHENTICATE <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // Standard Login View
    return (
        <div className="w-full max-w-md resend-card p-12 rounded-2xl border border-white/10 backdrop-blur-xl relative overflow-hidden">
            {/* Decorational Elements */}
            <div className="absolute top-0 right-0 p-8 opacity-20">
                <div className="flex gap-2">
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse delay-75" />
                    <span className="w-1 h-1 rounded-full bg-white animate-pulse delay-150" />
                </div>
            </div>

            <div className="text-center mb-12">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group hover:border-white/20 transition-all">
                    <DiscordIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>

                <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4">Secured Gateway</h2>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter gradient-heading mb-6">
                    avrxt_Cloud
                </h1>

                <p className="text-zinc-400 text-sm leading-relaxed max-w-[260px] mx-auto">
                    Authenticate via encrypted channel to access infrastructure controls.
                </p>
            </div>

            <form action={loginWithDiscord} className="space-y-6">
                <SubmitButton />

                <div className="text-center">
                    <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">
                        Protected by Role-Based Access
                    </p>
                </div>
            </form>
        </div>
    );
}
