import { renderDynamicOgImage } from '@/lib/og-api';

export const runtime = 'edge';

export async function GET(request: Request) {
  return renderDynamicOgImage(request.url);
}

