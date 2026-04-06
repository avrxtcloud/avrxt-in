'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { MeConfig, defaultMeConfig } from '@/lib/me-config';
import { verifyAdmin } from '@/lib/auth-checks';

function normalizeMeConfig(config: MeConfig): MeConfig {
    const normalized: MeConfig = {
        ...config,
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

/**
 * Fetch the main site configuration from Supabase.
 */
export async function getMeConfigAction(): Promise<MeConfig> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('me_config')
            .select('*')
            .eq('key', 'main_config')
            .single();

        if (error || !data) {
            console.warn('No me_config found in Supabase (or error), returning defaults.');
            return defaultMeConfig;
        }

        return normalizeMeConfig(data.data as MeConfig);
    } catch (error) {
        console.error('Error fetching me_config:', error);
        return defaultMeConfig;
    }
}

/**
 * Save/Update the main site configuration in Supabase.
 * Requires admin authorization via Better Auth.
 */
export async function saveMeConfigAction(config: MeConfig) {
    const { authorized, error: authError } = await verifyAdmin();
    if (!authorized) {
        return { error: `Unauthorized: ${authError}` };
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase
            .from('me_config')
            .upsert({
                key: 'main_config',
                data: normalizeMeConfig(config),
                updated_at: new Date().toISOString()
            }, { onConflict: 'key' });

        if (error) throw error;

        revalidatePath('/me');
        revalidatePath('/me/admin');
        return { success: true };
    } catch (error: any) {
        console.error('Save config error:', error);
        return { error: error.message };
    }
}

