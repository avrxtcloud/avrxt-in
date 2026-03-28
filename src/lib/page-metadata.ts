import type { Metadata } from 'next';
import { ogSize } from '@/lib/og-image';

type PageMetadataInput = {
  title: string;
  description: string;
  keywords?: string[];
  noIndex?: boolean;
  path?: string;
};

const SITE_NAME = 'avrxt';
const DEFAULT_OG_IMAGE_ALT = 'avrxt.in preview image';

function withSiteSuffix(title: string) {
  const normalized = title.trim();
  if (!normalized) return SITE_NAME;
  if (normalized.toLowerCase().includes(SITE_NAME)) return normalized;
  return `${normalized} | ${SITE_NAME}`;
}

export function buildPageMetadata({
  title,
  description,
  keywords,
  noIndex,
  path,
}: PageMetadataInput): Metadata {
  const fullTitle = withSiteSuffix(title);
  const normalizedDescription = description.trim();

  const normalizedPath = path?.trim();
  const effectivePath = normalizedPath && normalizedPath.startsWith('/') ? normalizedPath : undefined;
  const imageUrl = effectivePath
    ? `/api/og?path=${encodeURIComponent(effectivePath)}`
    : '/opengraph-image';

  const openGraphImage = {
    url: imageUrl,
    width: ogSize.width,
    height: ogSize.height,
    alt: DEFAULT_OG_IMAGE_ALT,
  } as const;

  const metadata: Metadata = {
    title: fullTitle,
    description: normalizedDescription,
    keywords,
    openGraph: {
      title: fullTitle,
      description: normalizedDescription,
      type: 'website',
      siteName: 'avrxt.in',
      images: [openGraphImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: normalizedDescription,
      images: [
        {
          url: imageUrl,
          width: ogSize.width,
          height: ogSize.height,
          alt: DEFAULT_OG_IMAGE_ALT,
        },
      ],
    },
  };

  if (noIndex) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}

