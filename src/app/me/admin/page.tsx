import { getMeConfigAction } from '@/app/actions/me';
import MeAdminClient from './MeAdminClient';
import { buildPageMetadata } from '@/lib/page-metadata';
import { protectAdminPage } from '@/lib/auth-checks';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export const metadata = buildPageMetadata({
    title: 'Me Admin',
    description: 'Admin panel for managing /me page content and integrations.',
    noIndex: true,
});

export default async function MeAdminPage() {
    await protectAdminPage();
    
    const session = await auth.api.getSession({
        headers: await headers()
    });

    const config = await getMeConfigAction();

    // Check if spotify is connected for this user in Supabase
    let isSpotifyConnected = false;
    if (session?.user?.id) {
        const supabase = await createClient();
        const { data } = await supabase
            .from('spotify_tokens')
            .select('id')
            .eq('user_id', session.user.id)
            .single();
        
        isSpotifyConnected = !!data;
    }

    return (
        <MeAdminClient
            initialConfig={config}
            isSpotifyConnected={isSpotifyConnected}
        />
    );
}

