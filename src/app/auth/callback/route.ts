import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { checkDiscordRole } from '@/lib/discord';

function getSafeNextPath(nextValue: string | null): string {
  if (!nextValue) return '/';
  if (!nextValue.startsWith('/')) return '/';
  if (nextValue.startsWith('//')) return '/';
  return nextValue;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeNextPath(searchParams.get('next'));
  const loginErrorUrl = (error: string) => {
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('source', 'admin');
    url.searchParams.set('next', next);
    url.searchParams.set('error', error);
    return url;
  };

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user && data.session) {
      const isAdminPath = next.startsWith('/me/admin') || next.startsWith('/docs/admin');
      const isSourceAdmin = searchParams.get('source') === 'admin';
      const isAdminRequest = isAdminPath || isSourceAdmin;

      console.log(`[AUTH_CALLBACK] Login for ${data.user.email}. Path: ${next}. AdminRequest: ${isAdminRequest}`);

      if (isAdminRequest) {
        const discordIdentity = data.user.identities?.find(identity => identity.provider === 'discord');
        const isDiscord = data.user.app_metadata?.provider === 'discord' || Boolean(discordIdentity);
        if (!isDiscord) {
          await supabase.auth.signOut();
          return NextResponse.redirect(loginErrorUrl('discord_required'));
        }

        const discordId = discordIdentity?.identity_data?.provider_id
          || discordIdentity?.identity_data?.sub
          || data.user.user_metadata?.provider_id
          || data.user.user_metadata?.sub;
        const providerToken = data.session.provider_token;

        if (!discordId || !providerToken) {
          await supabase.auth.signOut();
          return NextResponse.redirect(loginErrorUrl('metadata_missing'));
        }

        const hasAccess = await checkDiscordRole(discordId, providerToken);

        if (!hasAccess) {
          await supabase.auth.signOut();
          return NextResponse.redirect(loginErrorUrl('unauthorized_role'));
        }

        console.log(`[AUTH_CALLBACK] Discord verification successful for ${data.user.email}. Tagging as admin...`);
        const { createAdminClient } = await import('@/utils/supabase/admin');
        const adminClient = createAdminClient();
        const { error: updateError } = await adminClient.auth.admin.updateUserById(data.user.id, {
          app_metadata: { ...data.user.app_metadata, role: 'admin' },
        });

        if (updateError) {
          console.error(`[AUTH_CALLBACK] FAILED to tag user ${data.user.email} as admin:`, updateError);
          await supabase.auth.signOut();
          return NextResponse.redirect(loginErrorUrl('admin_session_failed'));
        } else {
          console.log(`[AUTH_CALLBACK] User ${data.user.email} is now a VERIFIED ADMIN in the database.`);
          // CRITICAL: Refresh the session so the JWT is re-issued with the new app_metadata.
          // Without this, the browser has the OLD JWT (without role:'admin'), causing the
          // protectAdminPage() check to fail and redirect back to login (the "login loop").
          const { data: refreshedSession, error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError || refreshedSession.user?.app_metadata?.role !== 'admin') {
            console.error(`[AUTH_CALLBACK] Session refresh failed:`, refreshError);
            await supabase.auth.signOut();
            return NextResponse.redirect(loginErrorUrl('admin_session_failed'));
          } else {
            console.log(`[AUTH_CALLBACK] Session refreshed — new JWT now includes admin role.`);
          }
        }
      }

      return NextResponse.redirect(new URL(next, request.url));
    }
  }

  return NextResponse.redirect(loginErrorUrl('oauth_callback_failed'));
}
