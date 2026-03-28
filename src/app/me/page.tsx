import { getMeConfigAction } from '@/app/actions/me';
import MeClient from './MeClient';

import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: "Profile & Link's",
    description: "Profile & Link's for avrxt — socials, music, and resources in one place.",
    keywords: ['avrxt', 'profile', 'links', "Profile & Link's", 'social links', 'music', 'resources'],
    path: '/me',
});

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function MePage() {
    const config = await getMeConfigAction();

    return (
        <MeClient config={config} />
    );
}
