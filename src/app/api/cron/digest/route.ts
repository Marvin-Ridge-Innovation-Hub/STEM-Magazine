import { NextRequest, NextResponse } from 'next/server';
import { processDigests } from '@/services/digestService';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // Vercel Hobby tier limit

/**
 * Daily digest cron job endpoint
 * Runs at 8:00 AM UTC daily (configured in vercel.json)
 * Processes users with pending digest notifications
 */
export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron or has the correct secret
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // In production, require authorization
  if (process.env.NODE_ENV === 'production') {
    // Vercel Cron jobs include an Authorization header with Bearer token
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('Unauthorized cron request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  try {
    console.log('Starting daily digest processing...');
    const startTime = Date.now();

    const result = await processDigests();

    const duration = Date.now() - startTime;
    console.log(`Digest cron completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: 'Digest processing complete',
      processed: result.processed,
      remaining: result.remaining,
      errors: result.errors,
      durationMs: duration,
    });
  } catch (error) {
    console.error('Digest cron error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process digests',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
