'use client';

import { useMemo } from 'react';
import LinkPreviewCard from '@/components/LinkPreviewCard';
import { extractUrls } from '@/lib/url';

export default function AutoLinkPreview({ text }: { text: string }) {
  const firstUrl = useMemo(() => extractUrls(text)[0] || null, [text]);
  if (!firstUrl) return null;

  return (
    <div className="mt-3">
      <LinkPreviewCard url={firstUrl} />
    </div>
  );
}

