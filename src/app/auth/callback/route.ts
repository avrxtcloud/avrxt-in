import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkDiscordRole } from '@/lib/discord';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user && data.session) {
            // Check if this is an admin login attempt by checking if the source matches our admin dashboard
            const isAdminRequest = next.startsWith('/me/admin');

            if (isAdminRequest) {
                // Check if user logged in via Discord
                const isDiscord = data.user.app_metadata?.provider === 'discord';
                if (!isDiscord) {
                    await supabase.auth.signOut();
                    return NextResponse.redirect(new URL('/auth/login?source=admin&error=discord_required', request.url));
                }

                // Verify Discord Role using the provider_token from the session
                const discordId = data.user.user_metadata?.provider_id || data.user.user_metadata?.sub;
                const providerToken = data.session.provider_token;

                if (!discordId || !providerToken) {
                    await supabase.auth.signOut();
                    return NextResponse.redirect(new URL('/auth/login?source=admin&error=metadata_missing', request.url));
                }

                const hasAccess = await checkDiscordRole(discordId, providerToken);

                if (!hasAccess) {
                    await supabase.auth.signOut();
                    return NextResponse.redirect(new URL('/auth/login?source=admin&error=unauthorized_role', request.url));
                }

                // If they have the role, we "tag" them as an admin in Supabase app_metadata
                // This allows us to check their admin status on every page without calling Discord again
                const { createAdminClient } = await import('@/utils/supabase/admin');
                const adminClient = createAdminClient();
                await adminClient.auth.admin.updateUserById(data.user.id, {
                    app_metadata: { ...data.user.app_metadata, role: 'admin' }
                });
            }

            // Force the redirect to stay on the current origin
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(new URL('/auth/auth-error', request.url));
}
