
import { createClient } from '@/utils/supabase/server';
import { checkDiscordRole } from '@/lib/discord';
import { redirect } from 'next/navigation';

export async function verifyAdmin() {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.warn(`[AUTH_CHECK] No user found: ${userError?.message || 'Unauthorized'}`);
        return { authorized: false, error: 'not_logged_in' };
    }

    // 1. Check if the user is tagged as admin in the current session (JWT)
    if (user.app_metadata?.role === 'admin') {
        return { authorized: true, user };
    }

    // 2. STALE SESSION FIX: If not in JWT, check the DATABASE directly
    // This is needed because metadata updates don't show up in the current session immediately
    try {
        console.log(`[AUTH_CHECK] Checking DB for user: ${user.email} (${user.id})`);
        const { createAdminClient } = await import('@/utils/supabase/admin');
        const adminClient = createAdminClient();
        const { data: { user: dbUser }, error: dbError } = await adminClient.auth.admin.getUserById(user.id);

        if (!dbError && dbUser?.app_metadata?.role === 'admin') {
            console.log('[AUTH_CHECK] Success! DB confirmed admin status bypassing stale JWT.');
            return { authorized: true, user: dbUser };
        }

        if (dbError) console.error('[AUTH_CHECK] DB Fetch Error:', dbError);
    } catch (e) {
        console.error('[AUTH_CHECK] Service Role Client failed:', e);
    }

    // 3. Last Resort Fallback: Check Discord Live (Only works if Bot Token is set)
    const isDiscord = user.app_metadata?.provider === 'discord';
    if (isDiscord) {
        const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub;
        if (discordId) {
            const hasAccess = await checkDiscordRole(discordId);
            if (hasAccess) {
                console.log('[AUTH_CHECK] Success via Live Discord Fallback.');
                return { authorized: true, user };
            }
        }
    }

    console.warn(`[AUTH_CHECK] Access Denied for ${user.email}. Role 'admin' not found in metadata.`);
    return { authorized: false, error: 'unauthorized_role' };
}

export async function protectAdminPage() {
    const { authorized, error } = await verifyAdmin();
    if (!authorized) {
        redirect(`/auth/login?source=admin&error=${error}`);
    }
}
