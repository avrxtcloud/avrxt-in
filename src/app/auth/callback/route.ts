import { NextResponse } from 'next/server';

/**
 * Legacy Supabase Auth callback route.
 * Better Auth handles callbacks automatically via its internal route handlers.
 * Redirecting any stray traffic to the root.
 */
export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/', request.url));
}
