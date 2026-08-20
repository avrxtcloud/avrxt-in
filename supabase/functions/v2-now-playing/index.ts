import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SYNC_INTERVAL_MS = 15000; // Sync with Spotify every 15s max

serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Get current status and check if sync is needed
        const { data: currentStatus } = await supabase
            .from('spotify_status')
            .select('*')
            .eq('id', 1)
            .maybeSingle()

        const lastUpdated = currentStatus?.updated_at ? new Date(currentStatus.updated_at).getTime() : 0;
        const isStale = (Date.now() - lastUpdated) > SYNC_INTERVAL_MS;

        if (!isStale && currentStatus) {
            // Map database columns back to camelCase JSON for the frontend
            const mapped = {
                isPlaying: currentStatus.is_playing,
                title: currentStatus.title,
                artist: currentStatus.artist,
                albumImageUrl: currentStatus.album_image_url,
                songUrl: currentStatus.song_url,
                progressMs: currentStatus.progress_ms,
                durationMs: currentStatus.duration_ms,
                updatedAt: currentStatus.updated_at
            }
            return new Response(JSON.stringify(mapped), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // 2. Perform Spotify Sync (Stale or Missing)
        const { data: tokens } = await supabase.from('spotify_tokens').select('*').single()
        if (!tokens) return new Response(JSON.stringify({ isPlaying: false, error: 'Spotify not connected' }), { headers: corsHeaders })

        let accessToken = tokens.access_token
        if (new Date(tokens.expires_at).getTime() < Date.now() + 60000) {
            const basic = btoa(`${Deno.env.get('SPOTIFY_CLIENT_ID')}:${Deno.env.get('SPOTIFY_CLIENT_SECRET')}`)
            const res = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: tokens.refresh_token }),
            })
            const data = await res.json()
            if (res.ok) {
                accessToken = data.access_token
                await supabase.from('spotify_tokens').update({
                    access_token: data.access_token,
                    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
                }).match({ refresh_token: tokens.refresh_token })
            }
        }

        const spotifyRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
            headers: { Authorization: `Bearer ${accessToken}` },
        })

        let updateData: any = { id: 1, is_playing: false, updated_at: new Date().toISOString() };

        if (spotifyRes.status === 200) {
            const song = await spotifyRes.json()
            if (song.is_playing) {
                updateData = {
                    ...updateData,
                    is_playing: true,
                    title: song.item.name,
                    artist: song.item.artists.map((a: any) => a.name).join(', '),
                    album: song.item.album.name,
                    album_image_url: song.item.album.images[0].url,
                    song_url: song.item.external_urls.spotify,
                    progress_ms: song.progress_ms,
                    duration_ms: song.item.duration_ms,
                }

                await supabase.from('spotify_history').upsert({
                    song_name: updateData.title,
                    artist: updateData.artist,
                    cover_url: updateData.album_image_url,
                    played_at: new Date().toISOString()
                }, { onConflict: 'song_name, artist' })
            }
        } else {
            // If not playing, check history for the last song
            const { data: lastPlayed } = await supabase.from('spotify_history').select('*').order('played_at', { ascending: false }).limit(1).maybeSingle()
            if (lastPlayed) {
                updateData = {
                    ...updateData,
                    is_playing: false,
                    title: lastPlayed.song_name,
                    artist: lastPlayed.artist,
                    album_image_url: lastPlayed.cover_url,
                }
            }
        }

        await supabase.from('spotify_status').upsert(updateData)

        // Map back for the direct response
        const result = {
            isPlaying: updateData.is_playing,
            title: updateData.title,
            artist: updateData.artist,
            albumImageUrl: updateData.album_image_url,
            songUrl: updateData.song_url,
            progressMs: updateData.progress_ms,
            durationMs: updateData.duration_ms,
            updatedAt: updateData.updated_at
        }

        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    } catch (error) {
        return new Response(JSON.stringify({ isPlaying: false, error: (error as Error).message }), { status: 500, headers: corsHeaders })
    }
})
