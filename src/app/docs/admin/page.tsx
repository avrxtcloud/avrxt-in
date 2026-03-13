import { protectAdminPage } from '@/lib/auth-checks';
import { createClient } from '@/utils/supabase/server';
import { getAdminDocs } from '@/app/actions/docs';
import AdminClient from './AdminClient';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: 'Docs Admin',
    description: 'Admin panel for managing documentation posts.',
    noIndex: true,
});

export default async function DocsAdminPage() {
    await protectAdminPage();

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null; // Should be handled by protectAdminPage, but for safety
    }

    const docs = await getAdminDocs();

    return (
        <AdminClient
            initialDocs={docs}
            userEmail={user.email || 'Admin'}
        />
    );
}
