import type { Metadata } from 'next';

type PageMetadataInput = {
  title: string;
  description: string;
  keywords?: string[];
  noIndex?: boolean;
};

const SITE_NAME = 'avrxt';

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
}: PageMetadataInput): Metadata {
  const fullTitle = withSiteSuffix(title);
  const normalizedDescription = description.trim();

  const metadata: Metadata = {
    title: fullTitle,
    description: normalizedDescription,
    keywords,
    openGraph: {
      title: fullTitle,
      description: normalizedDescription,
      type: 'website',
      siteName: 'avrxt.in',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: normalizedDescription,
    },
  };

  if (noIndex) {
    metadata.robots = { index: false, follow: false };
  }

  return metadata;
}

