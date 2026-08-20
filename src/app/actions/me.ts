'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { MeConfig, defaultMeConfig } from '@/lib/me-config';
import { verifyAdmin } from '@/lib/auth-checks';
import { createAdminClient } from '@/utils/supabase/admin';


function normalizeMeConfig(config: MeConfig): MeConfig {
    const normalized: MeConfig = {
        ...config,
        site: {
            maintenanceEnabled: config.site?.maintenanceEnabled === true,
        },
        profile: { ...config.profile },
        music: { ...config.music },
        links: Array.isArray(config.links) ? config.links : [],
        gallery: Array.isArray(config.gallery) ? config.gallery : [],
        resources: Array.isArray(config.resources) ? config.resources : [],
        widgets: config.widgets ? { ...config.widgets } : config.widgets,
    };

    normalized.music.audioUrl = (normalized.music.audioUrl || '').trim();
    normalized.music.youtubeVideoId = (normalized.music.youtubeVideoId || '').trim();

    // Prefer YouTube when a videoId is set (avoids stale audioUrl breaking playback)
    if (normalized.music.youtubeVideoId) {
        normalized.music.audioUrl = '';
    }

    return normalized;
}

export async function getMeConfigAction(): Promise<MeConfig> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn('Supabase is not configured, returning default me_config.');
        return defaultMeConfig;
    }

    try {
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

        return normalizeMeConfig(data.data as MeConfig);
    } catch (error) {
        console.warn('Unable to fetch me_config, returning default:', error);
        return defaultMeConfig;
    }
}

export async function saveMeConfigAction(config: MeConfig) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    const supabase = createAdminClient();

    const { error } = await supabase
        .from('me_config')
        .upsert({
            key: 'main_config',
            data: normalizeMeConfig(config),
            updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/me');
    revalidatePath('/me/admin');
    revalidatePath('/maintenance');
    return { success: true };
}
