'use server'

import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

/**
 * Handle user logout using Better Auth API.
 * This clears the session cookies and redirects.
 */
export async function logout(redirectTo: string = '/') {
    // Better Auth signout from the server side
    await auth.api.signOut({
        headers: await headers()
    });

    revalidatePath('/', 'layout');
    redirect(redirectTo);
}

/**
 * Login is primarily handled via client-side social signIn, 
 * but we keep the structure for future server-side auth expansions.
 */
export async function login() {
    // For now, redirect to the auth subdomain for admin login
    redirect('https://auth.avrxt.in/login/admin');
}
