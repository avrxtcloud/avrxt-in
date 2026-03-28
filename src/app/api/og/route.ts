import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function getBaseUrl(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured;

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto') || 'https';

  if (host) return `${proto}://${host}`;

  return 'https://www.avrxt.in';
}

function getRequestedPath(request: NextRequest): string {
  const raw = request.nextUrl.searchParams.get('path') || '/';
  const trimmed = raw.trim();
  if (!trimmed) return '/';

  if (!trimmed.startsWith('/')) return '/';
  if (trimmed.includes('://')) return '/';
  if (trimmed.includes('..')) return '/';
  if (trimmed.length > 200) return '/';

  return trimmed;
}

function responseHeaders() {
  return {
    'content-type': 'image/png',
    // Cache aggressively at the CDN; social platforms also cache previews.
    'cache-control': 'public, s-maxage=86400, stale-while-revalidate=604800',
  };
}

export async function HEAD() {
  return new Response(null, { status: 200, headers: responseHeaders() });
}

export async function GET(request: NextRequest) {
  const path = getRequestedPath(request);
  const baseUrl = getBaseUrl(request);
  const targetUrl = new URL(path, baseUrl).toString();

  try {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = (await import('puppeteer-core')).default;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: OG_WIDTH, height: OG_HEIGHT, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(),
      headless: true,
    });

    try {
      const page = await browser.newPage();

      await page.setUserAgent(
        'Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)'
      );
      await page.setExtraHTTPHeaders({
        'x-og-screenshot': '1',
      });

      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await page.addStyleTag({
        content: `
          *, *::before, *::after { animation: none !important; transition: none !important; }
          html, body { background: #050505 !important; }
        `,
      });

      const png = (await page.screenshot({ type: 'png' })) as Uint8Array;
      const bytes = new Uint8Array(png);
      return new Response(bytes, { status: 200, headers: responseHeaders() });
    } finally {
      await browser.close();
    }
  } catch (error) {
    console.error('[OG_SCREENSHOT] Failed:', error);
    return Response.redirect(new URL('/opengraph-image', baseUrl), 307);
  }
}
