import { protectAdminPage } from '@/lib/auth-checks';
import { getAdminDocs } from '@/app/actions/docs';
import AdminClient from './AdminClient';
import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
    title: 'Docs Admin',
    description: 'Admin panel for managing documentation posts.',
    noIndex: true,
    path: '/docs/admin',
});

export default async function DocsAdminPage() {
    const user = await protectAdminPage();

    const docs = await getAdminDocs();

    return (
        <AdminClient
            initialDocs={docs}
            userEmail={user.email || 'Admin'}
        />
    );
}
