import Reveal from '@/components/Reveal';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service | avrxt.in',
    description: 'The formal Terms and Conditions for accessing avrxt.in and using our Cloud architecture. Review our rules on API usage, liability, and conduct.',
    keywords: ['terms of service', 'legal terms', 'avrxt terms', 'API usage rules', 'user conduct', 'legal jurisdiction'],
};

export default function Terms() {
    const lastUpdated = "January 15, 2026";
    const supportEmail = "support@avrxt.in";

    return (
        <main className="max-w-3xl mx-auto px-6 pt-40 pb-32">
            <Reveal className="active">
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-4 font-mono">{"// Terms of Service v3.2"}</p>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-12 text-white">Terms & Conditions_</h1>

                <div className="space-y-12">
                    <p className="italic text-zinc-500">Last updated: {lastUpdated}</p>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">01. Service Access & Security</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Accessing our infrastructure via malicious proxy nodes, headless browsers, or automated scrapers without explicit authorization is strictly prohibited. We reserve the authority to <span className="text-white font-bold underline decoration-zinc-800">unilaterally blackhole detected malicious IPs</span> to maintain the stability of our ecosystem.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">02. Intellectual Property</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Unless otherwise specified, all design elements, UI architecture, and source code excerpts visible on this domain are the intellectual property of <span className="text-white font-semibold">AVRXT</span>. Unauthorized cloning or commercial redistribution of our proprietary assets will result in a DMCA take-down and legal action.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">03. API & Development State</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Our Cloud intake and API systems are in an evolving state of development. While we strive for 99.9% uptime, we are not liable for transient data loss or latency. Exploiting bugs or unauthorized penetration testing is punishable under <span className="text-white font-semibold underline decoration-zinc-800">Section 66 of the IT Act</span>.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">04. Limitation of Liability</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            To the maximum extent permitted by law, <span className="text-white font-semibold">AVRXT</span> shall not be liable for any indirect, incidental, or consequential damages arising out of your use of our services. Our total liability for any claim shall not exceed the amount paid for the specific service in question.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">05. Jurisdiction & Disputes</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            These terms are governed by the laws of India. Any legal disputes arising shall be subject to the exclusive jurisdiction of the competent courts in Kerala, India. For legal inquiries, contact: <span className="text-white font-bold underline decoration-zinc-800">{supportEmail}</span>.
                        </p>
                    </section>
                </div>
            </Reveal>
        </main>
    );
}
