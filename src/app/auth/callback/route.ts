import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkDiscordRole } from '@/utils/discord';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/docs/admin';

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.session) {
            // Check for Discord Role
            // The provider_token is usually available in the session returned by exchangeCodeForSession
            // Note: This requires Supabase to be configured to return the provider token.
            const providerToken = data.session.provider_token;

            if (providerToken) {
                const guildId = process.env.DISCORD_GUILD_ID;
                const roleId = process.env.DISCORD_ROLE_ID;

                if (guildId && roleId) {
                    const { authorized, error: rbacError } = await checkDiscordRole(providerToken, guildId, roleId);

                    if (!authorized) {
                        await supabase.auth.signOut();
                        return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent(rbacError || 'Unauthorized')}`);
                    }

                    // Authorized
                    return NextResponse.redirect(`${origin}${next}`);
                } else {
                    // If vars are missing, log error and maybe allow or block? 
                    // Assuming block for safety, or allow if not configured? 
                    // User specified "required role avrxt.in role my server", so we MUST block if not configured.
                    await supabase.auth.signOut();
                    return NextResponse.redirect(`${origin}/auth/login?error=Server configuration error`);
                }
            } else {
                // No provider token found
                // This can happen if the user logged in previously or config is wrong.
                // Force sign out and error.
                await supabase.auth.signOut();
                return NextResponse.redirect(`${origin}/auth/login?error=Could not verify Discord membership`);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/login?error=Auth failed`);
}
