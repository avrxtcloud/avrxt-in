import Reveal from '@/components/Reveal';
import { buildPageMetadata } from '@/lib/page-metadata';

const sections = [
    {
        title: 'Coding',
        items: [
            {
                name: 'VSCode',
                description: 'After using Sublime for many years, I moved to VSCode like everybody else.',
                url: 'https://code.visualstudio.com/',
            },
        ],
    },
    {
        title: 'Terminal',
        items: [
            {
                name: 'Hyper',
                description: "Performance could be better, but I enjoy using this since it's made with JavaScript.",
                url: 'https://hyper.is/',
            },
        ],
    },
    {
        title: 'Apps',
        items: [
            {
                name: 'Bartender',
                description: 'Perfect way to declutter and manage the macOS menubar.',
                url: 'https://www.macbartender.com/',
            },
            {
                name: 'Figma',
                description: 'I never thought something would replace the Adobe suite for me. Figma did.',
                url: 'https://www.figma.com/',
            },
            {
                name: 'Things',
                description: 'My current choice for to-do lists and organizing personal tasks.',
                url: 'https://culturedcode.com/things/',
            },
            {
                name: 'Divvy',
                description: 'Tiny app that I use to create custom window positions.',
                url: 'https://mizage.com/divvy/',
            },
            {
                name: 'Zoho Mail',
                description: 'Primary inbox for business mail and custom domains.',
                url: 'https://www.zoho.com/mail/',
            },
            {
                name: 'Spotify',
                description: 'Daily streaming for focus, momentum, and long work sessions.',
                url: 'https://www.spotify.com/',
            },
            {
                name: 'Proton Mail',
                description: 'Secure email for privacy-first communication.',
                url: 'https://proton.me/mail',
            },
            {
                name: 'Proton Pass',
                description: 'Password manager for secure vaults across devices.',
                url: 'https://proton.me/pass',
            },
            {
                name: 'Proton Authenticator',
                description: 'Two-factor codes that stay synced and protected.',
                url: 'https://proton.me/authenticator',
            },
        ],
    },
    {
        title: 'Services',
        items: [
            {
                name: 'Algolia',
                description: 'My first choice when adding search capabilities to any project.',
                url: 'https://www.algolia.com/',
            },
            {
                name: 'Cloudflare',
                description: 'The DNS service I use with all my domains. Amazing product.',
                url: 'https://www.cloudflare.com/',
            },
            {
                name: 'AWS S3',
                description: 'Object storage for assets, backups, and long-term files.',
                url: 'https://aws.amazon.com/s3/',
            },
            {
                name: 'AWS EC2',
                description: 'Flexible compute for custom workloads and long-running services.',
                url: 'https://aws.amazon.com/ec2/',
            },
            {
                name: 'AWS Route 53',
                description: 'Domain management and routing when I need AWS-native DNS.',
                url: 'https://aws.amazon.com/route53/',
            },
            {
                name: 'AWS DynamoDB',
                description: 'Managed NoSQL storage for low-latency workloads.',
                url: 'https://aws.amazon.com/dynamodb/',
            },
            {
                name: 'AWS Amplify',
                description: 'Quick web app hosting with CI/CD and previews.',
                url: 'https://aws.amazon.com/amplify/',
            },
            {
                name: 'AWS CloudFront',
                description: 'CDN acceleration for global asset delivery.',
                url: 'https://aws.amazon.com/cloudfront/',
            },
            {
                name: 'Self-hosted DNS management (VPS)',
                description: 'Running my own DNS stack on a VPS for full control.',
                url: 'https://coredns.io/',
            },
            {
                name: 'Self-hosted Supabase',
                description: 'Self-hosted for flexibility and control over data.',
                url: 'https://supabase.com/docs/guides/self-hosting',
            },
            {
                name: 'Resend',
                description: 'The new email API for developers.',
                url: 'https://resend.com/',
            },
            {
                name: 'Vercel',
                description: 'Here is where I host all my websites. By far the best developer experience.',
                url: 'https://vercel.com/',
            },
            {
                name: 'Render.com',
                description: 'Extra compute for services I do not want on Vercel.',
                url: 'https://render.com/',
            },
        ],
    },
    {
        title: 'Reading',
        items: [
            {
                name: 'Audible',
                description: 'The perfect choice to listen to a book while running outside.',
                url: 'https://www.audible.com/',
            },
        ],
    },
    {
        title: 'AI Tools',
        items: [
            {
                name: 'OpenAI Codex',
                description: 'For fixes and planning.',
                url: 'https://openai.com/codex',
            },
            {
                name: 'Google Antigravity',
                description: 'For development assistance.',
                url: 'https://antigravity.google/',
            },
            {
                name: 'Claude',
                description: 'For analyzing and troubleshooting.',
                url: 'https://claude.ai/',
            },
        ],
    },
];

export const metadata = buildPageMetadata({
    title: 'Uses',
    description: "Tools, apps, and gear that power avrxt's daily workflow.",
    path: '/uses',
});

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
                                        {item.url ? (
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-sm font-semibold text-white transition-colors hover:text-emerald-200"
                                            >
                                                {item.name}
                                            </a>
                                        ) : (
                                            <p className="text-sm font-semibold text-white">{item.name}</p>
                                        )}
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
