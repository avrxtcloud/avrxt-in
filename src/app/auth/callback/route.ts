import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Force the redirect to stay on the current origin (e.g. localhost or 127.0.0.1)
            // instead of falling back to the Supabase "Site URL"
            return NextResponse.redirect(new URL(next, request.url));
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(new URL('/auth/auth-error', request.url));
}
