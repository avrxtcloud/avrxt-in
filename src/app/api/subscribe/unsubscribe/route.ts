import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { token } = (await request.json()) as { token?: string };

    if (!token) {
      return NextResponse.json({ error: 'TOKEN_REQUIRED' }, { status: 400 });
    }

    const result = await sql`
      UPDATE newsletter_subscribers 
      SET status = 'unsubscribed', 
          updated_at = CURRENT_TIMESTAMP 
      WHERE unsubscribe_token = ${token}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'INVALID_TOKEN' }, { status: 404 });
    }

    return NextResponse.json({ message: 'UNSUBSCRIBED_SUCCESSFULLY' });
  } catch (error) {
    console.error('UNSUBSCRIBE_ERROR:', error);
    return NextResponse.json({ error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}

// Allow CORS for the Cloudflare Worker
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Or strictly: 'https://unsubscribe.avrxt.in'
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
