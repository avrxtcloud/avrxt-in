import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-checks';
import { createClient } from '@/utils/supabase/server';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

async function redirectWithStateCleanup(request: Request, path: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  const cookieStore = await cookies();
  cookieStore.set('spotify_oauth_state', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/api/spotify',
  });
  return response;
}

export async function GET(request: Request) {
  const { authorized, user } = await verifyAdmin();
  if (!authorized || !user?.id) {
    return NextResponse.redirect(new URL('/auth/login?source=admin&error=unauthorized_role', request.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/me/admin?error=spotify_env_missing', request.url));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const returnedState = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('spotify_oauth_state')?.value;

  if (!code) {
    return await redirectWithStateCleanup(request, '/me/admin?error=no_code');
  }

  if (!returnedState || !storedState || returnedState !== storedState) {
    return await redirectWithStateCleanup(request, '/me/admin?error=state_mismatch');
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
  };

  if (!tokenResponse.ok || !tokenData.access_token || !tokenData.expires_in) {
    return await redirectWithStateCleanup(request, '/me/admin?error=token_fetch_failed');
  }

  try {
    const supabase = await createClient();

    // Get existing refresh token if not provided in this flow
    const { data: existing } = await supabase
        .from('spotify_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

    const refreshToken = tokenData.refresh_token || existing?.refresh_token;
    if (!refreshToken) {
      return await redirectWithStateCleanup(request, '/me/admin?error=refresh_token_missing');
    }

    // Upsert tokens for the user
    const { error: dbError } = await supabase
        .from('spotify_tokens')
        .upsert({
            user_id: user.id,
            access_token: tokenData.access_token,
            refresh_token: refreshToken,
            expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

    if (dbError) throw dbError;

    return await redirectWithStateCleanup(request, '/me/admin?success=spotify_connected');
  } catch (error: any) {
    console.error('SPOTIFY SUPABASE SAVE ERROR:', error);
    return await redirectWithStateCleanup(request, `/me/admin?error=db_save_failed&msg=${encodeURIComponent(error.message)}`);
  }
}

