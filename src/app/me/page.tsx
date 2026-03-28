import type { Metadata } from 'next';
import { getMeConfigAction } from '@/app/actions/me';
import { buildPageMetadata } from '@/lib/page-metadata';
import MeClient from './MeClient';

type PageProps = {
    searchParams?: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
    const share = typeof searchParams?.share === 'string' ? searchParams.share : undefined;
    const path = share ? `/me?share=${share}` : '/me';

    return buildPageMetadata({
        title: "Profile & Link's",
        description: "Profile & Link's for avrxt — socials, music, and resources in one place.",
        keywords: ['avrxt', 'profile', 'links', "Profile & Link's", 'social links', 'music', 'resources'],
        path,
    });
}

export const revalidate = 60; // Revalidate data every 60 seconds

export default async function MePage() {
    const config = await getMeConfigAction();
    return <MeClient config={config} />;
}

