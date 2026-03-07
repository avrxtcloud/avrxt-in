import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { getGooglePrivateKey } from '@/lib/google-key';

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
    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      projectType?: string;
      budget?: string;
      timeline?: string;
      description?: string;
    };

    const { name, email, projectType, budget, timeline, description } = payload;

    if (!name || !email || !projectType || !budget || !timeline || !description) {
      return NextResponse.json({ message: 'Missing required payload fields.' }, { status: 400 });
    }

    const userEmail = email.trim().toLowerCase();
    if (!isValidEmail(userEmail)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    const privateKey = getGooglePrivateKey(process.env.GOOGLE_PRIVATE_KEY);
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const sheetId = process.env.INTAKE_SHEET_ID;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    const adminEmail = process.env.ADMIN_GMAIL_ID || process.env.ADMIN_EMAIL;

    const warnings: string[] = [];
    let sheetSuccess = false;
    let emailSuccess = false;

    if (privateKey && clientEmail && sheetId) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: clientEmail,
            private_key: privateKey,
          },
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });
        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range: 'Sheet1!A:G',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[new Date().toISOString(), name.trim(), userEmail, projectType.trim(), budget.trim(), timeline.trim(), description.trim()]],
          },
        });
        sheetSuccess = true;
      } catch (sheetError) {
        console.error('HIREME_GOOGLE_SHEETS_ERROR:', sheetError);
        warnings.push('SHEETS_UNAVAILABLE');
      }
    } else {
      warnings.push('SHEETS_CONFIG_MISSING');
    }

    if (gmailPassword && adminEmail) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'aviorxtaero@gmail.com',
            pass: gmailPassword,
          },
        });

        await transporter.sendMail({
          from: '"avrxt_intake" <aviorxtaero@gmail.com>',
          to: adminEmail,
          replyTo: userEmail,
          subject: `NEW_PROJECT: ${escapeHtml(projectType.trim())} - ${escapeHtml(name.trim())}`,
          html: `
            <div style="background:#000; color:#fff; font-family:monospace; padding:30px; border:1px solid #333; max-width:600px; margin:auto;">
              <h2 style="color:#666; font-size:14px; border-bottom:1px solid #222; padding-bottom:10px;">// INTAKE_SIGNAL</h2>
              <p><strong>CLIENT:</strong> ${escapeHtml(name.trim())}</p>
              <p><strong>EMAIL:</strong> ${escapeHtml(userEmail)}</p>
              <p><strong>TYPE:</strong> ${escapeHtml(projectType.trim())}</p>
              <p><strong>BUDGET:</strong> ${escapeHtml(budget.trim())}</p>
              <p><strong>TIMELINE:</strong> ${escapeHtml(timeline.trim())}</p>
              <div style="background:#050505; border:1px solid #222; padding:15px; margin-top:20px; white-space:pre-wrap; color:#ccc; line-height:1.6;">
                ${escapeHtml(description.trim())}
              </div>
            </div>
          `,
        });

        emailSuccess = true;
      } catch (mailError) {
        console.error('HIREME_GMAIL_ERROR:', mailError);
        warnings.push('EMAIL_UNAVAILABLE');
      }
    } else {
      warnings.push('EMAIL_CONFIG_MISSING');
    }

    if (sheetSuccess || emailSuccess) {
      return NextResponse.json({
        message: 'Intake successful.',
        warning: warnings.length ? warnings.join(',') : undefined,
      });
    }

    return NextResponse.json(
      { message: 'TRANSMISSION_DENIED', details: warnings.join(',') || 'No delivery path available.' },
      { status: 503 }
    );
  } catch (error: unknown) {
    console.error('HireMe API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'SYSTEM_FAILURE', details: errorMessage }, { status: 500 });
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
