import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { resolveMx } from 'node:dns/promises';
import { createAdminClient } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type CheckResult = {
  name: string;
  ok: boolean;
  details: string;
  latencyMs: number;
};

function nowMs() {
  return Date.now();
}

function required(value: string | undefined | null): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

async function withTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  let timer: NodeJS.Timeout | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function skippedCheck(name: string, details: string): CheckResult {
  return {
    name,
    ok: true,
    details,
    latencyMs: 0,
  };
}

async function checkSupabase(name: string): Promise<CheckResult> {
  const start = nowMs();

  const hasUrl = required(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasKey = required(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!hasUrl || !hasKey) {
    return {
      name,
      ok: false,
      details: 'Supabase environment not configured',
      latencyMs: nowMs() - start,
    };
  }

  try {
    const supabase = createAdminClient();
    const queryResult = await withTimeout(
      supabase.from('spotify_tokens').select('id').limit(1),
      10000
    ) as { error: { message: string } | null };

    if (queryResult.error) {
      return {
        name,
        ok: false,
        details: `Supabase query failed: ${queryResult.error.message}`,
        latencyMs: nowMs() - start,
      };
    }

    return {
      name,
      ok: true,
      details: 'Supabase reachable',
      latencyMs: nowMs() - start,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      details: `Supabase check failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      latencyMs: nowMs() - start,
    };
  }
}

async function checkResendAndDns(name: string): Promise<CheckResult> {
  const start = nowMs();
  const apiKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (!required(apiKey) || !required(audienceId)) {
    return {
      name,
      ok: false,
      details: 'Resend environment not configured',
      latencyMs: nowMs() - start,
    };
  }

  try {
    const resend = new Resend(apiKey);
    const [resendResult, mxResult] = await Promise.all([
      withTimeout(resend.contacts.list({ audienceId }), 10000),
      withTimeout(resolveMx('gmail.com'), 10000),
    ]);

    if (resendResult.error) {
      return {
        name,
        ok: false,
        details: `Resend check failed: ${resendResult.error.message}`,
        latencyMs: nowMs() - start,
      };
    }

    if (!mxResult || mxResult.length === 0) {
      return {
        name,
        ok: false,
        details: 'DNS MX resolution failed',
        latencyMs: nowMs() - start,
      };
    }

    return {
      name,
      ok: true,
      details: 'Resend and DNS reachable',
      latencyMs: nowMs() - start,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      details: `Resend/DNS check failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      latencyMs: nowMs() - start,
    };
  }
}

async function checkSpotifyConfig(name: string): Promise<CheckResult> {
  const start = nowMs();
  const ok =
    required(process.env.SPOTIFY_CLIENT_ID) &&
    required(process.env.SPOTIFY_CLIENT_SECRET) &&
    required(process.env.SPOTIFY_REDIRECT_URI);

  return {
    name,
    ok,
    details: ok ? 'Spotify OAuth env configured' : 'Spotify OAuth env missing',
    latencyMs: nowMs() - start,
  };
}

async function checkStatusProvider(name: string): Promise<CheckResult> {
  const start = nowMs();
  const betterstackKey = process.env.BETTERSTACK_API_KEY;
  const statusPageId = process.env.BETTERSTACK_STATUS_PAGE_ID;

  try {
    if (required(betterstackKey) && required(statusPageId)) {
      const response = await withTimeout(
        fetch(`https://uptime.betterstack.com/api/v2/status-pages/${statusPageId}`, {
          headers: {
            Authorization: `Bearer ${betterstackKey}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        }),
        10000
      );

      if (response.ok) {
        return {
          name,
          ok: true,
          details: 'Betterstack reachable',
          latencyMs: nowMs() - start,
        };
      }
    }

    const fallbackResponse = await withTimeout(
      fetch('https://status.avrxt.in/badge?theme=dark', { cache: 'no-store' }),
      10000
    );

    return {
      name,
      ok: fallbackResponse.ok,
      details: fallbackResponse.ok ? 'Public status page reachable' : `Public status check failed (${fallbackResponse.status})`,
      latencyMs: nowMs() - start,
    };
  } catch (error) {
    return {
      name,
      ok: false,
      details: `Status provider check failed: ${error instanceof Error ? error.message : 'unknown error'}`,
      latencyMs: nowMs() - start,
    };
  }
}

export async function GET() {
  const started = nowMs();

  const checks = await Promise.all([
    Promise.resolve(skippedCheck('api/contact', 'Google Sheets/Gmail deep check skipped by policy')),
    Promise.resolve(skippedCheck('api/hireme', 'Google Sheets deep check skipped by policy')),
    checkSpotifyConfig('api/spotify/auth+callback'),
    checkSupabase('api/spotify/now-playing'),
    checkResendAndDns('api/subscribe'),
    checkStatusProvider('api/status'),
  ]);

  const failed = checks.filter((c) => !c.ok);
  const overallHealthy = failed.length === 0;
  const duration = nowMs() - started;

  return NextResponse.json(
    {
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      latencyMs: duration,
      summary: {
        total: checks.length,
        passing: checks.length - failed.length,
        failing: failed.length,
      },
      checks,
    },
    {
      status: overallHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
