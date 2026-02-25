import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getMeConfigAction } from '@/app/actions/me';
import MeAdminClient from './MeAdminClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default async function MeAdminPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?source=admin');
    }

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
