'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Github, Disc, ShieldCheck, Mail, Activity, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Tilt from '@/components/Tilt';
import SpotlightBox from '@/components/SpotlightBox';
import Reveal from '@/components/Reveal';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505]">
                <div className="text-zinc-600 font-mono text-xs uppercase tracking-widest animate-pulse">Initializing_Auth_Module...</div>
            </main>
        }>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const source = searchParams.get('source') || 'admin';
    const error = searchParams.get('error') || '';
    const supabase = createClient();

    // Config per source (Matching the premium UI request)
    const config: Record<string, {
        title: string;
        subtitle: string;
        description: string;
        icon: React.ReactNode;
        gradient: string;
        node: string;
        provider: 'discord' | 'github';
        next: string;
    }> = {
        admin: {
            title: 'Command_Center.',
            subtitle: 'Authorized_Personnel_Only_',
            description: 'Identity verification required. Requesting secure uplink via Discord OAuth 2.0 protocol for administrative clearance.',
            icon: <ShieldCheck className="w-10 h-10" />,
            gradient: 'rgba(16,185,129,0.05)',
            node: 'auth.avrxt.in',
            provider: 'discord',
            next: '/me/admin'
        },
        mail: {
            title: 'Broadcast_Hub.',
            subtitle: 'Dispatch_Authority_Required_',
            description: 'Secure authentication required. Requesting Discord OAuth 2.0 verification for newsletter broadcast clearance.',
            icon: <Mail className="w-10 h-10" />,
            gradient: 'rgba(99,102,241,0.05)',
            node: 'notify.avrxt.in',
            provider: 'discord',
            next: '/mail/admin'
        },
        guestbook: {
            title: 'Guest_Access.',
            subtitle: 'Sign_In_Required_',
            description: 'Authentication required to leave a message in the guestbook.',
            icon: <Activity className="w-10 h-10" />,
            gradient: 'rgba(251,191,36,0.05)',
            node: 'guest.avrxt.in',
            provider: 'github',
            next: '/guestbook'
        },
    };

    const current = config[source] || config.admin;

    useEffect(() => {
        if (!source && !searchParams.get('error')) {
            router.push('/');
        }
    }, [source, router, searchParams]);

    const handleLogin = async () => {
        const origin = window.location.origin;
        const options: any = {
            redirectTo: `${origin}/auth/callback?next=${current.next}`,
        };
        
        if (current.provider === 'discord') {
            options.scopes = 'identify email guilds.members.read';
        }

        await supabase.auth.signInWithOAuth({
            provider: current.provider,
            options: options,
        });
    };

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
                                        {error === 'discord_required' && 'Discord authentication is required.'}
                                        {error === 'metadata_missing' && 'Discord identity not found.'}
                                        {!['not_logged_in', 'unauthorized_role', 'discord_required', 'metadata_missing'].includes(error) && 'An authentication error occurred.'}
                                    </p>
                                </div>
                            )}

                            <button 
                                onClick={handleLogin}
                                className={`w-full ${current.provider === 'discord' ? 'bg-[#5865F2] hover:bg-[#4752C4]' : 'bg-white text-black'} py-5 sm:py-7 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] sm:tracking-[0.4em] flex items-center justify-center gap-3 sm:gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group/btn relative overflow-hidden shadow-[0_20px_40px_rgba(255,255,255,0.05)]`}
                            >
                                <div className="relative flex items-center justify-center gap-3">
                                    {current.provider === 'discord' ? (
                                        <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.486 13.486 0 0 0-.64 1.28 17.683 17.683 0 0 0-5.751 0 14.15 14.15 0 0 0-.64-1.28.077.077 0 0 0-.08-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                                    ) : (
                                        <Github size={20} className="text-black group-hover:scale-110 transition-transform duration-500" />
                                    )}
                                    <span className={`text-[10px] sm:text-xs font-bold ${current.provider === 'discord' ? 'text-white' : 'text-black'} font-mono tracking-wide uppercase`}>Connect via {current.provider === 'discord' ? 'Discord' : 'GitHub'}</span>
                                </div>
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
