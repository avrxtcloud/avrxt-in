import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/lib/auth-checks';

export async function POST(req: NextRequest) {
    // Verify admin session
    const { authorized } = await verifyAdmin();
    if (!authorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    if (!url) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    if (!keyJson) {
        return NextResponse.json({ error: 'Google service account key not configured' }, { status: 500 });
    }

    try {
        // Parse service account key
        const key = JSON.parse(keyJson);

        // Create JWT for Google API authentication
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: key.client_email,
            scope: 'https://www.googleapis.com/auth/indexing',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now,
        };

        // Build JWT manually (no external library needed)
        const header = { alg: 'RS256', typ: 'JWT' };
        const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
        const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
        const signingInput = `${encodedHeader}.${encodedPayload}`;

        // Sign with RSA private key using Web Crypto API
        const privateKey = key.private_key.replace(/\\n/g, '\n');
        const pemBody = privateKey.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, '');
        const binaryKey = Buffer.from(pemBody, 'base64');

        const cryptoKey = await crypto.subtle.importKey(
            'pkcs8',
            binaryKey,
            { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
            false,
            ['sign']
        );

        const signature = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            cryptoKey,
            Buffer.from(signingInput)
        );

        const encodedSignature = Buffer.from(signature).toString('base64url');
        const jwt = `${signingInput}.${encodedSignature}`;

        // Exchange JWT for access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt,
            }),
        });

        const tokenData = await tokenRes.json();
        if (!tokenData.access_token) {
            return NextResponse.json({ error: 'Failed to get access token', details: tokenData }, { status: 500 });
        }

        // Call Google Indexing API
        const indexingRes = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                url,
                type: 'URL_UPDATED',
            }),
        });

        const indexingData = await indexingRes.json();

        if (!indexingRes.ok) {
            return NextResponse.json({ error: 'Indexing API error', details: indexingData }, { status: 500 });
        }

        console.log(`[GSC_INDEX] Submitted: ${url}`);
        return NextResponse.json({ success: true, data: indexingData });
    } catch (err: any) {
        console.error('[GSC_INDEX] Error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
