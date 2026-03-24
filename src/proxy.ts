import { NextResponse, type NextRequest } from 'next/server'

export default async function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const url = request.nextUrl

    // Subdomain routing for status.avrxt.in
    if (host.includes('status.avrxt.in')) {
        // Map root, /incidents, and /maintenance to the status route group
        if (url.pathname === '/') {
            return NextResponse.rewrite(new URL('/status', request.url))
        }
        if (['/incidents', '/maintenance'].includes(url.pathname)) {
            return NextResponse.rewrite(new URL(`/status${url.pathname}`, request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (internal API routes)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
