'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { moderateGuestbookMessage } from '@/lib/guestbook-moderation';

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
    const { data: { user } } = await supabase.auth.getUser();

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
    const { data: { user } } = await supabase.auth.getUser();

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
    const { data: { user } } = await supabase.auth.getUser();

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
    const supabase = await createClient();

    // Dynamically detect origin to prevent "undefined" errors if ENV is missing
    let origin = process.env.NEXT_PUBLIC_API_URL;

    if (!origin) {
        const { headers } = await import('next/headers');
        const headerList = await headers();
        const host = headerList.get('host');
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        origin = `${protocol}://${host}`;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: `${origin}/auth/callback?next=/guestbook`,
        },
    });

    return { url: data.url, error: error?.message };
}
