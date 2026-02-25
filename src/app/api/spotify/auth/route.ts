import { NextResponse } from 'next/server';

export async function GET() {
    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'https://127.0.0.1:3000/api/spotify/callback';
    const scope = 'user-read-currently-playing user-read-playback-state user-read-recently-played';

    console.log('--- SPOTIFY AUTH ATTEMPT ---');
    console.log('Using Redirect URI:', redirect_uri);

    if (!client_id) {
        console.error('CRITICAL: SPOTIFY_CLIENT_ID is missing!');
    }

    const spotifyUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(redirect_uri)}&show_dialog=true`;

    return NextResponse.redirect(spotifyUrl);
}
