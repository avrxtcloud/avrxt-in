import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getAllowedOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const origin = request.headers.get('origin');
  if (configured && origin && origin === configured) return origin;
  return configured || 'https://www.avrxt.in';
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, message } = (await request.json()) as { name?: string; email?: string; message?: string };

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userEmail = email.trim().toLowerCase();
    if (!isValidEmail(userEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const safeName = escapeHtml(name.trim());
    const safeEmail = escapeHtml(userEmail);
    const safeMessage = escapeHtml(message.trim());

    // Removed Google Sheets logic as per user request.

    if (process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'aviorxtaero@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: '"avrxt Terminal" <aviorxtaero@gmail.com>',
        to: 'irgtxpc@gmail.com',
        replyTo: userEmail,
        subject: `NEW_SIGNAL: ${safeName}`,
        html: `
          <div style="background:#000; color:#fff; font-family:monospace; padding:30px; border:1px solid #333;">
            <h2 style="color:#666; font-size:14px; border-bottom:1px solid #222; padding-bottom:10px;">// INCOMING_PAYLOAD</h2>
            <p style="margin:20px 0;"><strong>SENDER:</strong> ${safeName}</p>
            <p style="margin:20px 0;"><strong>ADDRESS:</strong> ${safeEmail}</p>
            <div style="background:#050505; border:1px solid #222; padding:15px; margin-top:20px; white-space:pre-wrap; color:#ccc; line-height:1.6;">${safeMessage}</div>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, message: 'Signal stored and transmitted.' });
  } catch (error: unknown) {
    console.error('CONTACT_API_ERROR:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'SYSTEM_FAILURE', details: errorMessage }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': getAllowedOrigin(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
