import { buildPageMetadata } from '@/lib/page-metadata';
import { protectAdminPage } from '@/lib/auth-checks';
import MailAdminClient from './MailAdminClient';
import { sql } from '@/lib/db';

export const metadata = buildPageMetadata({
    title: 'Mail Admin | Broadcast System',
    description: 'Managed newsletter broadcasts and subscribers.',
    noIndex: true,
});

export default async function MailAdminPage() {
    await protectAdminPage();

    // Get stats
    const stats = await sql`
        SELECT 
            COUNT(*) FILTER (WHERE status = 'active') as active_count,
            COUNT(*) FILTER (WHERE status = 'unverified') as unverified_count,
            COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count
        FROM newsletter_subscribers
    `;

    // Get recent broadcasts
    const broadcasts = await sql`
        SELECT subject, sent_at, recipient_count 
        FROM mail_broadcasts 
        ORDER BY sent_at DESC 
        LIMIT 10
    `;

    return (
        <MailAdminClient 
            stats={stats[0] as any} 
            recentBroadcasts={broadcasts as any}
        />
    );
}
