import { buildPageMetadata } from '@/lib/page-metadata';

export const metadata = buildPageMetadata({
  title: 'Subscribe',
  description: 'Join the avrxt newsletter for monthly insights on full-stack architecture, automation, and API design.',
  keywords: ['newsletter', 'subscribe', 'avrxt', 'architecture', 'automation', 'api design'],
  path: '/subscribe',
});

export default function SubscribeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

