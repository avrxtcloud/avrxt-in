import { createAdminClient } from '@/utils/supabase/admin';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export async function getSpotifyTokens() {
    const supabase = createAdminClient();
    const { data: tokens, error } = await supabase
        .from('spotify_tokens')
        .select('*')
        .single();

    if (error || !tokens) return null;
    return tokens;
}

export async function refreshAccessToken(refresh_token: string) {
    const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token,
        }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error('Failed to refresh token');

    const supabase = createAdminClient();
    const { error: updateError } = await supabase
        .from('spotify_tokens')
        .update({
            access_token: data.access_token,
            expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        })
        .match({ refresh_token });

    if (updateError) console.error('Error updating tokens in DB:', updateError);

    return data.access_token;
}

export async function getNowPlaying() {
    const tokens = await getSpotifyTokens();
    if (!tokens) return { isPlaying: false };

    let accessToken = tokens.access_token;
    const expiresAt = new Date(tokens.expires_at).getTime();

    if (Date.now() > expiresAt - 60000) {
        accessToken = await refreshAccessToken(tokens.refresh_token);
    }

    const response = await fetch(NOW_PLAYING_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (response.status === 204 || response.status > 400) {
        return { isPlaying: false };
    }

    const song = await response.json();

    // Save to history if playing
    if (song.is_playing) {
        const supabase = createAdminClient();
        await supabase.from('spotify_history').upsert({
            song_name: song.item.name,
            artist: song.item.artists.map((_artist: any) => _artist.name).join(', '),
            cover_url: song.item.album.images[0].url,
            played_at: new Date().toISOString()
        }, { onConflict: 'song_name, artist' });
    }

    return {
        isPlaying: song.is_playing,
        title: song.item.name,
        artist: song.item.artists.map((_artist: any) => _artist.name).join(', '),
        album: song.item.album.name,
        albumImageUrl: song.item.album.images[0].url,
        songUrl: song.item.external_urls.spotify,
        progressMs: song.progress_ms,
        durationMs: song.item.duration_ms,
    };
}
