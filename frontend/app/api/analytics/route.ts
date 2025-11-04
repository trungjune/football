import { NextRequest, NextResponse } from 'next/server';
// Disabled NextAuth for custom auth
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Since we disabled NextAuth, skip session check for now
    // const session = null; // await getServerSession(authOptions);
    const { type, data } = await request.json();

    // Add server-side enrichment
    const enrichedData = {
      ...data,
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      userId: data.userId || 'anonymous',
      environment: process.env.NODE_ENV,
    };

    // Log analytics data (in production, send to analytics service)
    if (process.env.NODE_ENV === 'production') {
      console.log(`Analytics [${type}]:`, JSON.stringify(enrichedData, null, 2));

      // Here you would send to your analytics service
      // Examples:
      // - Google Analytics 4
      // - Mixpanel
      // - Amplitude
      // - Custom analytics database

      // Example: Send to external analytics service
      if (process.env.ANALYTICS_ENDPOINT) {
        try {
          await fetch(process.env.ANALYTICS_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.ANALYTICS_API_KEY}`,
            },
            body: JSON.stringify({
              type,
              data: enrichedData,
            }),
          });
        } catch (error) {
          console.error('Failed to send to external analytics:', error);
        }
      }
    } else {
      // In development, just log
      console.log(`[DEV] Analytics [${type}]:`, enrichedData);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to process analytics data' }, { status: 500 });
  }
}
