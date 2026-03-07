import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-checks';

export async function GET(request: Request) {
  const { authorized } = await verifyAdmin();
  if (!authorized) {
    return NextResponse.redirect(new URL('/auth/login?source=admin&error=unauthorized_role', request.url));
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  const scope = 'user-read-currently-playing user-read-playback-state user-read-recently-played';

  if (!clientId || !redirectUri) {
    return NextResponse.redirect(new URL('/me/admin?error=spotify_env_missing', request.url));
  }

  const state = crypto.randomBytes(24).toString('hex');
  const spotifyUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirectUri)}&show_dialog=true&state=${state}`;

  const response = NextResponse.redirect(spotifyUrl);
  response.cookies.set('spotify_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 10,
    path: '/api/spotify',
  });

  return response;
}
