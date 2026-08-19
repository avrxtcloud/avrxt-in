'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { moderateGuestbookMessage } from '@/lib/guestbook-moderation';
import { getAuthUser } from '@/lib/openauth';

export async function getMessages() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('guestbook')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data };
}

export async function postMessage(message: string, userName: string, userAvatar: string) {
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) return { error: 'You must be logged in to post.' };

    const normalizedMessage = message.trim();
    if (!normalizedMessage) return { error: 'Message cannot be empty.' };

    const moderation = await moderateGuestbookMessage(normalizedMessage);
    if (moderation.blocked) {
        return {
            error: `Message blocked by safety policy (${moderation.reasons.join(', ')}).`
        };
    }

    const { error } = await supabase
        .from('guestbook')
        .insert({
            message: normalizedMessage,
            user_id: user.id,
            user_name: userName,
            user_avatar: userAvatar
        });

    if (error) return { error: error.message };
    revalidatePath('/guestbook');
    return { success: true };
}

export async function updateMessage(id: string, message: string) {
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) return { error: 'Unauthorized' };

    const normalizedMessage = message.trim();
    if (!normalizedMessage) return { error: 'Message cannot be empty.' };

    const moderation = await moderateGuestbookMessage(normalizedMessage);
    if (moderation.blocked) {
        return {
            error: `Message blocked by safety policy (${moderation.reasons.join(', ')}).`
        };
    }

    const { error } = await supabase
        .from('guestbook')
        .update({ message: normalizedMessage, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    revalidatePath('/guestbook');
    return { success: true };
}

export async function deleteMessage(id: string) {
    const supabase = await createClient();
    const user = await getAuthUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .from('guestbook')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) return { error: error.message };
    revalidatePath('/guestbook');
    return { success: true };
}

export async function signInWithGithub() {
    return { url: '/auth/start?provider=github&next=%2Fguestbook', error: undefined };
}
