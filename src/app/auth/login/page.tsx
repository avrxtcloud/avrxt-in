'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Github, Disc } from 'lucide-react'; // Assuming 'Disc' for Discord or similar generic icon if not available

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">LOADING AUTH MODULE...</div>}>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const source = searchParams.get('source');
    const next = searchParams.get('next') || (source === 'guestbook' ? '/guestbook' : '/docs/admin');
    const supabase = createClient();

    useEffect(() => {
        if (!source) {
            router.push('/');
        }
    }, [source, router]);

    const handleGithubLogin = async () => {
        const origin = window.location.origin;
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${origin}/auth/callback?next=${next}`,
            },
        });
    };

    const handleDiscordLogin = async () => {
        const origin = window.location.origin;
        await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${origin}/auth/callback?next=${next}`,
            },
        });
    };

    if (!source) return null;

    return (
        <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
            {/* Optional: Local spotlight effect to enhance the premium feel on top of global mesh */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>

            <div className="relative z-10 w-full max-w-md p-10 rounded-3xl resend-card text-center space-y-10 shadow-2xl">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tighter uppercase font-outfit bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent">
                        {source === 'guestbook' ? 'Guestbook Access' : 'System Admin'}
                    </h1>
                    <div className="h-1 w-20 mx-auto bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <p className="text-[10px] text-zinc-400 tracking-[0.3em] uppercase font-mono pt-2">
                        {source === 'guestbook' ? 'Authentication_Required' : 'Restricted_Area'}
                    </p>
                </div>

                {searchParams.get('error') && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-xs text-red-400 font-mono uppercase tracking-wider">
                            {searchParams.get('error') === 'discord_required' && 'Discord authentication is required.'}
                            {searchParams.get('error') === 'metadata_missing' && 'Discord identity not found.'}
                            {searchParams.get('error') === 'unauthorized_role' && 'Access Denied: Required Role Missing.'}
                            {!['discord_required', 'metadata_missing', 'unauthorized_role'].includes(searchParams.get('error') || '') && 'An authentication error occurred.'}
                        </p>
                    </div>
                )}

                {source === 'guestbook' && (
                    <button
                        onClick={handleGithubLogin}
                        className="w-full group relative overflow-hidden rounded-xl bg-white p-[1px] transition-transform active:scale-[0.98]"
                    >
                        <div className="relative flex items-center justify-center gap-3 bg-white px-6 py-4 rounded-xl transition-colors hover:bg-zinc-50">
                            <Github size={20} className="text-black group-hover:scale-110 transition-transform duration-500" />
                            <span className="text-sm font-bold text-black font-mono tracking-wide uppercase">Connect via GitHub</span>
                        </div>
                    </button>
                )}

                {source === 'admin' && (
                    <button
                        onClick={handleDiscordLogin}
                        className="w-full group relative overflow-hidden rounded-xl bg-[#5865F2] p-[1px] transition-transform active:scale-[0.98] shadow-[0_0_40px_-10px_rgba(88,101,242,0.6)] hover:shadow-[0_0_60px_-15px_rgba(88,101,242,0.8)]"
                    >
                        <div className="relative flex items-center justify-center gap-3 bg-[#5865F2] px-6 py-4 rounded-xl transition-colors hover:bg-[#4752C4]">
                            {/* Discord Icon */}
                            <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-500" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.486 13.486 0 0 0-.64 1.28 17.683 17.683 0 0 0-5.751 0 14.15 14.15 0 0 0-.64-1.28.077.077 0 0 0-.08-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                            <span className="text-sm font-bold text-white font-mono tracking-wide uppercase">Authenticate via Discord</span>
                        </div>
                    </button>
                )}
            </div>
        </main>
    );
}
