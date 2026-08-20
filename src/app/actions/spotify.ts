'use server';

import { searchSpotify } from '@/lib/spotify';
import { revalidatePath } from 'next/cache';
import { verifyAdmin } from '@/lib/auth-checks';
import { createAdminClient } from '@/utils/supabase/admin';

export async function disconnectSpotifyAction() {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) return { error: `Unauthorized: ${authError}` };

    const supabase = createAdminClient();

    const { error } = await supabase.from('spotify_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/me/admin');
    return { success: true };
}

export async function searchSpotifyAction(query: string) {
    const { authorized } = await verifyAdmin();
    if (!authorized) return { error: 'Unauthorized' };

    return await searchSpotify(query);
}
