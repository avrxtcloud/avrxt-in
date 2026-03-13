import { getMeConfigAction } from '@/app/actions/me';
import MeClient from './MeClient';

import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '@avrxt Core',
    description: 'Explore the personal profile, creative work, and social footprints of aviorxt, also known as avrxt.',
    keywords: ['aviorxt', 'avrxt', '@avrxt Core', 'developer portfolio', 'tech personality', 'creative engineering'],
};

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function MePage() {
    const config = await getMeConfigAction();

    return (
        <MeClient initialConfig={config} />
    );
}
