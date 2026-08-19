import { ImageResponse } from 'next/og';

export const ogSize = {
  width: 1200,
  height: 630,
};

export const ogContentType = 'image/png';

type OgImageInput = {
  title: string;
  description?: string;
  eyebrow?: string;
};

type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style?: 'normal' | 'italic';
};

export function renderOgImage(
  { title, description, eyebrow }: OgImageInput,
  options?: { fonts?: OgFont[] }
) {
  const sans =
    'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"';
  const mono =
    '"Space Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          color: 'white',
          backgroundColor: '#050505',
          fontFamily: sans,
          backgroundImage: [
            'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.20), transparent 55%)',
            'radial-gradient(circle at 85% 25%, rgba(59,130,246,0.18), transparent 55%)',
            'radial-gradient(circle at 50% 100%, rgba(168,85,247,0.16), transparent 50%)',
            'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0))',
          ].join(', '),
        }}
      >
        {/* Grid overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            opacity: 0.18,
          }}
        />

        {/* Floating 3D orbs */}
        <div
          style={{
            position: 'absolute',
            top: 70,
            right: 90,
            width: 220,
            height: 220,
            borderRadius: 999,
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.92), rgba(255,255,255,0.06) 55%, rgba(0,0,0,0) 72%)',
            filter: 'blur(0.2px)',
            boxShadow: '0 45px 120px rgba(59,130,246,0.18)',
            opacity: 0.55,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 85,
            left: 80,
            width: 180,
            height: 180,
            borderRadius: 999,
            background:
              'radial-gradient(circle at 30% 30%, rgba(16,185,129,0.95), rgba(16,185,129,0.10) 55%, rgba(0,0,0,0) 72%)',
            boxShadow: '0 55px 140px rgba(16,185,129,0.12)',
            opacity: 0.45,
          }}
        />

        {/* Main glass card */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            padding: 56,
            borderRadius: 40,
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

          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 999,
                  background: 'rgba(16,185,129,0.95)',
                  boxShadow: '0 0 32px rgba(16,185,129,0.40)',
                }}
              />
              <div style={{ fontSize: 20, letterSpacing: 3, opacity: 0.9, fontFamily: mono }}>avrxt.dev</div>
            </div>
            <div
              style={{
                fontSize: 14,
                letterSpacing: 4,
                textTransform: 'uppercase',
                opacity: 0.65,
                fontFamily: mono,
              }}
            >
              {eyebrow || 'Premium Preview'}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              fontSize: 78,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.02,
              textTransform: 'uppercase',
              maxWidth: 980,
              textShadow: '0 18px 90px rgba(0,0,0,0.85)',
            }}
          >
            <span
              style={{
                backgroundImage: 'linear-gradient(90deg, rgba(167,243,208,1), rgba(165,243,252,1), rgba(254,202,202,1))',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {title}
            </span>
          </div>

          {description ? (
            <div
              style={{
                position: 'relative',
                display: 'flex',
                fontSize: 26,
                lineHeight: 1.35,
                color: 'rgba(255,255,255,0.78)',
                maxWidth: 980,
              }}
            >
              {description}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 26,
            borderTop: '1px solid rgba(255,255,255,0.10)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.85)',
                opacity: 0.7,
              }}
            />
            <div style={{ fontSize: 18, opacity: 0.7, letterSpacing: 1, fontFamily: mono }}>
              Full Stack • AI • Cloud
            </div>
          </div>

          <div style={{ fontSize: 18, opacity: 0.7, letterSpacing: 1, fontFamily: mono }}>
            share-ready • og:image
          </div>
        </div>
      </div>
    ),
    {
      width: ogSize.width,
      height: ogSize.height,
      fonts: options?.fonts,
    }
  );
}
