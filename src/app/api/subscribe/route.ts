import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { LRUCache } from 'lru-cache';
import { headers } from 'next/headers';
import { resolveMx } from 'node:dns/promises';

const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '';

// High-traffic disposable email domains
const DISPOSABLE_DOMAINS = new Set([
    'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'temp-mail.org',
    'throwawaymail.com', 'yopmail.com', 'sharklasers.com', 'dispostable.com',
    'getairmail.com', 'maildrop.cc', 'teleworm.us', 'dayrep.com', 'rhyta.com'
]);

// Internal restricted domains
const PROHIBITED_DOMAINS = ['avrxt.in', 'avrxt.space', 'aviorxt.aero'];

// Specific blacklisted emails
const BLACKLISTED_EMAILS = new Set([
    'example@gmail.com',
    'spam@gmail.com',
    'test@test.com'
]);

// Rate limiter: 5 requests per 24 hours per IP
const rateLimit = new LRUCache<string, number>({
    max: 1000,
    ttl: 1000 * 60 * 60 * 24,
});

async function isFakeEmail(email: string): Promise<boolean> {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return true;

    // 1. Check local blacklist
    if (DISPOSABLE_DOMAINS.has(domain)) return true;

    // 2. External Security Check (Free API: mailcheck.ai)
    try {
        const response = await fetch(`https://api.mailcheck.ai/email/${email}`);
        const data = await response.json();
        
        // If API explicitly marks as disposable or invalid MX
        if (data.status === 200 && (data.disposable || !data.mx)) {
            return true;
        }
    } catch (e) {
        console.error('[SECURITY_API_LOG] External validation bypassed due to error:', e);
    }

    // 3. Technical Handshake: MX Record Lookup (Fallback)
    try {
        const mxRecords = await resolveMx(domain);
        return !mxRecords || mxRecords.length === 0;
    } catch (e) {
        return true;
    }
}

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for') || 'anonymous';

        // 1. Rate Limit Check
        const attempts = rateLimit.get(ip) || 0;
        if (attempts >= 5) {
            return NextResponse.json(
                { error: 'RATE_LIMIT_EXCEEDED: PLEASE_TRY_AGAIN_TOMORROW' },
                { status: 429 }
            );
        }
        rateLimit.set(ip, attempts + 1);

        // 2. Format & Sanity Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const sanitizedEmail = email?.toLowerCase().trim();
        if (!sanitizedEmail || !emailRegex.test(sanitizedEmail)) {
            return NextResponse.json(
                { error: 'INVALID_EMAIL_FORMAT' },
                { status: 400 }
            );
        }

        // 2.1 Restricted Domain Check
        const emailDomain = sanitizedEmail.split('@')[1];
        const isProhibited = PROHIBITED_DOMAINS.some(domain => 
            emailDomain === domain || emailDomain.endsWith(`.${domain}`)
        );

        if (isProhibited) {
            return NextResponse.json(
                { error: 'YOU ARE NOT ALLOWED TO USE THIS DOMAIN' },
                { status: 403 }
            );
        }

        // 2.2 Specific Email Blacklist
        if (BLACKLISTED_EMAILS.has(sanitizedEmail)) {
            return NextResponse.json(
                { error: 'IDENTITY_BLACKLISTED: ACCESS_DENIED' },
                { status: 403 }
            );
        }

        // 3. Fake/Disposable Detection (Shield Protocol)
        const isFake = await isFakeEmail(sanitizedEmail);
        if (isFake) {
            console.warn(`[SHIELD_TRIGGERED] Blocked fake identity: ${sanitizedEmail}`);
            // We return a generic error to not expose our detection logic too much
            return NextResponse.json(
                { error: 'UPLINK_REJECTED: UNRELIABLE_DOMAIN' },
                { status: 403 }
            );
        }

        if (!process.env.RESEND_API_KEY || !AUDIENCE_ID) {
            console.error('RESEND_CONFIG_MISSING');
            return NextResponse.json(
                { error: 'EMAIL_SERVICE_NOT_CONFIGURED' },
                { status: 503 }
            );
        }

        const resend = new Resend(process.env.RESEND_API_KEY);

        // 4. Check Persistence (Check if already in Audience)
        const { data: contacts, error: listError } = await resend.contacts.list({
            audienceId: AUDIENCE_ID,
        });

        if (listError) {
            console.error('RESEND_LIST_ERROR:', listError);
            throw new Error(listError.message);
        }

        const isAlreadySubscribed = contacts?.data?.some(
            (contact) => contact.email.toLowerCase() === sanitizedEmail
        );

        if (isAlreadySubscribed) {
            return NextResponse.json(
                { error: 'YOU ARE ALREADY SUBSCRIBED' },
                { status: 409 }
            );
        }

        // 5. Create Contact
        const { error: createError } = await resend.contacts.create({
            email: sanitizedEmail,
            unsubscribed: false,
            audienceId: AUDIENCE_ID,
        });

        if (createError) {
            if (createError.message.toLowerCase().includes('already exists')) {
                return NextResponse.json(
                    { error: 'YOU ARE ALREADY SUBSCRIBED' },
                    { status: 409 }
                );
            }
            throw new Error(createError.message);
        }

        // 6. Dispatch Premium Welcome Email
        const { error: emailError } = await resend.emails.send({
            from: 'Glory at avrxt.in <notify@mail.avrxt.in>',
            to: sanitizedEmail,
            subject: '✓ Connection Established: Welcome to avrxt.in',
            html: `
            <div style="background-color: #000; color: #fff; padding: 40px; font-family: 'Inter', sans-serif; max-width: 500px; margin: auto; border: 1px solid #1a1a1a; border-radius: 24px; text-align: center;">
                <img src="https://www.avrxt.in/logo.png" alt="avrxt logo" style="width: 60px; height: 60px; margin-bottom: 24px;">
                <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 16px;">Greetings, Glory</h1>
                <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 32px;">
                    Welcome to <strong>avrxt.in</strong>. You are now successfully subscribed to the avrxt mailing list.
                </p>
                <div style="border-top: 1px solid #1a1a1a; padding-top: 24px; margin-top: 24px;">
                    <p style="font-size: 14px; color: #666; margin-bottom: 4px;">Best regards @avrxt</p>
                    <a href="https://www.avrxt.in" style="color: #fff; text-decoration: none; font-size: 12px; font-weight: 700;">www.avrxt.in</a>
                </div>
            </div>
            `
        });

        if (emailError) {
            console.error('EMAIL_DISPATCH_ERROR:', emailError);
            return NextResponse.json({ 
                message: 'SUCCESSFULLY SUBSCRIBED', 
                warning: 'WELCOME_EMAIL_DELAYED' 
            });
        }

        return NextResponse.json({ message: 'SUCCESSFULLY SUBSCRIBED' });

    } catch (error: any) {
        console.error('CRITICAL_SUBSCRIBE_ERROR:', error);
        return NextResponse.json(
            { error: 'INTERNAL_SYSTEM_FAILURE' },
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
