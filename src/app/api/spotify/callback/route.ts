import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
    const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
    const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.redirect(new URL('/me/admin?error=no_code', request.url));
    }

    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirect_uri!,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        return NextResponse.redirect(new URL('/me/admin?error=token_fetch_failed', request.url));
    }

    const supabase = await createClient();

    // Clear existing tokens (assuming single user/admin)
    await supabase.from('spotify_tokens').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const { error } = await supabase.from('spotify_tokens').insert({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
    });

    if (error) {
        console.error('--- SUPABASE DB SAVE ERROR ---');
        console.error('Message:', error.message);
        console.error('Code:', error.code);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        return NextResponse.redirect(new URL(`/me/admin?error=db_save_failed&msg=${encodeURIComponent(error.message)}`, request.url));
    }

    return NextResponse.redirect(new URL('/me/admin?success=spotify_connected', request.url));
}
