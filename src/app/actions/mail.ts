'use server';

import { sql } from '@/lib/db';
import { sendMail } from '@/lib/ses';
import { verifyAdmin } from '@/lib/auth-checks';
import { revalidatePath } from 'next/cache';

export async function broadcastEmailAction(subject: string, html: string) {
    const { authorized, user } = await verifyAdmin();
    if (!authorized) return { success: false, error: 'Unauthorized' };

    try {
        const subscribers = await sql`
            SELECT email, unsubscribe_token FROM newsletter_subscribers WHERE status = 'active'
        `;

        if (subscribers.length === 0) {
            return { success: false, error: 'No active subscribers found' };
        }

        // Send emails individually to ensure and handle List-Unsubscribe per user
        // Note: For large lists (>1000), consider using a background job/queue
        const sendPromises = subscribers.map(sub => 
            sendMail({
                to: sub.email,
                subject: subject,
                html: html,
                unsubscribeToken: sub.unsubscribe_token
            }).catch(err => {
                console.error(`[BROADCAST_ERROR] Failed to send to ${sub.email}:`, err);
                return null;
            })
        );

        const results = await Promise.all(sendPromises);
        const successCount = results.filter(r => r !== null).length;

        // Record the broadcast in history
        await sql`
            INSERT INTO mail_broadcasts (subject, content_html, recipient_count, created_by)
            VALUES (${subject}, ${html}, ${successCount}, ${user?.id || null})
        `;

        revalidatePath('/mail/admin');
        
        return { 
            success: true, 
            count: successCount,
            totalAttempted: subscribers.length 
        };
    } catch (error) {
        console.error('BROADCAST_ACTION_ERROR:', error);
        return { success: false, error: 'Critical system failure during broadcast' };
    }
}
