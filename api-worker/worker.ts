interface Env {
  SITE_ORIGIN?: string;
  EDGE_ORIGIN?: string;
  YOUTUBE_API_KEY?: string;
}

const ALLOWED_ORIGINS = new Set([
  'https://avrxt.dev',
  'https://www.avrxt.dev',
  'http://localhost:3000',
]);

const PUBLIC_PROXY_ROUTES: Record<string, string> = {
  '/v1/contact': '/api/contact',
  '/v1/hire': '/api/hireme',
  '/v1/subscribe': '/api/subscribe',
  '/v1/status': '/api/status',
  '/v1/health': '/api/health',
  '/v1/link-preview': '/api/link-preview',
  '/v1/og': '/api/og',
  '/v1/spotify/now-playing': '/api/spotify/now-playing',
};

function corsHeaders(request: Request) {
  const origin = request.headers.get('Origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.avrxt.dev';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function json(request: Request, value: unknown, status = 200, extra: HeadersInit = {}) {
  return Response.json(value, {
    status,
    headers: { ...corsHeaders(request), ...extra },
  });
}

function withCors(request: Request, response: Response) {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders(request)).forEach(([key, value]) => headers.set(key, value));
  headers.set('X-AVRXT-Gateway', 'api-v1');
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function proxyToSite(request: Request, env: Env, targetPath: string) {
  const source = new URL(request.url);
  const target = new URL(targetPath, env.SITE_ORIGIN || 'https://www.avrxt.dev');
  target.search = source.search;
  const headers = new Headers(request.headers);
  headers.delete('host');
  headers.set('X-Forwarded-Host', source.host);
  headers.set('X-AVRXT-Gateway', 'api-v1');
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual',
  });
  return withCors(request, response);
}

async function proxyToEdge(request: Request, env: Env, targetPath: string) {
  const source = new URL(request.url);
  const target = new URL(targetPath, env.EDGE_ORIGIN || 'https://edge.avrxt.space');
  target.search = source.search;
  const response = await fetch(target, { headers: { Accept: 'application/json' }, cf: { cacheTtl: 60, cacheEverything: true } } as RequestInit);
  return withCors(request, response);
}

async function youtubeSearch(request: Request, env: Env) {
  if (!env.YOUTUBE_API_KEY) return json(request, { error: 'YouTube API is not configured' }, 503);
  const url = new URL(request.url);
  const query = url.searchParams.get('q')?.trim();
  if (!query) return json(request, { error: 'Missing q parameter' }, 400);
  const upstream = new URL('https://www.googleapis.com/youtube/v3/search');
  upstream.search = new URLSearchParams({
    part: 'snippet', q: query, type: 'video', maxResults: '10', key: env.YOUTUBE_API_KEY,
  }).toString();
  const response = await fetch(upstream, { cf: { cacheTtl: 300, cacheEverything: true } } as RequestInit);
  if (!response.ok) return json(request, { error: 'YouTube API request failed' }, response.status);
  const data = await response.json() as { items?: Array<{ id: { videoId: string }; snippet: { title: string; channelTitle: string; thumbnails: Record<string, { url: string }> } }> };
  return json(request, (data.items || []).map(item => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
  })), 200, { 'Cache-Control': 'public, max-age=120' });
}

const worker = {
  async fetch(request: Request, env: Env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(request) });
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return json(request, {
        service: 'AVRXT API Gateway', version: 'v1', status: 'online',
        documentation: 'https://www.avrxt.dev/system/api/doc',
      }, 200, { 'Cache-Control': 'public, max-age=60' });
    }

    if (url.pathname === '/v1/youtube/search' && request.method === 'GET') return youtubeSearch(request, env);
    if (url.pathname === '/v1/geo/forecast' && request.method === 'GET') return proxyToEdge(request, env, '/v1/fnc/geo/forecast');
    if (url.pathname === '/v1/geo/search' && request.method === 'GET') return proxyToEdge(request, env, '/v1/fnc/geo/search');
    if (url.pathname.startsWith('/v1/discord/presence/') && request.method === 'GET') {
      const id = url.pathname.slice('/v1/discord/presence/'.length);
      if (!/^\d{15,22}$/.test(id)) return json(request, { error: 'Invalid Discord user ID' }, 400);
      return proxyToEdge(request, env, `/v1/realtime/dc-presence/${id}`);
    }

    const target = PUBLIC_PROXY_ROUTES[url.pathname];
    if (target) return proxyToSite(request, env, target);

    return json(request, { error: 'Not found', path: url.pathname }, 404);
  },
};

export default worker;
