import { ogContentType, ogSize, renderOgImage } from '@/lib/og-image';

export const runtime = 'edge';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    title: 'avrxt',
    description: 'Full Stack Developer & Tech Innovator',
  });
}

