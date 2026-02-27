import { createClient } from '@/utils/supabase/server';
import { getMeConfigAction } from '@/app/actions/me';
import MeAdminClient from './MeAdminClient';
import { Metadata } from 'next';
import { protectAdminPage } from '@/lib/auth-checks';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default async function MeAdminPage() {
    await protectAdminPage();

    const supabase = await createClient();
    const config = await getMeConfigAction();

    const { data: spotifyToken } = await supabase
        .from('spotify_tokens')
        .select('id')
        .single();

    return (
        <MeAdminClient
            initialConfig={config}
            isSpotifyConnected={!!spotifyToken}
        />
    );
}
