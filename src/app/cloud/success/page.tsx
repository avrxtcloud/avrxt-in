import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Reveal from '@/components/Reveal';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: 'Payment Verified',
    description: "Your project has been registered. Check your email for confirmation. I'll reach out within 24 hours.",
    noIndex: true,
});

export default function SuccessPage() {
    return (
        <main className="min-h-screen flex items-center justify-center px-6">
            <Reveal className="text-center">
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 gradient-heading">
                    Payment Verified.
                </h1>
                <p className="text-zinc-400 text-lg mb-12 max-w-md mx-auto">
                    Your project has been registered. Check your email for confirmation. I'll reach out to you within 24 hours.
                </p>
                <Link href="/" className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform">
                    Back to Dashboard <ArrowRight className="w-4 h-4" />
                </Link>
            </Reveal>
        </main>
    );
}
