import { NextResponse } from 'next/server';
import { lookup } from 'node:dns/promises';

export const dynamic = 'force-dynamic';

type LinkPreviewResponse = {
  url: string;
  resolvedUrl: string;
  host: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
};

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

function isLikelyPrivateHost(host: string): boolean {
  const h = host.toLowerCase();
  if (h === 'localhost') return true;
  if (h.endsWith('.local')) return true;
  if (h === '0.0.0.0') return true;
  return false;
}

function getMeta(html: string, key: { attr: 'property' | 'name'; value: string }): string | null {
  const re = new RegExp(
    `<meta\\s+[^>]*${key.attr}=[\"']${key.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\"'][^>]*>`,
    'i'
  );
  const m = html.match(re);
  if (!m) return null;
  const tag = m[0];
  const content = tag.match(/content=["']([^"']+)["']/i)?.[1];
  return content ? content.trim() : null;
}

function getTitle(html: string): string | null {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return m?.[1]?.trim() || null;
}

function getFaviconHref(html: string): string | null {
  // Prefer common icon rels.
  const rels = [
    'apple-touch-icon',
    'icon',
    'shortcut icon',
    'mask-icon',
  ];
  for (const rel of rels) {
    const re = new RegExp(`<link\\s+[^>]*rel=[\"']${rel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\"'][^>]*>`, 'i');
    const m = html.match(re);
    if (!m) continue;
    const tag = m[0];
    const href = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (href) return href.trim();
  }
  return null;
}

function abs(baseUrl: string, maybeRelative: string | null): string | null {
  if (!maybeRelative) return null;
  try {
    return new URL(maybeRelative, baseUrl).toString();
  } catch {
    return null;
  }
}

async function assertPublicHostname(hostname: string): Promise<void> {
  if (isLikelyPrivateHost(hostname)) {
    throw new Error('Blocked hostname');
  }

  // Best-effort DNS resolve to block private IPv4 ranges.
  // (Vercel/Node environments may not always resolve IPv6 here; keep it simple.)
  const results = await lookup(hostname, { all: true, verbatim: true });
  for (const r of results) {
    if (r.family === 4 && isPrivateIpv4(r.address)) {
      throw new Error('Blocked IP');
    }
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = (searchParams.get('url') || '').trim();
  if (!input) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(url.protocol)) {
    return NextResponse.json({ error: 'Unsupported protocol' }, { status: 400 });
  }

  try {
    await assertPublicHostname(url.hostname);
  } catch {
    return NextResponse.json({ error: 'Blocked url' }, { status: 400 });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        // Some sites return lighter markup when the UA looks like a browser.
        'user-agent':
          'Mozilla/5.0 (compatible; avrxt-link-preview/1.0; +https://avrxt.dev)',
        accept: 'text/html,application/xhtml+xml',
      },
      // Avoid edge caching; we set our own CDN cache headers on the response.
      cache: 'no-store',
    });

    const resolvedUrl = res.url || url.toString();
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.toLowerCase().includes('text/html')) {
      const payload: LinkPreviewResponse = {
        url: url.toString(),
        resolvedUrl,
        host: new URL(resolvedUrl).host,
        title: null,
        description: null,
        image: null,
        favicon: abs(resolvedUrl, '/favicon.ico'),
        siteName: new URL(resolvedUrl).hostname,
      };

      return NextResponse.json(payload, {
        headers: {
          'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      });
    }

    const html = await res.text();

    const ogTitle = getMeta(html, { attr: 'property', value: 'og:title' });
    const ogDesc = getMeta(html, { attr: 'property', value: 'og:description' });
    const ogImage = getMeta(html, { attr: 'property', value: 'og:image' });
    const ogSiteName = getMeta(html, { attr: 'property', value: 'og:site_name' });

    const twTitle = getMeta(html, { attr: 'name', value: 'twitter:title' });
    const twDesc = getMeta(html, { attr: 'name', value: 'twitter:description' });
    const twImage = getMeta(html, { attr: 'name', value: 'twitter:image' });

    const desc = ogDesc || twDesc || getMeta(html, { attr: 'name', value: 'description' });
    const title = ogTitle || twTitle || getTitle(html);
    const image = abs(resolvedUrl, ogImage || twImage);
    const favicon = abs(resolvedUrl, getFaviconHref(html)) || abs(resolvedUrl, '/favicon.ico');

    const payload: LinkPreviewResponse = {
      url: url.toString(),
      resolvedUrl,
      host: new URL(resolvedUrl).host,
      title,
      description: desc,
      image,
      favicon,
      siteName: ogSiteName || new URL(resolvedUrl).hostname,
    };

    return NextResponse.json(payload, {
      headers: {
        'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (e: any) {
    const message = e?.name === 'AbortError' ? 'Timeout' : 'Fetch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  } finally {
    clearTimeout(timeout);
  }
}

