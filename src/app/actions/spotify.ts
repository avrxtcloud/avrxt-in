'use server';

import { createClient } from '@/utils/supabase/server';
import { searchSpotify } from '@/lib/spotify';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/auth-checks';

export async function disconnectSpotifyAction() {
    const { authorized, error: authError, user } = await verifyAdmin();
    if (!authorized || !user?.id) return { error: `Unauthorized: ${authError}` };

    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('spotify_tokens')
            .delete()
            .eq('user_id', user.id);

        if (error) throw error;

        revalidatePath('/me/admin');
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function searchSpotifyAction(query: string) {
    const { authorized } = await verifyAdmin();
    if (!authorized) return { error: 'Unauthorized' };

    return await searchSpotify(query);
}

