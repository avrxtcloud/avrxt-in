'use client';

import { signIn, useSession } from "@/lib/auth-client";
import SpotlightBox from "@/components/SpotlightBox";
import Reveal from "@/components/Reveal";
import Tilt from "@/components/Tilt";
import { ArrowLeft, ShieldCheck, Activity } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
    const { data: session, isPending } = useSession();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // If session exists and user is admin, redirect to dashboard
    useEffect(() => {
        if (session?.user && session.user.role === 'admin') {
            router.push('/admin');
        }
    }, [session, router]);

    const handleDiscordLogin = async () => {
        try {
            setLoading(true);
            await signIn.social({
                provider: "discord",
                callbackURL: "https://www.avrxt.in/admin", // Main site dashboard
            });
        } catch (error) {
            console.error("Login failed:", error);
            setLoading(false);
        }
    };

    if (isPending) return null; // Or a loader matching the site

    return (
        <main className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#050505] overflow-hidden">
            {/* Background elements to match main site aesthetics */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(16,185,129,0.05)_0%,_transparent_70%)]" />
            
            <Reveal className="w-full max-w-lg relative z-10" delay={0.2}>
                <div className="mb-12 text-center">
                    <Link href="https://www.avrxt.in" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-zinc-500 hover:text-white transition-colors mb-8 group">
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Get_Back_
                    </Link>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tighter gradient-heading mb-4">Command_Center.</h1>
                    <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.6em]">Authorized_Personnel_Only_</p>
                </div>

                <Tilt intensity={5}>
                    <SpotlightBox className="p-12 md:p-16 rounded-[3rem] border border-white/5 bg-[#0a0a0a]/60 backdrop-blur-3xl relative overflow-hidden group/card shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-0 right-0 p-10 opacity-20 group-hover/card:opacity-100 group-hover/card:text-emerald-500 transition-all duration-700">
                            <ShieldCheck className="w-10 h-10" />
                        </div>

                        <div className="space-y-12 relative z-10">
                            <div className="space-y-4">
                                <h2 className="text-2xl font-black tracking-tight text-zinc-200 mb-2 uppercase tracking-wide">Protocol_Initialize:</h2>
                                <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                                    Identity verification required. Requesting secure uplink via Discord OAuth 2.0 protocol for administrative clearance.
                                </p>
                            </div>

                            <button 
                                onClick={handleDiscordLogin}
                                disabled={loading}
                                className="w-full bg-white text-black py-7 rounded-2xl font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group/btn disabled:opacity-50 relative overflow-hidden shadow-[0_20px_40px_rgba(255,255,255,0.05)]"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-4">
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

                            <div className="pt-10 border-t border-white/5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-pulse" />
                                        Node: auth.avrxt.in
                                    </div>
                                    <span className="text-[10px] font-mono text-zinc-800 uppercase tracking-[0.2em] italic">V6.1_BETA</span>
                                </div>
                            </div>
                        </div>
                    </SpotlightBox>
                </Tilt>

                <div className="mt-16 text-center text-[9px] font-mono text-zinc-800 uppercase tracking-[0.5em] opacity-40">
                    &copy; AVRXT_SYSTEMS // CORE_STABILITY: SECURE
                </div>
            </Reveal>
        </main>
    );
}
