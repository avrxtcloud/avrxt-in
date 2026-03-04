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
            from: process.env.RESEND_FROM_EMAIL || 'avrxt <mail@notify.avrxt.in>',
            to: sanitizedEmail,
            subject: '✓ NODE_REGISTERED: Welcome to the Transmission List',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=Space+Mono&display=swap');
                    body { margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', sans-serif; }
                    .wrapper { background-color: #000000; padding: 40px 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #050505; border: 1px solid #1a1a1a; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                    .header { padding: 60px 40px 40px; text-align: center; background: radial-gradient(circle at top, #111, #050505); }
                    .tag { display: inline-block; padding: 6px 16px; background-color: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 100px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 24px; }
                    .h1 { color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: -1.5px; margin: 0; line-height: 1.1; }
                    .mono { font-family: 'Space Mono', monospace; font-size: 12px; color: #444; margin-top: 16px; text-transform: uppercase; letter-spacing: 1px; }
                    .content { padding: 0 40px 60px; color: #a1a1aa; line-height: 1.8; font-size: 16px; }
                    .content p { margin-bottom: 24px; }
                    .cta-box { text-align: center; margin-top: 40px; }
                    .btn { display: inline-block; padding: 18px 36px; background-color: #ffffff; color: #000000; text-decoration: none; border-radius: 16px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; transition: all 0.3s ease; }
                    .footer { padding: 40px; background-color: #030303; border-top: 1px solid #1a1a1a; text-align: center; }
                    .footer p { margin: 5px 0; font-size: 12px; color: #444; font-family: 'Space Mono', monospace; text-transform: uppercase; letter-spacing: 1px; }
                    .accent { color: #ffffff; font-weight: 700; }
                </style>
            </head>
            <body>
                <div class="wrapper">
                    <div class="container">
                        <div class="header">
                            <div class="tag">// Access_Established</div>
                            <h1 class="h1">Synchronized<br/><span style="color: #52525b;">To The Core.</span></h1>
                            <p class="mono">Session_ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        </div>
                        <div class="content">
                            <p>Greetings, Sovereign.</p>
                            <p>Your node has been successfully integrated into the <span class="accent">avrxt transmission network</span>. You are now part of an exclusive loop receiving high-fidelity signals on digital infrastructure and architecture.</p>
                            <p>Expect technical deep dives, automation logic, and sovereign design updates delivered directly to your terminal. We keep the signal clear and the vibration high.</p>
                            <div class="cta-box">
                                <a href="https://avrxt.in" class="btn">Explore Infrastructure</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>&copy; 2025 avrxt // Transmission Protocol v3.0</p>
                            <p>One Signal Per Month // Zero Noise</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
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
