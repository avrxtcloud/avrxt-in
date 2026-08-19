import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-checks';
import { createAdminClient } from '@/utils/supabase/admin';
import { getSpotifyRedirectUri } from '@/lib/spotify-oauth';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

function redirectWithStateCleanup(request: Request, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.cookies.set('spotify_oauth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/api/spotify',
  });
  return response;
}

export async function GET(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.redirect(new URL('/auth/login?source=admin&error=unauthorized_role', request.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = getSpotifyRedirectUri(request.url);

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/me/admin?error=spotify_env_missing', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const returnedState = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('spotify_oauth_state')?.value;

  if (!code) {
    return redirectWithStateCleanup(request, '/me/admin?error=no_code');
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    return redirectWithStateCleanup(request, '/me/admin?error=state_mismatch');
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const tokenResponse = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!tokenResponse.ok || !tokenData.access_token || !tokenData.expires_in) {
    console.error('[SPOTIFY_TOKEN_EXCHANGE_FAILED]', tokenResponse.status, tokenData.error, tokenData.error_description);
    return redirectWithStateCleanup(request, '/me/admin?error=token_fetch_failed');
  }

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from('spotify_tokens')
    .select('refresh_token')
    .limit(1)
    .maybeSingle();

  const refreshToken = tokenData.refresh_token || existing?.refresh_token;
  if (!refreshToken) {
    return redirectWithStateCleanup(request, '/me/admin?error=refresh_token_missing');
  }

  await supabase.from('spotify_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const { error } = await supabase.from('spotify_tokens').insert({
    access_token: tokenData.access_token,
    refresh_token: refreshToken,
    expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
  });

  if (error) {
    console.error('SPOTIFY DB SAVE ERROR:', error);
    return redirectWithStateCleanup(request, `/me/admin?error=db_save_failed&msg=${encodeURIComponent(error.message)}`);
  }

  return redirectWithStateCleanup(request, '/me/admin?success=spotify_connected');
}
