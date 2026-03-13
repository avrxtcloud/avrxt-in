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

export function renderOgImage({ title, description, eyebrow }: OgImageInput) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          color: 'white',
          backgroundColor: '#050505',
          backgroundImage: [
            'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.20), transparent 55%)',
            'radial-gradient(circle at 85% 25%, rgba(59,130,246,0.18), transparent 55%)',
            'radial-gradient(circle at 50% 100%, rgba(168,85,247,0.16), transparent 50%)',
            'linear-gradient(to bottom, rgba(255,255,255,0.05), rgba(255,255,255,0))',
          ].join(', '),
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 999,
                  background: 'rgba(16,185,129,0.95)',
                  boxShadow: '0 0 24px rgba(16,185,129,0.45)',
                }}
              />
              <div style={{ fontSize: 22, letterSpacing: 2, opacity: 0.9 }}>avrxt.in</div>
            </div>
            <div
              style={{
                fontSize: 16,
                letterSpacing: 3,
                textTransform: 'uppercase',
                opacity: 0.6,
              }}
            >
              {eyebrow || 'Premium Preview'}
            </div>
          </div>

          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              textShadow: '0 12px 80px rgba(0,0,0,0.8)',
              maxWidth: 980,
            }}
          >
            {title}
          </div>

          {description ? (
            <div
              style={{
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
            paddingTop: 28,
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
            <div style={{ fontSize: 18, opacity: 0.7, letterSpacing: 1 }}>Full Stack • AI • Cloud</div>
          </div>

          <div style={{ fontSize: 18, opacity: 0.7, letterSpacing: 1 }}>share-ready • og:image</div>
        </div>
      </div>
    ),
    {
      width: ogSize.width,
      height: ogSize.height,
    }
  );
}

