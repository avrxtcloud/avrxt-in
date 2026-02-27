import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkDiscordRole } from '@/lib/discord';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && user) {
            // Check if this is an admin login attempt by checking if the source matches our admin dashboard
            const isAdminRequest = next.startsWith('/me/admin');

            if (isAdminRequest) {
                // Check if user logged in via Discord
                const isDiscord = user.app_metadata?.provider === 'discord';
                if (!isDiscord) {
                    await supabase.auth.signOut();
                    return NextResponse.redirect(new URL('/auth/login?source=admin&error=discord_required', request.url));
                }

                // Verify Discord Role
                const discordId = user.user_metadata?.provider_id || user.user_metadata?.sub;

                if (!discordId) {
                    await supabase.auth.signOut();
                    return NextResponse.redirect(new URL('/auth/login?source=admin&error=metadata_missing', request.url));
                }

                const hasAccess = await checkDiscordRole(discordId);
                if (!hasAccess) {
                    await supabase.auth.signOut();
                    return NextResponse.redirect(new URL('/auth/login?source=admin&error=unauthorized_role', request.url));
                }
            }

            // Force the redirect to stay on the current origin
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(new URL('/auth/auth-error', request.url));
}
