'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { MeConfig, defaultMeConfig } from '@/lib/me-config';
import { verifyAdmin } from '@/lib/auth-checks';

export async function getMeConfigAction(): Promise<MeConfig> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('me_config')
        .select('data')
        .eq('key', 'main_config')
        .single();

    if (error || !data) {
        console.warn('Error fetching me_config, returning default:', error);
        return defaultMeConfig;
    }

    return data.data as MeConfig;
}

export async function saveMeConfigAction(config: MeConfig) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    const supabase = await createClient();

    const { error } = await supabase
        .from('me_config')
        .upsert({
            key: 'main_config',
            data: config,
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/me');
    revalidatePath('/me/admin');
    return { success: true };
}
