import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const host = request.headers.get('host') || '';
    const pathname = url.pathname;

    // 1. Status Subdomain Logic (formerly in proxy.ts)
    if (host.includes('status.avrxt.in')) {
        // Map root, /incidents, and /maintenance to the status route group
        if (pathname === '/') {
            return NextResponse.rewrite(new URL('/status', request.url));
        }
        if (['/incidents', '/maintenance'].includes(pathname)) {
            return NextResponse.rewrite(new URL(`/status${pathname}`, request.url));
        }
    }

    // 2. Auth Subdomain Logic
    if (host.includes('auth.avrxt.in')) {
        // Allow the specialized admin login route
        if (pathname === '/login/admin') {
            return NextResponse.next();
        }
        
        // Redirect root auth domain to main site
        if (pathname === '/' || pathname === '') {
            return NextResponse.redirect('https://www.avrxt.in');
        }

        // Allow API routes for better-auth
        if (pathname.startsWith('/api/auth')) {
            return NextResponse.next();
        }
    }

    // Default: Continue normally
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public images
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};

