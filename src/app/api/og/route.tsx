import { ImageResponse } from 'next/og';
import { getOgFonts } from '@/app/_og/fonts';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { defaultMeConfig, type MeConfig } from '@/lib/me-config';

export const runtime = 'edge';

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

function clampText(value: string, max: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function normalizePath(input: string | null): string {
  const raw = (input || '/').trim();
  if (!raw.startsWith('/')) return '/';
  if (raw.includes('://') || raw.includes('..')) return '/';
  return raw.length > 200 ? '/' : raw;
}

function baseStyle() {
  return {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
    padding: 56,
    backgroundColor: '#050505',
    color: '#fff',
    backgroundImage: [
      'radial-gradient(circle at 15% 25%, rgba(16,185,129,0.18), transparent 55%)',
      'radial-gradient(circle at 85% 30%, rgba(59,130,246,0.14), transparent 55%)',
      'radial-gradient(circle at 50% 100%, rgba(168,85,247,0.10), transparent 50%)',
      'linear-gradient(to bottom, rgba(255,255,255,0.06), rgba(255,255,255,0))',
    ].join(', '),
    fontFamily:
      'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
  };
}

function topBar(path: string) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: 'rgba(16,185,129,0.95)',
            boxShadow: '0 0 28px rgba(16,185,129,0.35)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 3,
              opacity: 0.92,
              fontFamily:
                '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          >
            avrxt.in
          </div>
          <div
            style={{
              fontSize: 11,
              letterSpacing: 4,
              textTransform: 'uppercase',
              opacity: 0.55,
              fontFamily:
                '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          >
            Live Preview
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.70)',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            fontSize: 12,
            letterSpacing: 3,
            textTransform: 'uppercase',
            opacity: 0.75,
            fontFamily:
              '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          {clampText(path === '/' ? '/home' : path, 36)}
        </div>
      </div>
    </div>
  );
}

function frame(children: React.ReactNode) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 22,
        padding: 44,
        borderRadius: 36,
        border: '1px solid rgba(255,255,255,0.12)',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.02))',
        boxShadow: '0 60px 160px rgba(0,0,0,0.75)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 15% 25%, rgba(255,255,255,0.18), rgba(255,255,255,0) 55%), linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0))',
          opacity: 0.65,
        }}
      />
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 22 }}>{children}</div>
    </div>
  );
}

function meOg(config: MeConfig) {
  const handle = config.profile.handle || '@avrxt';
  const bio = config.profile.bio || 'Profile';
  const location = config.profile.location || '—';
  const statusText = config.profile.status?.text || 'Online';
  const theme = config.profile.themeColor || '#10b981';

  const links = (config.links || []).slice(0, 6).map((l) => ({
    name: clampText(l.name || 'Link', 22),
    url: l.url || '',
  }));

  return frame(
    <div style={{ display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.10)',
              background: `linear-gradient(135deg, ${theme}33, rgba(255,255,255,0.04))`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: -1,
            }}
          >
            {handle.replace('@', '').slice(0, 1).toUpperCase()}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>{clampText(handle, 18)}</div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 999,
                    background: theme,
                    boxShadow: `0 0 18px ${theme}55`,
                  }}
                />
                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.78,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    fontFamily:
                      '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                >
                  {clampText(statusText, 18)}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 18, opacity: 0.72, lineHeight: 1.3 }}>{clampText(bio, 90)}</div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.6,
                letterSpacing: 3,
                textTransform: 'uppercase',
                fontFamily:
                  '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
              {clampText(location, 36)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 14,
            flexWrap: 'wrap',
          }}
        >
          {(config.resources || []).slice(0, 4).map((r) => (
            <div
              key={r.id}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.70)',
                  opacity: 0.65,
                }}
              />
              <div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1 }}>{clampText(r.title, 28)}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', width: 360, gap: 14 }}>
        <div
          style={{
            fontSize: 12,
            opacity: 0.65,
            letterSpacing: 4,
            textTransform: 'uppercase',
            fontFamily:
              '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          }}
        >
          Links
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {links.length ? (
            links.map((l) => (
              <div
                key={`${l.name}-${l.url}`}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 18,
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(0,0,0,0.20)',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{l.name}</div>
                  <div style={{ fontSize: 11, opacity: 0.55 }}>{clampText(l.url, 34)}</div>
                </div>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: theme,
                    opacity: 0.9,
                  }}
                />
              </div>
            ))
          ) : (
            <div style={{ fontSize: 14, opacity: 0.6 }}>No links configured</div>
          )}
        </div>
      </div>
    </div>
  );
}

