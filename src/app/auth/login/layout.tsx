import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
  title: 'Login',
  description: 'Authenticate with GitHub or Discord to access guestbook and admin experiences.',
  keywords: ['login', 'auth', 'github', 'discord', 'avrxt'],
  noIndex: true,
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

