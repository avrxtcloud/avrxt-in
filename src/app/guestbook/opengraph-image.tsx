import { ogContentType, ogSize, renderOgImage } from '@/lib/og-image';
import { getOgFonts } from '@/app/_og/fonts';

export const runtime = 'edge';
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image() {
  const fonts = await getOgFonts();
  return renderOgImage(
    {
      title: 'Guestbook',
      description: 'Leave Your Foot Print Here.',
      eyebrow: 'avrxt.dev /guestbook',
    },
    { fonts }
  );
}
