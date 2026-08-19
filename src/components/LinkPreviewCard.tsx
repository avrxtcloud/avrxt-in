'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiUrl } from '@/lib/api-gateway';

export type LinkPreviewData = {
  url: string;
  resolvedUrl: string;
  host: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
};

function normalizeUrl(input: string, base?: string): string | null {
  try {
    if (input.startsWith('http://') || input.startsWith('https://')) return new URL(input).toString();
    if (base) return new URL(input, base).toString();
    return null;
  } catch {
    return null;
  }
}

export default function LinkPreviewCard({
  url,
  className,
  mode = 'card',
  baseUrl,
}: {
  url: string;
  className?: string;
  mode?: 'card' | 'compact';
  baseUrl?: string;
}) {
  const normalizedUrl = useMemo(() => normalizeUrl(url, baseUrl), [url, baseUrl]);
  const [data, setData] = useState<LinkPreviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!normalizedUrl) return;

    (async () => {
      try {
        setError(null);
        const path = `/v1/link-preview?url=${encodeURIComponent(normalizedUrl)}`;
        const res = await fetch(apiUrl(path, `/api/link-preview?url=${encodeURIComponent(normalizedUrl)}`), { cache: 'force-cache' });
        if (!res.ok) throw new Error('Failed');
        const json = (await res.json()) as LinkPreviewData;
        if (active) setData(json);
      } catch {
        if (active) setError('Preview unavailable');
      }
    })();

    return () => {
      active = false;
    };
  }, [normalizedUrl]);

  if (!normalizedUrl) return null;

  const title = data?.title || data?.siteName || data?.host || normalizedUrl;
  const description = data?.description || '';
  const image = data?.image;
  const favicon = data?.favicon;
  const host = data?.host || (() => {
    try { return new URL(normalizedUrl).host; } catch { return ''; }
  })();

  return (
    <a
      href={normalizedUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-all overflow-hidden',
        mode === 'compact' && 'rounded-xl',
        className
      )}
      aria-label={`Open link preview: ${title}`}
    >
      {image && (
        <div className={cn('relative w-full overflow-hidden', mode === 'compact' ? 'h-24' : 'h-28')}>
          <img
            src={image}
            alt={`${title} preview image`}
            className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        </div>
      )}

      <div className={cn('p-4', mode === 'compact' && 'p-3')}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {favicon && (
              <img
                src={favicon}
                alt={`${host} favicon`}
                className="w-4 h-4 rounded-[4px] opacity-80"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest truncate">
              {host || 'Link'}
            </span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-300 transition-colors shrink-0" />
        </div>

        <div className="mt-2 space-y-1">
          <div className="text-sm font-semibold text-white line-clamp-2">{title}</div>
          {error ? (
            <div className="text-[11px] text-zinc-600 font-mono">{error}</div>
          ) : (
            description && <div className="text-[11px] text-zinc-500 line-clamp-2">{description}</div>
          )}
        </div>
      </div>
    </a>
  );
}

