'use server';

import { redirect } from 'next/navigation';
import { clearAuthTokens } from '@/lib/openauth';

export async function logout(redirectTo: string = '/') {
  await clearAuthTokens();
  redirect(redirectTo);
}
