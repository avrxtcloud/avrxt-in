import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { sendMail } from '@/lib/ses';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=invalid_token', request.url));
  }

  try {
    const subscriber = await sql`
      SELECT id, email, status, unsubscribe_token FROM newsletter_subscribers 
      WHERE verification_token = ${token}
    `;

    if (subscriber.length === 0) {
      return NextResponse.redirect(new URL('/?error=token_not_found', request.url));
    }

    const { id, email, status, unsubscribe_token } = subscriber[0];

    if (status === 'active') {
       return NextResponse.redirect(new URL('/?message=already_verified', request.url));
    }

    // Update status to active
    await sql`
      UPDATE newsletter_subscribers 
      SET status = 'active', 
          verified_at = CURRENT_TIMESTAMP, 
          verification_token = NULL 
      WHERE id = ${id}
    `;

    // Send Welcome Email
    await sendMail({
      to: email,
      subject: 'Connection Established: Welcome to avrxt.in',
      unsubscribeToken: unsubscribe_token,
      html: `
        <div style="background-color: #000; color: #fff; padding: 40px; font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #1a1a1a; border-radius: 24px; text-align: center;">
          <h1 style="font-size: 24px; font-weight: 900; margin-bottom: 16px;">Greetings, Glory</h1>
          <p style="color: #a1a1aa; line-height: 1.6; margin-bottom: 32px;">
            Welcome to <strong>avrxt.in</strong>. You are now successfully subscribed to the avrxt mailing list.
          </p>
          <div style="border-top: 1px solid #1a1a1a; padding-top: 24px; margin-top: 24px;">
            <p style="font-size: 14px; color: #666; margin-bottom: 4px;">Best regards @avrxt</p>
            <a href="https://www.avrxt.in" style="color: #fff; text-decoration: none; font-size: 12px; font-weight: 700;">www.avrxt.in</a>
          </div>
        </div>
      `,
    });

    return NextResponse.redirect(new URL('/?message=verified_successfully', request.url));
  } catch (error) {
    console.error('VERIFICATION_ERROR:', error);
    return NextResponse.redirect(new URL('/?error=internal_error', request.url));
  }
}
