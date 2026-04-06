import { createClient } from '@/utils/supabase/server';

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;

export async function getSpotifyTokens() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('spotify_tokens')
            .select('*')
            .single();

        if (error || !data) return null;
        
        return {
            id: data.id,
            userId: data.user_id,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            expiresAt: data.expires_at,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        };
    } catch (error) {
        console.error('Error fetching Spotify tokens:', error);
        return null;
    }
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

    try {
        const supabase = await createClient();
        await supabase
            .from('spotify_tokens')
            .update({
                access_token: data.access_token,
                expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('refresh_token', refresh_token);
    } catch (error) {
        console.error('Error updating tokens in Supabase:', error);
    }

    return data.access_token;
}

export async function getNowPlaying() {
    const tokens = await getSpotifyTokens();
    if (!tokens) return { isPlaying: false };

    let accessToken = tokens.accessToken;
    const expiresAt = new Date(tokens.expiresAt).getTime();

    if (Date.now() > expiresAt - 60000) {
        accessToken = await refreshAccessToken(tokens.refreshToken);
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
        try {
            const supabase = await createClient();
            await supabase
                .from('spotify_history')
                .insert([{
                    song_name: song.item.name,
                    artist: song.item.artists.map((_artist: any) => _artist.name).join(', '),
                    cover_url: song.item.album.images[0].url,
                    played_at: new Date().toISOString()
                }]);
        } catch (error) {
            console.error('Error saving song history to Supabase:', error);
        }
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

export async function searchSpotify(query: string) {
    const tokens = await getSpotifyTokens();
    if (!tokens) return null;

    let accessToken = tokens.accessToken;
    const expiresAt = new Date(tokens.expiresAt).getTime();

    if (Date.now() > expiresAt - 60000) {
        accessToken = await refreshAccessToken(tokens.refreshToken);
    }

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.tracks.items.map((track: any) => ({
        id: track.id,
        name: track.name,
        artist: track.artists.map((a: any) => a.name).join(', '),
        album: track.album.name,
        coverUrl: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls.spotify,
    }));
}

