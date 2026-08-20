const API_ORIGIN = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');

export function apiUrl(gatewayPath: string, localFallback: string) {
  return API_ORIGIN ? `${API_ORIGIN}${gatewayPath}` : localFallback;
}
