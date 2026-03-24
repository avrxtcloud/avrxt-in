import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get Spotify Tokens from DB
        const { data: tokens, error: tokenError } = await supabaseClient
            .from('spotify_tokens')
            .select('*')
            .single()

        if (tokenError || !tokens) {
            return new Response(JSON.stringify({ isPlaying: false, error: 'Spotify not connected' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            })
        }

        let accessToken = tokens.access_token
        const expiresAt = new Date(tokens.expires_at).getTime()

        // 2. Refresh token if expired
        if (Date.now() > expiresAt - 60000) {
            const client_id = Deno.env.get('SPOTIFY_CLIENT_ID')
            const client_secret = Deno.env.get('SPOTIFY_CLIENT_SECRET')
            const basic = btoa(`${client_id}:${client_secret}`)

            const res = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${basic}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: tokens.refresh_token,
                }),
            })

            const data = await res.json()
            if (res.ok) {
                accessToken = data.access_token
                await supabaseClient
                    .from('spotify_tokens')
                    .update({
                        access_token: data.access_token,
                        expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
                    })
                    .match({ refresh_token: tokens.refresh_token })
            }
        }

        // 3. Get Now Playing from Spotify
        const spotifyRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        if (spotifyRes.status === 200) {
            const song = await spotifyRes.json()
            if (song.is_playing) {
                const result = {
                    isPlaying: true,
                    title: song.item.name,
                    artist: song.item.artists.map((a: any) => a.name).join(', '),
                    album: song.item.album.name,
                    albumImageUrl: song.item.album.images[0].url,
                    songUrl: song.item.external_urls.spotify,
                    progressMs: song.progress_ms,
                    durationMs: song.item.duration_ms,
                }

                // Optional: Update history
                await supabaseClient.from('spotify_history').upsert({
                    song_name: result.title,
                    artist: result.artist,
                    cover_url: result.albumImageUrl,
                    played_at: new Date().toISOString()
                }, { onConflict: 'song_name, artist' })

                return new Response(JSON.stringify(result), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            }
        }

        // 4. Fallback: Get Last Played from History
        const { data: lastPlayed } = await supabaseClient
            .from('spotify_history')
            .select('*')
            .order('played_at', { ascending: false })
            .limit(1)
            .single()

        return new Response(JSON.stringify({
            isPlaying: false,
            title: lastPlayed?.song_name,
            artist: lastPlayed?.artist,
            albumImageUrl: lastPlayed?.cover_url,
            playedAt: lastPlayed?.played_at,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        return new Response(JSON.stringify({ isPlaying: false, error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        })
    }
})
