import { renderDynamicOgImage } from '@/lib/og-api';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  return renderDynamicOgImage(request.url);
}

