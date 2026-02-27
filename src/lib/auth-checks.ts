
import { createClient } from '@/utils/supabase/server';
import { checkDiscordRole } from '@/lib/discord';
import { redirect } from 'next/navigation';

export async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { authorized: false, error: 'not_logged_in' };
    }

    const isDiscord = user.app_metadata?.provider === 'discord';
    if (!isDiscord) {
        return { authorized: false, error: 'discord_required' };
    }

    const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub;
    if (!discordId) {
        return { authorized: false, error: 'metadata_missing' };
    }

    const hasAccess = await checkDiscordRole(discordId);
    if (!hasAccess) {
        return { authorized: false, error: 'unauthorized_role' };
    }

    return { authorized: true, user };
}

export async function protectAdminPage() {
    const { authorized, error } = await verifyAdmin();
    if (!authorized) {
        redirect(`/auth/login?source=admin&error=${error}`);
    }
}
