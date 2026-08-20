export function getSpotifyRedirectUri(requestUrl: string) {
  const request = new URL(requestUrl);
  const isLocal = request.hostname === 'localhost' || request.hostname === '127.0.0.1';
  if (isLocal) return `${request.origin}/api/spotify/callback`;
  const siteOrigin = process.env.AUTH_CALLBACK_ORIGIN || 'https://www.avrxt.dev';
  return new URL('/api/spotify/callback', siteOrigin).toString();
}
