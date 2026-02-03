import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getAdminDocs } from '@/app/actions/docs';
import AdminClient from './AdminClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    robots: {
        index: false,
        follow: false,
    },
};

export default async function DocsAdminPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const docs = await getAdminDocs();

    return (
        <AdminClient
            initialDocs={docs}
            userEmail={user.email || 'Admin'}
        />
    );
}
