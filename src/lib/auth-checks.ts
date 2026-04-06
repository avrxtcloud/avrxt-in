import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { signSource } from './auth-tokens';

/**
 * Verifies if the current requester is an active admin.
 * Uses Better Auth API to check and validate the session against the database.
 */
export async function verifyAdmin() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session || !session.user) {
        console.warn(`[AUTH_CHECK] No user session found: Unauthorized`);
        return { authorized: false, error: 'not_logged_in' };
    }

    // Role check from our SQL database via Better Auth
    if (session.user.role === 'admin') {
        return { authorized: true, user: session.user };
    }

    console.warn(`[AUTH_CHECK] Access Denied for ${session.user.email}. Role 'admin' not found.`);
    return { authorized: false, error: 'unauthorized_role' };
}

/**
 * Redirection utility for protected server pages.
 */
export async function protectAdminPage() {
    const { authorized, error } = await verifyAdmin();
    if (!authorized) {
        // Use a signed state token for the source parameter as requested
        const sourceToken = signSource('admin');
        redirect(`/auth/login?source=${sourceToken}&error=${error}`);
    }
}

