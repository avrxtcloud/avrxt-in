import type { Metadata } from 'next';
import { ArrowUpRight, Braces, CheckCircle2, Cloud, KeyRound, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'API Documentation | AVRXT',
    description: 'Reference documentation for the AVRXT API gateway.',
};

const endpoints = [
    { method: 'GET', path: '/v1/health', summary: 'Check the website API health.' },
    { method: 'GET', path: '/v1/status', summary: 'Read the current public system status.' },
    { method: 'POST', path: '/v1/contact', summary: 'Submit the public contact form.' },
    { method: 'POST', path: '/v1/hire', summary: 'Submit a project or hiring enquiry.' },
    { method: 'POST', path: '/v1/subscribe', summary: 'Subscribe an email address to updates.' },
    { method: 'GET', path: '/v1/link-preview?url={url}', summary: 'Return metadata for a public URL.' },
    { method: 'GET', path: '/v1/og', summary: 'Generate Open Graph output using query parameters.' },
    { method: 'GET', path: '/v1/spotify/now-playing', summary: 'Return the current or most recently played track.' },
    { method: 'GET', path: '/v1/geo/forecast?lat={lat}&lon={lon}', summary: 'Return weather data for a coordinate.' },
    { method: 'GET', path: '/v1/geo/search?q={query}', summary: 'Search for a geographic location.' },
    { method: 'GET', path: '/v1/discord/presence/{userId}', summary: 'Read public Discord presence for a user.' },
    { method: 'GET', path: '/v1/youtube/search?q={query}', summary: 'Search YouTube videos through the gateway.' },
];

const errors = [
    ['400', 'The request or a required parameter is invalid.'],
    ['404', 'The requested API route does not exist.'],
    ['429', 'Too many requests were sent in a short period.'],
    ['500', 'An unexpected service error occurred.'],
    ['503', 'The upstream integration is unavailable or not configured.'],
];

function Code({ children }: { children: string }) {
    return (
        <pre className="overflow-x-auto rounded-sm border border-white/10 bg-black/70 p-5 text-xs leading-6 text-zinc-300">
            <code>{children}</code>
        </pre>
    );
}

export default function ApiDocumentationPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-cyan-300/20 selection:text-white">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_5%,rgba(34,211,238,0.08),transparent_30%),radial-gradient(circle_at_85%_30%,rgba(99,102,241,0.06),transparent_28%)]" />

            <main className="relative mx-auto max-w-6xl px-5 pb-28 pt-36 sm:px-8 lg:px-12">
                <header className="border-b border-white/10 pb-16">
                    <div className="mb-7 flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">
                        <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399]" /> Operational</span>
                        <span className="text-zinc-700">/</span>
                        <span>API Reference v1</span>
                    </div>
                    <h1 className="max-w-4xl font-outfit text-5xl font-semibold tracking-[-0.06em] text-white sm:text-7xl lg:text-8xl">
                        One gateway.<br /><span className="text-zinc-600">Clear endpoints.</span>
                    </h1>
                    <p className="mt-8 max-w-2xl text-base leading-8 text-zinc-400 sm:text-lg">
                        The AVRXT edge gateway provides a single, versioned interface for public website services and selected external integrations.
                    </p>
                    <a href="https://api.avrxt.dev" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 border-b border-cyan-300/60 pb-1 font-mono text-xs uppercase tracking-widest text-cyan-200 transition-colors hover:border-white hover:text-white">
                        api.avrxt.dev <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                </header>

                <section className="grid gap-px border-x border-b border-white/10 bg-white/10 md:grid-cols-3">
                    {[
                        [Cloud, 'Base URL', 'https://api.avrxt.dev'],
                        [Braces, 'Format', 'application/json'],
                        [ShieldCheck, 'Transport', 'HTTPS only'],
                    ].map(([Icon, label, value]) => {
                        const ItemIcon = Icon as typeof Cloud;
                        return <div key={String(label)} className="bg-[#080808] p-7"><ItemIcon className="mb-5 h-5 w-5 text-cyan-300" /><p className="font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600">{String(label)}</p><p className="mt-2 break-all font-mono text-xs text-zinc-200">{String(value)}</p></div>;
                    })}
                </section>

                <div className="grid gap-16 pt-20 lg:grid-cols-[220px_1fr]">
                    <aside className="hidden lg:block">
                        <nav className="sticky top-28 space-y-4 border-l border-white/10 pl-5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                            <a className="block text-cyan-300" href="#quick-start">Quick start</a>
                            <a className="block transition-colors hover:text-white" href="#endpoints">Endpoints</a>
                            <a className="block transition-colors hover:text-white" href="#access">Access</a>
                            <a className="block transition-colors hover:text-white" href="#errors">Errors</a>
                        </nav>
                    </aside>

                    <div className="min-w-0 space-y-24">
                        <section id="quick-start" className="scroll-mt-28">
                            <SectionTitle number="01" title="Quick start" />
                            <p className="mb-6 leading-7 text-zinc-400">Send requests over HTTPS. Public read endpoints require no API key.</p>
                            <Code>{`curl --request GET \\\n+  --url https://api.avrxt.dev/v1/health \\\n+  --header "Accept: application/json"`}</Code>
                        </section>

                        <section id="endpoints" className="scroll-mt-28">
                            <SectionTitle number="02" title="Endpoints" />
                            <div className="divide-y divide-white/10 border-y border-white/10">
                                {endpoints.map((endpoint) => (
                                    <div key={endpoint.path} className="grid gap-3 py-5 sm:grid-cols-[64px_minmax(0,1fr)]">
                                        <span className={`h-fit w-fit rounded-sm border px-2 py-1 font-mono text-[9px] font-bold ${endpoint.method === 'POST' ? 'border-violet-400/30 bg-violet-400/5 text-violet-300' : 'border-cyan-400/30 bg-cyan-400/5 text-cyan-300'}`}>{endpoint.method}</span>
                                        <div className="min-w-0"><code className="break-all text-xs text-white sm:text-sm">{endpoint.path}</code><p className="mt-2 text-sm leading-6 text-zinc-500">{endpoint.summary}</p></div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section id="access" className="scroll-mt-28">
                            <SectionTitle number="03" title="Access & security" />
                            <div className="border border-white/10 bg-white/[0.02] p-6 sm:p-8">
                                <KeyRound className="mb-5 h-5 w-5 text-violet-300" />
                                <h3 className="font-outfit text-xl text-white">Public API access</h3>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">These endpoints are designed for AVRXT website clients. Browser access is restricted by CORS to approved origins. Server-side clients should identify themselves responsibly and cache responses where appropriate.</p>
                                <p className="mt-5 flex items-start gap-2 text-xs leading-6 text-zinc-500"><CheckCircle2 className="mt-1 h-3.5 w-3.5 shrink-0 text-emerald-400" /> Never expose provider credentials. YouTube and other upstream secrets are stored within the Worker environment.</p>
                            </div>
                        </section>

                        <section id="errors" className="scroll-mt-28">
                            <SectionTitle number="04" title="Error responses" />
                            <Code>{`{
  "error": "Missing q parameter"
}`}</Code>
                            <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                                {errors.map(([status, description]) => <div key={status} className="flex gap-6 py-4 text-sm"><code className="w-10 shrink-0 text-rose-300">{status}</code><p className="text-zinc-500">{description}</p></div>)}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
    return <div className="mb-8 flex items-center gap-4"><span className="font-mono text-[10px] text-cyan-300">{number}</span><h2 className="font-outfit text-3xl font-semibold tracking-tight text-white sm:text-4xl">{title}</h2></div>;
}
