
import { createClient } from '@/utils/supabase/server';
import { checkDiscordRole } from '@/lib/discord';
import { redirect } from 'next/navigation';

export async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { authorized: false, error: 'not_logged_in' };
    }

    // 1. Check if the user is already tagged as an admin in Supabase metadata
    // This is the fastest and preferred method
    if (user.app_metadata?.role === 'admin') {
        return { authorized: true, user };
    }

    // 2. Fallback: If not tagged, check if they are currently logged in via Discord 
    // and try a live role check (requires bot token)
    const isDiscord = user.app_metadata?.provider === 'discord';
    if (isDiscord) {
        const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub;
        if (discordId) {
            const hasAccess = await checkDiscordRole(discordId);
            if (hasAccess) {
                return { authorized: true, user };
            }
        }
    }

    return { authorized: false, error: 'unauthorized_role' };
}

export async function protectAdminPage() {
    const { authorized, error } = await verifyAdmin();
    if (!authorized) {
        redirect(`/auth/login?source=admin&error=${error}`);
    }
}
