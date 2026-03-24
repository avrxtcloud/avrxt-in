'use server'

import { createClient } from '@/utils/supabase/server';

export async function searchYouTubeAction(query: string) {
    // Admin-only: verify authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) return { error: 'YouTube API key not configured. Add YOUTUBE_API_KEY to your environment variables.' };

    try {
        const res = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=10&key=${apiKey}`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            const err = await res.json();
            return { error: err.error?.message || 'YouTube API error' };
        }

        const data = await res.json();
        return data.items.map((item: any) => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        }));
    } catch (err: any) {
        return { error: err.message };
    }
}
