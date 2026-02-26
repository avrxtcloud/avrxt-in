import { NextResponse } from 'next/server';
import { getNowPlaying, getSpotifyTokens } from '@/lib/spotify';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const tokens = await getSpotifyTokens();
        if (!tokens) {
            return NextResponse.json({ isPlaying: false, error: 'Spotify not connected' });
        }

        const nowPlaying = await getNowPlaying();

        if (nowPlaying.isPlaying) {
            return NextResponse.json(nowPlaying);
        }

        // If not playing, get last played from history
        const supabase = createAdminClient();
        const { data: lastPlayed, error } = await supabase
            .from('spotify_history')
            .select('*')
            .order('played_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !lastPlayed) {
            return NextResponse.json({ isPlaying: false });
        }

        return NextResponse.json({
            isPlaying: false,
            title: lastPlayed.song_name,
            artist: lastPlayed.artist,
            albumImageUrl: lastPlayed.cover_url,
            playedAt: lastPlayed.played_at,
        });
    } catch (error) {
        console.error('Error in now-playing API:', error);
        return NextResponse.json({ isPlaying: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
