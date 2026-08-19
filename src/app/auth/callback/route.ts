import { NextRequest, NextResponse } from 'next/server';
import { getOpenAuthClient, setAuthTokens } from '@/lib/openauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const nextValue = request.nextUrl.searchParams.get('next') || '/';
  const next = nextValue.startsWith('/') && !nextValue.startsWith('//') ? nextValue : '/';
  if (!code) return NextResponse.redirect(new URL('/auth/login?source=admin&error=oauth_callback_failed', request.url));
  const callback = new URL('/auth/callback', request.nextUrl.origin);
  callback.searchParams.set('next', next);
  const exchanged = await getOpenAuthClient().exchange(code, callback.toString());
  if (exchanged.err) {
    console.error('[OPENAUTH_CALLBACK]', exchanged.err);
    return NextResponse.redirect(new URL('/auth/login?source=admin&error=oauth_callback_failed', request.url));
  }
  await setAuthTokens(exchanged.tokens.access, exchanged.tokens.refresh);
  return NextResponse.redirect(new URL(next, request.url));
}
