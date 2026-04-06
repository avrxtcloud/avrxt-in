'use server';

import { redirect } from 'next/navigation';
import { verifySource } from '@/lib/auth-tokens';

/**
 * Enhanced login router.
 * Verifies signed state tokens for the 'source' parameter to prevent tampering.
 */
export default async function LoginPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const rawSource = (searchParams.source as string) || '';
    const error = (searchParams.error as string) || '';
    
    // Attempt to verify the signed source. 
    // If it's just a plain string (legacy), verifySource will return null.
    let source = verifySource(rawSource);
    
    // If verification failed but a source was provided, we might want to allow 
    // certain hardcoded safe sources for a transition period, or block them.
    // For now, let's be strict if a token was expected but invalid.
    if (!source && rawSource) {
        // Only allow 'admin' and 'guestbook' as legacy fallback if not signed
        if (['admin', 'guestbook'].includes(rawSource)) {
            source = rawSource;
        } else {
            source = 'unauthorized_source';
        }
    }

    if (!source) source = 'default';
    
    // Redirect to the main site's admin login or the dedicated auth subdomain
    // The user mentioned focusing on www.avrxt.in
    redirect(`/auth/login/admin?source=${source}&error=${error}`);
}

