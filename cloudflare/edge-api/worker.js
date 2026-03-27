/**
 * edge.avrxt.space - Edge API proxy
 *
 * Routes (public, CORS-enabled):
 * - GET /v1/realtime/dc-presence/:discordId  -> https://api.lanyard.rest/v1/users/:discordId
 * - GET /v1/fnc/geo/search?...              -> https://geocoding-api.open-meteo.com/v1/search?...
 * - GET /v1/fnc/geo/forecast?...            -> https://api.open-meteo.com/v1/forecast?...
 * - GET /v1/spotify/now-playing             -> upstream (default: Supabase edge function)
 */

const DEFAULT_SPOTIFY_UPSTREAM =
  'https://jirohobyxsihzbpopsse.supabase.co/functions/v1/v2-now-playing';

function json(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...(init?.headers || {}),
    },
  });
}

function withCors(request, response, env) {
  const origin = request.headers.get('Origin');
  const allowed = (env?.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);

  // Default: allow any origin (public endpoints).
  const allowOrigin = allowed.length === 0 ? '*' : (origin && allowed.includes(origin) ? origin : allowed[0]);

  const headers = new Headers(response.headers);
  headers.set('access-control-allow-origin', allowOrigin);
  headers.set('access-control-allow-methods', 'GET,OPTIONS');
  headers.set('access-control-allow-headers', 'content-type,authorization');
  headers.set('access-control-max-age', '86400');
  headers.set('vary', 'Origin');

  // Ensure we don't accidentally cache personalized responses.
  if (!headers.has('cache-control')) headers.set('cache-control', 'no-store');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function optionsResponse(request, env) {
  return withCors(
    request,
    new Response(null, { status: 204 }),
    env
  );
}

function proxyHeaders(request) {
  const headers = new Headers();
  const auth = request.headers.get('authorization');
  if (auth) headers.set('authorization', auth);
  headers.set('accept', 'application/json');
  // Avoid passing Origin to upstream (some APIs vary on it).
  return headers;
}

async function proxyJson(request, env, upstreamUrl) {
  const upstream = await fetch(upstreamUrl, {
    method: 'GET',
    headers: proxyHeaders(request),
    // Always fetch fresh (these are "live" endpoints).
    cf: { cacheTtl: 0, cacheEverything: false },
  });
  return withCors(request, upstream, env);
}

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return optionsResponse(request, env);
    }

    if (request.method !== 'GET') {
      return withCors(request, json({ error: 'Method not allowed' }, { status: 405, headers: { allow: 'GET,OPTIONS' } }), env);
    }

    // /v1/realtime/dc-presence/:discordId
    if (url.pathname.startsWith('/v1/realtime/dc-presence/')) {
      const discordId = url.pathname.split('/').pop();
      if (!discordId) return withCors(request, json({ error: 'Missing discordId' }, { status: 400 }), env);
      return proxyJson(request, env, `https://api.lanyard.rest/v1/users/${encodeURIComponent(discordId)}`);
    }

    // /v1/fnc/geo/search?... (open-meteo geocoding)
    if (url.pathname === '/v1/fnc/geo/search') {
      const upstream = new URL('https://geocoding-api.open-meteo.com/v1/search');
      upstream.search = url.search;
      return proxyJson(request, env, upstream.toString());
    }

    // /v1/fnc/geo/forecast?... (open-meteo forecast)
    if (url.pathname === '/v1/fnc/geo/forecast') {
      const upstream = new URL('https://api.open-meteo.com/v1/forecast');
      upstream.search = url.search;
      return proxyJson(request, env, upstream.toString());
    }

    // /v1/spotify/now-playing
    if (url.pathname === '/v1/spotify/now-playing') {
      const upstream = env?.SPOTIFY_NOW_PLAYING_UPSTREAM || DEFAULT_SPOTIFY_UPSTREAM;
      return proxyJson(request, env, upstream);
    }

    return withCors(request, json({ error: 'Not found' }, { status: 404 }), env);
  },
};

export default worker;
