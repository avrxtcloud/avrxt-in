import { getAuthUser } from '@/lib/openauth';
import { redirect } from 'next/navigation';

export async function verifyAdmin() {
  const user = await getAuthUser();
  if (!user) return { authorized: false, error: 'not_logged_in' } as const;
  if (!user.admin || user.provider !== 'discord') return { authorized: false, error: 'unauthorized_role' } as const;
  return { authorized: true, user } as const;
}

export async function protectAdminPage() {
  const result = await verifyAdmin();
  if (!result.authorized) redirect(`/auth/login?source=admin&error=${result.error}`);
  return result.user;
}
