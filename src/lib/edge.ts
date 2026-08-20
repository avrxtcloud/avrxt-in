export const EDGE_BASE_URL = (process.env.NEXT_PUBLIC_EDGE_BASE_URL || 'https://edge.avrxt.space').replace(/\/+$/, '');

export function edgeUrl(path: string): string {
  if (!path) return EDGE_BASE_URL;
  return `${EDGE_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