async function guestbookOg() {
  const messages = (await fetchGuestbookMessages()).slice(0, 4).map((m) => ({
    name: clampText(m.user_name || 'Anonymous', 18),
    message: clampText(m.message || '', 120),
  }));

  return frame(
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: -1 }}>Guestbook</div>
        <div
          style={{
            fontSize: 16,
            opacity: 0.7,
            fontFamily:
              '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            letterSpacing: 1,
          }}
        >
          Latest transmissions
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.length ? (
          messages.map((m, i) => (
            <div
              key={`${m.name}-${i}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '14px 16px',
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(0,0,0,0.22)',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: 'rgba(16,185,129,0.90)',
                    opacity: 0.75,
                  }}
                />
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily:
                      '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    letterSpacing: 1,
                  }}
                >
                  {m.name}
                </div>
              </div>
              <div style={{ fontSize: 16, opacity: 0.82, lineHeight: 1.25 }}>{m.message}</div>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 16, opacity: 0.6 }}>No messages yet</div>
        )}
      </div>
    </div>
  );
}

async function docsOg(path: string) {
  const parts = path.split('/').filter(Boolean);
  const slug = parts[1];

  if (!slug) {
    return frame(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 46, fontWeight: 900, letterSpacing: -1 }}>Docs</div>
        <div style={{ fontSize: 18, opacity: 0.72, lineHeight: 1.3 }}>
          Explore in-depth technical guides and engineering notes.
        </div>
      </div>
    );
  }

  const doc = await fetchDocBySlug(slug);
  const title = clampText(doc?.title || 'Docs', 64);
  const description = clampText(doc?.description || 'Technical documentation by avrxt.', 160);

  return frame(
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div
        style={{
          fontSize: 14,
          opacity: 0.65,
          letterSpacing: 4,
          textTransform: 'uppercase',
          fontFamily:
            '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        }}
      >
        Docs / {clampText(slug, 28)}
      </div>
      <div style={{ fontSize: 44, fontWeight: 900, letterSpacing: -1, lineHeight: 1.02 }}>{title}</div>
      <div style={{ fontSize: 18, opacity: 0.75, lineHeight: 1.35 }}>{description}</div>
    </div>
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = normalizePath(searchParams.get('path'));

  const fonts = await getOgFonts();

  let body: React.ReactNode;
  if (path === '/me' || path.startsWith('/me?')) {
    const config = await fetchMeConfig();
    body = meOg(config);
  } else if (path === '/guestbook' || path.startsWith('/guestbook?')) {
    body = await guestbookOg();
  } else if (path === '/docs' || path.startsWith('/docs/')) {
    body = await docsOg(path);
  } else {
    body = frame(
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ fontSize: 52, fontWeight: 900, letterSpacing: -2 }}>avrxt</div>
        <div style={{ fontSize: 18, opacity: 0.75, lineHeight: 1.35 }}>
          Full Stack Developer &amp; Tech Innovator
        </div>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div style={baseStyle()}>
        {topBar(path)}
        {body}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.85)',
                opacity: 0.7,
              }}
            />
            <div
              style={{
                fontSize: 14,
                opacity: 0.7,
                letterSpacing: 1,
                fontFamily:
                  '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              }}
            >
              og:image • dynamic
            </div>
          </div>

          <div
            style={{
              fontSize: 14,
              opacity: 0.7,
              letterSpacing: 1,
              fontFamily:
                '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          >
            {new Date().toISOString().slice(0, 10)}
          </div>
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      headers: {
        'content-type': 'image/png',
        'cache-control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
      fonts,
    }
  );
}

type GuestbookRow = {
  user_name: string | null;
  message: string | null;
  created_at: string | null;
};

type DocumentRow = {
  title: string | null;
  description: string | null;
};

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  return createSupabaseClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { 'x-og-image': '1' } },
  });
}

async function fetchMeConfig(): Promise<MeConfig> {
  const client = supabase();
  if (!client) return defaultMeConfig;

  const { data, error } = await client
    .from('me_config')
    .select('data')
    .eq('key', 'main_config')
    .maybeSingle<{ data: unknown }>();

  if (error || !data?.data) return defaultMeConfig;
  return data.data as MeConfig;
}

async function fetchGuestbookMessages(): Promise<GuestbookRow[]> {
  const client = supabase();
  if (!client) return [];

  const { data } = await client
    .from('guestbook')
    .select('user_name,message,created_at')
    .order('created_at', { ascending: false })
    .limit(4);

  return (data || []) as GuestbookRow[];
}

async function fetchDocBySlug(slug: string): Promise<DocumentRow | null> {
  const client = supabase();
  if (!client) return null;

  const { data } = await client
    .from('documents')
    .select('title,description')
    .eq('slug', slug)
    .maybeSingle<DocumentRow>();

  return data || null;
}
