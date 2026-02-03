'use client';

import { useState } from 'react';
import { loginWithDiscord } from '@/app/actions/auth';
import { BookOpen } from 'lucide-react';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full py-4 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#4752C4] disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
        >
            {pending ? (
                <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    CONNECTING...
                </>
            ) : (
                'LOGIN WITH DISCORD'
            )}
        </button>
    );
}

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6 font-mono">
            <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/50 border border-white/10 backdrop-blur-xl">
                <div className="text-center mb-8">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 text-[#5865F2]" />
                    <h1 className="text-xl font-bold tracking-[0.2em] uppercase mb-2">avrxt_Gateway</h1>
                    <p className="text-[10px] text-zinc-500 tracking-widest uppercase">Discord_Secure_Access</p>
                </div>

                <form action={loginWithDiscord} className="space-y-4">
                    <SubmitButton />
                </form>
            </div>
        </main>
    );
}
