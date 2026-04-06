'use server';

import { createClient } from '@/utils/supabase/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { moderateGuestbookMessage } from '@/lib/guestbook-moderation';

/**
 * Fetch all guestbook messages from Supabase
 */
export async function getMessages() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('guestbook')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Map back to camelCase for the frontend if needed, but the frontend currently uses underscored fields based on previous view
        // Actually, the previous view of GuestbookClient showed it expecting camelCase in my updated version.
        const mappedData = (data || []).map(msg => ({
            id: msg.id,
            message: msg.message,
            userId: msg.user_id,
            userName: msg.user_name,
            userAvatar: msg.user_avatar,
            createdAt: msg.created_at,
            updatedAt: msg.updated_at
        }));

        return { data: mappedData };
    } catch (error: any) {
        console.error('Error fetching guestbook:', error);
        return { error: error.message };
    }
}

/**
 * Post a new message to Supabase
 */
export async function postMessage(message: string, userName: string, userAvatar: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) return { error: 'You must be logged in to post.' };

    const normalizedMessage = message.trim();
    if (!normalizedMessage) return { error: 'Message cannot be empty.' };

    // Safety moderation
    const moderation = await moderateGuestbookMessage(normalizedMessage);
    if (moderation.blocked) {
        return {
            error: `Message blocked by safety policy (${moderation.reasons.join(', ')}).`
        };
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('guestbook')
            .insert([{
                id: crypto.randomUUID(),
                message: normalizedMessage,
                user_id: session.user.id,
                user_name: userName,
                user_avatar: userAvatar,
            }]);

        if (error) throw error;

        revalidatePath('/guestbook');
        return { success: true };
    } catch (error: any) {
        console.error('Post guestbook error:', error);
        return { error: error.message };
    }
}

/**
 * Update an existing message in Supabase
 */
export async function updateMessage(id: string, message: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) return { error: 'Unauthorized' };

    const normalizedMessage = message.trim();
    if (!normalizedMessage) return { error: 'Message cannot be empty.' };

    const moderation = await moderateGuestbookMessage(normalizedMessage);
    if (moderation.blocked) {
        return {
            error: `Message blocked by safety policy (${moderation.reasons.join(', ')}).`
        };
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('guestbook')
            .update({ 
                message: normalizedMessage, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) throw error;

        revalidatePath('/guestbook');
        return { success: true };
    } catch (error: any) {
        console.error('Update guestbook error:', error);
        return { error: error.message };
    }
}

/**
 * Delete a message from Supabase
 */
export async function deleteMessage(id: string) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session || !session.user) return { error: 'Unauthorized' };

    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('guestbook')
            .delete()
            .eq('id', id)
            .eq('user_id', session.user.id);

        if (error) throw error;

        revalidatePath('/guestbook');
        return { success: true };
    } catch (error: any) {
        console.error('Delete guestbook error:', error);
        return { error: error.message };
    }
}

