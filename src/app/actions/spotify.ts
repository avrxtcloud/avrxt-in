'use server'

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function disconnectSpotifyAction() {
    const supabase = await createClient();

    // Check if user is authenticated (admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase.from('spotify_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/me/admin');
    return { success: true };
}
