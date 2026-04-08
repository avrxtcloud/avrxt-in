import { resolveMx } from 'node:dns/promises';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';
import { sql } from '@/lib/db';
import { sendMail } from '@/lib/ses';
import { nanoid } from 'nanoid';

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'temp-mail.org',
  'throwawaymail.com',
  'yopmail.com',
  'sharklasers.com',
  'dispostable.com',
  'getairmail.com',
  'maildrop.cc',
  'teleworm.us',
  'dayrep.com',
  'rhyta.com',
]);

const PROHIBITED_DOMAINS = ['avrxt.in', 'avrxt.space', 'aviorxt.aero'];

const BLACKLISTED_EMAILS = new Set(['example@gmail.com', 'spam@gmail.com', 'test@test.com']);

const rateLimit = new LRUCache<string, number>({
  max: 1000,
  ttl: 1000 * 60 * 60 * 24,
});

function getAllowedOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = request.headers.get('origin');
  if (configured && origin && origin === configured) return origin;
  return configured || 'https://www.avrxt.in';
}

function getClientIp(headerList: Headers): string {
  const xForwardedFor = headerList.get('x-forwarded-for');
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const cf = headerList.get('cf-connecting-ip');
  if (cf) return cf;
  return 'anonymous';
}

async function isFakeEmail(email: string): Promise<boolean> {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return true;
  if (DISPOSABLE_DOMAINS.has(domain)) return true;
  try {
    const response = await fetch(`https://api.mailcheck.ai/email/${email}`);
    const data = (await response.json()) as { status?: number; disposable?: boolean; mx?: boolean };
    if (data.status === 200 && (data.disposable || !data.mx)) return true;
  } catch (error) {
    console.error('[SECURITY_API_LOG] External validation bypassed:', error);
  }
  try {
    const mxRecords = await resolveMx(domain);
    return !mxRecords || mxRecords.length === 0;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = (await request.json()) as { email?: string };
    const headerList = await headers();
    const ip = getClientIp(headerList);

    const attempts = rateLimit.get(ip) || 0;
    if (attempts >= 5) {
      return NextResponse.json({ error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
    }
    rateLimit.set(ip, attempts + 1);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitizedEmail = email?.toLowerCase().trim();
    if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ error: 'INVALID_EMAIL_FORMAT' }, { status: 400 });
    }

    const emailDomain = sanitizedEmail.split('@')[1];
    const isProhibited = PROHIBITED_DOMAINS.some((domain) => emailDomain === domain || emailDomain.endsWith(`.${domain}`));
    if (isProhibited) return NextResponse.json({ error: 'DOMAIN_REJECTED' }, { status: 403 });

    if (BLACKLISTED_EMAILS.has(sanitizedEmail)) {
      return NextResponse.json({ error: 'IDENTITY_BLACKLISTED' }, { status: 403 });
    }

    const isFake = await isFakeEmail(sanitizedEmail);
    if (isFake) return NextResponse.json({ error: 'UPLINK_REJECTED' }, { status: 403 });

    // Check if already exists in Neon
    const existing = await sql`
      SELECT status FROM newsletter_subscribers WHERE email = ${sanitizedEmail}
    `;

    if (existing.length > 0) {
      const status = existing[0].status;
      if (status === 'active') {
        return NextResponse.json({ error: 'YOU ARE ALREADY SUBSCRIBED' }, { status: 409 });
      }
      if (status === 'unverified') {
        // Resend verification email? Or just tell them to check their inbox
        return NextResponse.json({ message: 'CHECK_INBOX_FOR_VERIFICATION' });
      }
    }

    // New subscription or re-subscribing
    const verificationToken = nanoid(32);
    const unsubscribeToken = nanoid(32);

    await sql`
      INSERT INTO newsletter_subscribers (email, status, verification_token, unsubscribe_token)
      VALUES (${sanitizedEmail}, 'unverified', ${verificationToken}, ${unsubscribeToken})
      ON CONFLICT (email) DO UPDATE 
      SET status = 'unverified', 
          verification_token = ${verificationToken},
          updated_at = CURRENT_TIMESTAMP
    `;

    // Send Verification Email
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.avrxt.in';
    const verificationUrl = `${siteUrl}/api/subscribe/verify?token=${verificationToken}`;

    await sendMail({
      to: sanitizedEmail,
      subject: 'Verify your subscription - avrxt.in',
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #1a1a1a; border-radius: 24px;">
          <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 16px; text-align: center;">Confirm Subscription</h1>
          <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 32px; text-align: center;">
            Click the button below to verify your email and join the avrxt mailing list.
          </p>
          <div style="text-align: center;">
            <a href="${verificationUrl}" style="background-color: #fff; color: #000; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block;">Verify Email</a>
          </div>
          <div style="border-top: 1px solid #1a1a1a; padding-top: 24px; margin-top: 32px; text-align: center;">
            <p style="font-size: 14px; color: #666;">If you didn't request this, you can ignore this email.</p>
          </div>
        </div>
      `
    });

    return NextResponse.json({ message: 'VERIFICATION_EMAIL_SENT' });
  } catch (error) {
    console.error('CRITICAL_SUBSCRIBE_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_SYSTEM_FAILURE' }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': getAllowedOrigin(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
