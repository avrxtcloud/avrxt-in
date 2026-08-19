import { getAuthUser } from '@/lib/openauth';
import GuestbookClient from './GuestbookClient';
import { getMessages } from '@/app/actions/guestbook';
import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/page-metadata';

type PageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const resolved = await Promise.resolve(searchParams ?? {});
    const share = typeof resolved.share === 'string' ? resolved.share : undefined;
    const path = share ? `/guestbook?share=${share}` : '/guestbook';

    return buildPageMetadata({
        title: 'Guestbook',
        description: 'Leave Your Foot Print Here.',
        keywords: ['guestbook', 'avrxt community', 'digital footprint', 'developer messages', 'Leave Your Foot Print Here'],
        path,
    });
}

export default async function GuestbookPage() {
    const user = await getAuthUser();
    const { data: messages = [] } = await getMessages() as { data: any[] };

    return (
        <main className="min-h-screen bg-black text-white selection:bg-white/10 relative overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1a1a1a_0%,#000_70%)]"></div>
            </div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 pt-32 pb-24">
                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 font-mono italic gradient-heading">Guestbook</h1>
                    <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Leave a footprint or just say hi.</p>
                </header>

                <GuestbookClient user={user} initialMessages={messages} />
            </div>
        </main>
    );
}
