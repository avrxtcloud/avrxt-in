import { NextResponse } from 'next/server';

// Ensure this route is never cached by Vercel or CDN
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const start = Date.now();

  try {
    // 1. Logic Check: You can add database pings or cache checks here
    // Example: await db.query('SELECT 1');

    const duration = Date.now() - start;

    return NextResponse.json(
      {
        status: 'healthy',
        uptime: process.uptime(),
        latency: `${duration}ms`,
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV,
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        message: error.message 
      }, 
      { status: 503 } // 503 Service Unavailable is best for failed health checks
    );
  }
}
