import { NextRequest, NextResponse } from 'next/server';
import { getOpenAuthClient } from '@/lib/openauth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get('provider');
  const nextValue = request.nextUrl.searchParams.get('next') || '/';
  const next = nextValue.startsWith('/') && !nextValue.startsWith('//') ? nextValue : '/';
  if (provider !== 'discord' && provider !== 'github') return NextResponse.redirect(new URL('/auth/login?error=unsupported_provider', request.url));
  const callback = new URL('/auth/callback', request.nextUrl.origin);
  callback.searchParams.set('next', next);
  const { url } = await getOpenAuthClient().authorize(callback.toString(), 'code', { provider });
  return NextResponse.redirect(url);
}
