import { Suspense } from 'react';
import LoginInterface from './LoginInterface';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Authentication | avrxt",
    description: "Secured Access Gateway",
    robots: {
        index: false,
        follow: false,
    }
};

export default function LoginPage() {
    return (
        <main className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambient Mesh */}
            <div className="mesh-gradient opacity-40" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="relative z-10 w-full flex justify-center">
                <Suspense fallback={
                    <div className="w-full max-w-md h-[400px] resend-card rounded-2xl animate-pulse flex items-center justify-center">
                        <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Loading Gateway...</span>
                    </div>
                }>
                    <LoginInterface />
                </Suspense>
            </div>
        </main>
    );
}
