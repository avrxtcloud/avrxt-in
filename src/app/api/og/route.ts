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

      await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Wait for client-side hydration to paint real content (many routes render mostly Client Components).
      try {
        await page.waitForFunction(
          () => {
            const main = document.querySelector('main');
            if (!main) return false;
            if (main.querySelector('*')) return true;
            return (main.textContent || '').trim().length > 0;
          },
          { timeout: 12000 }
        );
      } catch {
        // Best-effort: still attempt a screenshot even if hydration is slow.
      }

      await new Promise((resolve) => setTimeout(resolve, 800));

      await page.addStyleTag({
        content: `
          *, *::before, *::after { animation: none !important; transition: none !important; }
          html, body { background: #050505 !important; }
        `,
      });

      // Hide full-screen overlays/loaders and cursors that can block the viewport during the capture.
      await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll<HTMLElement>('body *'));
        for (const el of elements) {
          const style = getComputedStyle(el);
          if (style.position !== 'fixed') continue;
          const z = Number.parseInt(style.zIndex || '0', 10);
          if (!Number.isFinite(z) || z < 9000) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < window.innerWidth * 0.9 || rect.height < window.innerHeight * 0.9) continue;
          el.style.display = 'none';
        }
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
