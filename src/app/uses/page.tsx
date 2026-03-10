import Reveal from '@/components/Reveal';
import type { Metadata } from 'next';

const sections = [
    {
        title: 'Coding',
        items: [
            {
                name: 'VSCode',
                description: 'After using Sublime for many years, I moved to VSCode like everybody else.',
            },
        ],
    },
    {
        title: 'Terminal',
        items: [
            {
                name: 'Hyper',
                description: "Performance could be better, but I enjoy using this since it's made with JavaScript.",
            },
        ],
    },
    {
        title: 'Apps',
        items: [
            {
                name: 'Bartender',
                description: 'Perfect way to declutter and manage the macOS menubar.',
            },
            {
                name: 'Figma',
                description: 'I never thought something would replace the Adobe suite for me. Figma did.',
            },
            {
                name: 'Things',
                description: 'My current choice for to-do lists and organizing personal tasks.',
            },
            {
                name: 'Divvy',
                description: 'Tiny app that I use to create custom window positions.',
            },
            { name: 'Zoho Mail' },
            { name: 'Spotify' },
            { name: 'Proton Mail' },
            { name: 'Proton Pass' },
            { name: 'Proton Authenticator' },
        ],
    },
    {
        title: 'Services',
        items: [
            {
                name: 'Algolia',
                description: 'My first choice when adding search capabilities to any project.',
            },
            {
                name: 'Cloudflare',
                description: 'The DNS service I use with all my domains. Amazing product.',
            },
            {
                name: 'Self-hosted DNS management (VPS)',
                description: 'Running my own DNS stack on a VPS for full control.',
            },
            {
                name: 'Self-hosted Supabase',
                description: 'Self-hosted for flexibility and control over data.',
            },
            {
                name: 'Resend',
                description: 'The new email API for developers.',
            },
            {
                name: 'Vercel',
                description: 'Here is where I host all my websites. By far the best developer experience.',
            },
            {
                name: 'Render.com',
                description: 'Extra compute for services I do not want on Vercel.',
            },
        ],
    },
    {
        title: 'Reading',
        items: [
            {
                name: 'Audible',
                description: 'The perfect choice to listen to a book while running outside.',
            },
        ],
    },
    {
        title: 'AI Tools',
        items: [
            {
                name: 'OpenAI Codex',
                description: 'For fixes and planning.',
            },
            {
                name: 'Google Antigravity',
                description: 'For development assistance.',
            },
            {
                name: 'Claude',
                description: 'For analyzing and troubleshooting.',
            },
        ],
    },
];

export const metadata: Metadata = {
    title: 'Uses | avrxt',
    description: "Tools, apps, and gear that power avrxt's daily workflow.",
};

export default function UsesPage() {
    return (
        <main className="max-w-6xl mx-auto px-6 pt-32 pb-32">
            <Reveal className="mb-16">
                <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-mono uppercase tracking-[0.4em] text-zinc-400">
                    Uses
                    <span className="h-1 w-1 rounded-full bg-emerald-400"></span>
                    Workflow Stack
                </div>
                <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-emerald-300 via-cyan-200 to-amber-200 text-transparent bg-clip-text">
                    Tools. Apps. Gear.
                </h1>
                <p className="mt-6 max-w-2xl text-lg text-zinc-400 leading-relaxed">
                    I often get messages asking about specific pieces of software or hardware I use.
                    This is not a static page, it&#39;s a living document with everything that I&#39;m using nowadays.
                </p>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {sections.map((section, sectionIndex) => (
                    <Reveal key={section.title} className="resend-card rounded-3xl p-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-white">{section.title}</h2>
                            <span className="text-xs font-mono text-zinc-500">{String(sectionIndex + 1).padStart(2, '0')}</span>
                        </div>
                        <div className="mt-6 space-y-5">
                            {section.items.map((item, itemIndex) => (
                                <div key={`${section.title}-${item.name}`} className="flex gap-4">
                                    <div className="pt-1 text-[10px] font-mono text-zinc-600">
                                        {String(itemIndex + 1).padStart(2, '0')}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{item.name}</p>
                                        {item.description && (
                                            <p className="mt-1 text-sm text-zinc-500 leading-relaxed">{item.description}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                ))}
            </div>
        </main>
    );
}
