import { createClient } from '@openauthjs/openauth/client';
import { cookies } from 'next/headers';
import { authSubjects } from '../../auth-worker/subjects';

const ACCESS_COOKIE = 'avrxt_access';
const REFRESH_COOKIE = 'avrxt_refresh';

export type AuthUser = {
  id: string;
  email?: string;
  provider: string;
  admin: boolean;
  user_metadata: { full_name?: string; user_name?: string; avatar_url?: string };
};

export function getOpenAuthClient() {
  return createClient({ clientID: 'avrxt-web', issuer: process.env.OPENAUTH_ISSUER_URL || 'https://auth.avrxt.dev' });
}

export async function setAuthTokens(access: string, refresh: string) {
  const store = await cookies();
  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, path: '/', maxAge: 2592000 };
  store.set(ACCESS_COOKIE, access, options);
  store.set(REFRESH_COOKIE, refresh, options);
}

export async function clearAuthTokens() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;
  if (!access) return null;
  const verified = await getOpenAuthClient().verify(authSubjects, access);
  if (verified.err || verified.subject.type !== 'user') return null;
  const value = verified.subject.properties;
  return {
    id: value.id, email: value.email, provider: value.provider, admin: value.admin,
    user_metadata: { full_name: value.name, user_name: value.name, avatar_url: value.avatar },
  };
}
