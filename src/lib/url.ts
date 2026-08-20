export function extractUrls(text: string): string[] {
  if (!text) return [];

  const urls: string[] = [];
  const re = /(https?:\/\/[^\s<>()]+)|(\bwww\.[^\s<>()]+)/gi;
  const matches = text.matchAll(re);
  for (const m of matches) {
    const raw = (m[0] || '').trim().replace(/[),.;!?]+$/g, '');
    if (!raw) continue;
    urls.push(raw.startsWith('www.') ? `https://${raw}` : raw);
  }

  // Dedup while preserving order.
  return Array.from(new Set(urls));
}

