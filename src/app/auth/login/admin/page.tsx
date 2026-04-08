'use client';
import React from "react";
import { signIn, useSession } from "@/lib/auth-client";
import SpotlightBox from "@/components/SpotlightBox";
import Reveal from "@/components/Reveal";
import Tilt from "@/components/Tilt";
import { ArrowLeft, ShieldCheck, Activity, Mail } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AdminLoginContent() {
    const { data: session, isPending } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const source = searchParams.get('source') || 'admin';
    const error = searchParams.get('error') || '';

    // Config per source
    const config: Record<string, {
        title: string;
        subtitle: string;
        description: string;
        callbackURL: string;
        icon: React.ReactNode;
        gradient: string;
        node: string;
    }> = {
        admin: {
            title: 'Command_Center.',
            subtitle: 'Authorized_Personnel_Only_',
            description: 'Identity verification required. Requesting secure uplink via Discord OAuth 2.0 protocol for administrative clearance.',
            callbackURL: '/me/admin',
            icon: <ShieldCheck className="w-10 h-10" />,
            gradient: 'rgba(16,185,129,0.05)',
            node: 'auth.avrxt.in',
        },
        mail: {
            title: 'Broadcast_Hub.',
            subtitle: 'Dispatch_Authority_Required_',
            description: 'Secure authentication required. Requesting Discord OAuth 2.0 verification for newsletter broadcast clearance.',
            callbackURL: '/mail/admin',
            icon: <Mail className="w-10 h-10" />,
            gradient: 'rgba(99,102,241,0.05)',
            node: 'notify.avrxt.in',
        },
        guestbook: {
            title: 'Guest_Access.',
            subtitle: 'Sign_In_Required_',
            description: 'Authentication required to leave a message in the guestbook.',
            callbackURL: '/guestbook',
            icon: <Activity className="w-10 h-10" />,
            gradient: 'rgba(251,191,36,0.05)',
            node: 'guest.avrxt.in',
        },
    };

    const current = config[source] || config.admin;

    // If session exists and user is admin, redirect to target
    useEffect(() => {
        if (session?.user && (session.user as any).role === 'admin') {
            router.push(current.callbackURL);
        }
    }, [session, router, current.callbackURL]);

    const handleDiscordLogin = async () => {
        try {
            setLoading(true);
            await signIn.social({
                provider: "discord",
                callbackURL: current.callbackURL,
            });
        } catch (error) {
            console.error("Login failed:", error);
            setLoading(false);
        }
    };

    if (isPending) return null;

    return (
        <main className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#050505] overflow-hidden">
            {/* Background gradient based on source */}
            <div className="absolute inset-0" style={{ background: `radial-gradient(circle at center, ${current.gradient} 0%, transparent 70%)` }} />
            
            <Reveal className="w-full max-w-lg relative z-10" delay={0.2}>
                <div className="mb-8 sm:mb-12 text-center">
                    <Link href="https://www.avrxt.in" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-colors mb-6 sm:mb-8 group">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Get_Back_
                    </Link>
                    <h1 className="text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter gradient-heading mb-4">{current.title}</h1>
                    <p className="text-zinc-600 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.4em] sm:tracking-[0.6em]">{current.subtitle}</p>
                </div>

                <Tilt intensity={5}>
                    <SpotlightBox className="p-8 sm:p-12 md:p-16 rounded-[2rem] sm:rounded-[3rem] border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-3xl relative overflow-hidden group/card shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 p-6 sm:p-10 opacity-20 group-hover/card:opacity-100 group-hover/card:text-emerald-500 transition-all duration-700">
                            {current.icon}
                        </div>

                        <div className="space-y-8 sm:space-y-12 relative z-10">
                            <div className="space-y-3 sm:space-y-4">
                                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-200 mb-2 uppercase">Protocol_Initialize:</h2>
                                <p className="text-zinc-500 text-xs sm:text-sm font-medium leading-relaxed">
                                    {current.description}
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 sm:p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-[10px] sm:text-xs text-red-400 font-mono uppercase tracking-wider">
                                        {error === 'not_logged_in' && 'Authentication required. Please sign in.'}
                                        {error === 'unauthorized_role' && 'Access Denied: Required Role Missing.'}
                                        {!['not_logged_in', 'unauthorized_role'].includes(error) && 'An authentication error occurred.'}
                                    </p>
                                </div>
                            )}

                            <button 
                                onClick={handleDiscordLogin}
                                disabled={loading}
                                className="w-full bg-white text-black py-5 sm:py-7 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] flex items-center justify-center gap-3 sm:gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group/btn disabled:opacity-50 relative overflow-hidden shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-3 sm:gap-4">
                                        <Activity className="w-4 h-4 animate-pulse text-zinc-400" />
                                        Establishing_Link...
                                    </span>
                                ) : (
                                    <>
                                        Authorize_Discord_
                                        <Activity className="w-4 h-4 group-hover/btn:animate-pulse transition-all" />
                                    </>
                                )}
                            </button>

                            <div className="pt-6 sm:pt-10 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                                        Node: {current.node}
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-800 uppercase tracking-[0.2em] italic">V6.1_BETA</span>
                                </div>
                            </div>
                        </div>
                    </SpotlightBox>
                </Tilt>

                <div className="mt-10 sm:mt-16 text-center text-[8px] sm:text-[9px] font-mono text-zinc-800 uppercase tracking-[0.3em] sm:tracking-[0.5em] opacity-40">
                    &copy; AVRXT_SYSTEMS // CORE_STABILITY: SECURE
                </div>
            </Reveal>
        </main>
    );
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={
            <main className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]">
                <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing_Auth_Module...</div>
            </main>
        }>
            <AdminLoginContent />
        </Suspense>
    );
}
