import { createClient } from '@/utils/supabase/server';
import { getMeConfigAction } from '@/app/actions/me';
import MeAdminClient from './MeAdminClient';
import { buildPageMetadata } from '@/lib/page-metadata';
import { protectAdminPage } from '@/lib/auth-checks';

export const metadata = buildPageMetadata({
    title: 'Me Admin',
    description: 'Admin panel for managing /me page content and integrations.',
    noIndex: true,
    path: '/me/admin',
});

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
