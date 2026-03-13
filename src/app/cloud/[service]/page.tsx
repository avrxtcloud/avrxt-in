import { notFound } from 'next/navigation';
import { CLOUD_SERVICES } from '@/lib/cloud-services';
import Reveal from '@/components/Reveal';
import SpotlightBox from '@/components/SpotlightBox';
import BookingForm from './BookingForm';
import { CheckCircle2, ShieldCheck, Zap, Globe, Layers, Bot, Code2, Cloud } from 'lucide-react';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';

const iconMap = {
    Globe, Layers, Bot, Code2, Zap, Cloud, ShieldCheck
};

export async function generateStaticParams() {
    return CLOUD_SERVICES.map((service) => ({
        service: service.id,
    }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ service: string }>;
}): Promise<Metadata> {
    const { service: serviceId } = await params;
    const service = CLOUD_SERVICES.find((s) => s.id === serviceId);

    if (!service) {
        return buildPageMetadata({
            title: 'Cloud Service',
            description: 'Service details not found.',
            noIndex: true,
        });
    }

    return buildPageMetadata({
        title: service.title,
        description: service.description || `Premium ${service.title.toLowerCase()} service built for scale and performance.`,
        keywords: ['cloud services', 'avrxt', service.id, service.title],
    });
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
    const { service: serviceId } = await params;
    const service = CLOUD_SERVICES.find((s) => s.id === serviceId);

    if (!service) {
        notFound();
    }

    const Icon = iconMap[service.iconName] || Globe;

    return (
        <main className="max-w-6xl mx-auto px-6 py-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                {/* Left: Content */}
                <Reveal className="space-y-12">
                    <div>
                        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8">
                            <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 gradient-heading uppercase leading-none">
                            {service.title}
                        </h1>
                        <p className="text-zinc-400 text-lg leading-relaxed">
                            Powerful, {service.title.toLowerCase()} solution built for scale and performance.
                            Meticulously engineered to meet industry standards.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                            <ShieldCheck className="w-5 h-5 text-emerald-500 mb-4" />
                            <h4 className="font-bold text-white text-sm mb-2">Secure & Reliable</h4>
                            <p className="text-xs text-zinc-500">Built with security-first architecture and best practices.</p>
                        </div>
                        <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
                            <Zap className="w-5 h-5 text-yellow-500 mb-4" />
                            <h4 className="font-bold text-white text-sm mb-2">Fast Delivery</h4>
                            <p className="text-xs text-zinc-500">Optimized workflows for quick turnaround without quality loss.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-zinc-600 mb-6">Specifications</h3>
                        <div className="space-y-3">
                            {service.variants[0].features.map((f: string) => (
                                <div key={f} className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                                    <CheckCircle2 className="w-4 h-4 text-zinc-500" />
                                    <span className="text-sm font-medium text-zinc-300">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Available to Start</span>
                        </div>
                        <p className="text-sm text-zinc-400">
                            Booking this service requires an advanced security deposit to lock the production slot.
                        </p>
                    </div>
                </Reveal>

                {/* Right: Booking Form */}
                <Reveal className="lg:sticky lg:top-32" style={{ transitionDelay: '0.2s' }}>
                    <SpotlightBox>
                        <div className="p-8 md:p-10">
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Service Booking</h2>
                                <p className="text-zinc-500 text-sm">Secure your project slot by filling the details below.</p>
                            </div>

                            <BookingForm service={service} />
                        </div>
                    </SpotlightBox>
                </Reveal>
            </div>
        </main>
    );
}
