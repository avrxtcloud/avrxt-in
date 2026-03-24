import Reveal from '@/components/Reveal';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: 'Security Protocol',
    description:
        'Explore our multi-layered Security Protocol. Learn how we secure your data with TLS 1.3, encrypted storage, and proactive vulnerability audits.',
    keywords: ['security protocol', 'data security', 'encryption', 'TLS 1.3', 'infrastructure security', 'vulnerability reporting', 'bug bounty'],
});

export default function Security() {
    const lastUpdated = "January 15, 2026";
    const supportEmail = "support@avrxt.in";

    return (
        <main className="max-w-3xl mx-auto px-6 pt-40 pb-32">
            <Reveal className="active">
                <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-500 mb-4 font-mono">{"// Security Protocol v2.5"}</p>
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-12 text-white">Security_</h1>

                <div className="space-y-12">
                    <p className="italic text-zinc-500">Last updated: {lastUpdated}</p>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">01. Transit & Encryption</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            All data transmitted between your node and our API is encrypted using <span className="text-white font-semibold">TLS 1.3 with AES-256-GCM</span> algorithm. We maintain an <span className="text-white font-bold">A+ Rating</span> on SSL Labs by enforcing strict HSTS policies and disabling legacy cipher suites (TLS 1.0/1.1).
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">02. Data At Rest</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            User databases are architected with <span className="text-white font-semibold">TDE (Transparent Data Encryption)</span>. Sensitive keys and environment variables are managed via <span className="text-white font-semibold">AWS Key Management Service (KMS)</span> or Vault-grade storage. We never store raw passwords; all authentication is handled via Argon2id or enterprise-grade OAuth providers.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">03. Infrastructure Hardening</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            Our architecture is firewalled at the edge using <span className="text-white font-semibold">Cloudflare WAF</span> to filter SQLi, XSS, and bot-driven attacks. Internal access to the production layer is restricted through <span className="text-white font-semibold">Zero-Trust Network Access (ZTNA)</span> and multi-factor authentication.
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">04. Vulnerability Disclosure</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            We value the security community. If you identify a security flaw within our infrastructure, please report it immediately to our security cell. We practice a <span className="text-white font-bold underline decoration-zinc-800">Responsible Disclosure Policy</span> and do not seek legal action against researchers acting in good faith.
                            <br /><br />
                            Reporting Endpoint: <span className="text-white font-bold underline decoration-zinc-800">{supportEmail}</span>
                        </p>
                    </section>

                    <section className="legal-section">
                        <h2 className="text-white font-mono text-lg font-bold uppercase tracking-widest border-l-2 border-zinc-800 pl-4 mb-4">05. Disaster Recovery</h2>
                        <p className="text-zinc-400 leading-relaxed text-sm">
                            To ensure business continuity, we maintain encrypted, off-site backups with <span className="text-white font-semibold">99.999999999% durability</span>. Our recovery-time objective (RTO) for mission-critical intake terminals is less than 4 hours.
                        </p>
                    </section>
                </div>
            </Reveal>
        </main>
    );
}
