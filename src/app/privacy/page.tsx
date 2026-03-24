import Reveal from '@/components/Reveal';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: 'Privacy Policy',
    description:
        'Our Data Governance and Privacy Policy. Learn how we handle your data, logging, and security in accordance with DPDP Act and GDPR.',
    keywords: ['privacy policy', 'data governance', 'avrxt privacy', 'GDPR compliance', 'DPDP Act', 'data security'],
});

export default function Privacy() {
    const lastUpdated = "January 15, 2026";
    const supportEmail = "support@avrxt.in";

    return (
        <main className="max-w-3xl mx-auto px-6 pt-40 pb-32">
            <Reveal className="active">
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-4 font-mono">{"// Data Governance v3.2"}</p>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-12 text-white">Privacy Policy_</h1>

                <div className="space-y-12">
                    <p className="italic text-zinc-500">Last updated: {lastUpdated}</p>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">01. IP Logging & Diagnostics</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            To ensure infrastructure security and mitigate malicious activity (DDoS, Brute-force), we log <span className="text-white font-semibold">IP addresses</span>, session timestamps, and browser metadata. These logs are stored in encrypted volumes and are used solely for technical diagnostics and threat detection. In accordance with the <span className="text-white font-semibold">Information Technology (IT) Act</span>, these logs are <span className="text-white font-semibold">permanently purged after 30 days</span> unless required for legal investigations.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">02. Subscription & Data Integrity</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Newsletter subscriptions and project inquiries are archived in our <span className="text-white font-semibold">Secure Internal Database</span> and synchronized with <span className="text-white font-semibold">Resend</span>. We do not sell, trade, or leak your contact information. You may exercise your right to erasure (&quot;Right to be Forgotten&quot;) by contacting us directly or using the unsubscribe link in mail transmissions.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">03. Cookie Policy & Tracking</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            We use essential cookies for session management and security. Third-party analytics (Vercel Analytics) are used in a privacy-preserving manner to understand traffic patterns. We do <span className="text-white font-bold">not</span> use cross-site tracking or advertising cookies.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">04. Data Processing Locations</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Our architecture leverages global edge nodes. Traffic may be processed through providers including <span className="text-white font-semibold">Vercel (Global), Amazon Web Services (Mumbai/Singapore), and Cloudflare</span>. Data residence is primarily maintained in Indian or EU-based regions depending on the service node.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">05. Regulatory Compliance</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            We operate as a &quot;Data Fiduciary&quot; under the <span className="text-white font-semibold">Digital Personal Data Protection (DPDP) Act, 2023</span>. For data access requests, deletion, or grievance redressal, please contact our Data Protection Node: <span className="text-white font-bold underline decoration-zinc-800">{supportEmail}</span>.
                        </p>
                    </section>
                </div>
            </Reveal>
        </main>
    );
}
