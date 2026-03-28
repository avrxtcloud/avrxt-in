import Reveal from '@/components/Reveal';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: 'Refund Policy',
    description:
        'Our transparent Refund Policy for digital services, cloud solutions, and contributions. Understand your rights and our processing timelines.',
    keywords: ['refund policy', 'cancellation policy', 'avrxt refunds', 'digital service refund', 'payment processing', 'customer trust'],
    path: '/refund',
});

export default function Refund() {
    const lastUpdated = "January 15, 2026";
    const supportEmail = "support@avrxt.in";

    return (
        <main className="max-w-3xl mx-auto px-6 pt-40 pb-32">
            <Reveal className="active">
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-4 font-mono">{"// Refund Policy v1.1"}</p>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-12 text-white">Refund Policy_</h1>

                <div className="space-y-12">
                    <p className="italic text-zinc-500">Last updated: {lastUpdated}</p>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">01. Service Delivery & Deposits</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Due to the specialized nature of our engineering services (API Dev, Bot Dev, UI Redesign), the effort allocated begins immediately upon booking. The initial <span className="text-white font-semibold underline decoration-zinc-800">50% deposit for custom projects is non-refundable</span> once the project technical audit has been completed.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">02. Refund Eligibility Criteria</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Refunds are eligible only under the following conditions:
                            <br /><br />
                            • <span className="text-white">Cancellation within 12 hours:</span> Full refund minus 5% gateway processing fees.
                            <br />
                            • <span className="text-white">Failure to Deliver:</span> If we fail to meet the documented core project requirements within the SLA-defined 30-day grace period.
                            <br />
                            • <span className="text-white">Double Payments:</span> Any accidental duplicate transactions are refunded 100%.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">03. Digital Contributions (Cupcakes)</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Payments made via the &quot;Buy Me a Cupcake&quot; portal are considered <span className="text-white font-semibold">voluntary digital contributions</span> to support open-source work. These contributions are <span className="text-white font-bold text-red-400">strictly non-refundable</span>.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">04. Execution & Timelines</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Approved refunds are initiated within <span className="text-white font-semibold">48 hours</span> and may take <span className="text-white font-semibold">5-10 bank working days</span> to reflect in your original payment source. To initiate a refund request, provide your Transaction ID and Project Reference to: <span className="text-white font-bold underline decoration-zinc-800">{supportEmail}</span>.
                        </p>
                    </section>
                </div>
            </Reveal>
        </main>
    );
}
