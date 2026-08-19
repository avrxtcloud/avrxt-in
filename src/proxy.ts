import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

const MAINTENANCE_BYPASS_PREFIXES = [
    '/maintenance',
    '/me/admin',
    '/auth',
    '/api',
]

async function isMaintenanceModeEnabled() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) return false

    try {
        const response = await fetch(
            `${supabaseUrl.replace(/\/$/, '')}/rest/v1/me_config?key=eq.main_config&select=data`,
            {
                headers: {
                    apikey: anonKey,
                    Authorization: `Bearer ${anonKey}`,
                },
                cache: 'no-store',
            }
        )
        if (!response.ok) return false

        const rows = await response.json() as Array<{ data?: { site?: { maintenanceEnabled?: boolean } } }>
        return rows[0]?.data?.site?.maintenanceEnabled === true
    } catch (error) {
        console.error('[MAINTENANCE_CHECK_FAILED]', error)
        return false
    }
}

export default async function proxy(request: NextRequest) {
    const host = request.headers.get('host') || ''
    const url = request.nextUrl

    // Subdomain routing for status.avrxt.dev
    if (host.includes('status.avrxt.dev')) {
        // Map root, /incidents, and /maintenance to the status route group
        if (url.pathname === '/') {
            return NextResponse.rewrite(new URL('/status', request.url))
        }
        if (['/incidents', '/maintenance'].includes(url.pathname)) {
            return NextResponse.rewrite(new URL(`/status${url.pathname}`, request.url))
        }
        return NextResponse.next()
    }

    const hasSupabaseConfig = Boolean(
        process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    const sessionResponse = hasSupabaseConfig
        ? await updateSession(request)
        : NextResponse.next({ request })

    const bypassesMaintenance = MAINTENANCE_BYPASS_PREFIXES.some(prefix =>
        url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)
    )

    if (!bypassesMaintenance && await isMaintenanceModeEnabled()) {
        const maintenanceUrl = url.clone()
        maintenanceUrl.pathname = '/maintenance'
        maintenanceUrl.search = ''
        const redirectResponse = NextResponse.redirect(maintenanceUrl)
        sessionResponse.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie))
        return redirectResponse
    }

    return sessionResponse
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
