import { NextRequest, NextResponse } from 'next/server';
import { approveSubmissionByToken } from '@/actions/submission.actions';

/**
 * One-click approval endpoint for moderators
 * GET /api/approve?token=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/error?message=Invalid approval link', request.url)
      );
    }

    // Approve submission via token
    const result = await approveSubmissionByToken(token);

    if (!result.success) {
      return NextResponse.redirect(
        new URL(
          `/error?message=${encodeURIComponent(result.error || 'Approval failed')}`,
          request.url
        )
      );
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/approval-success?postId=${result.postId}`, request.url)
    );
  } catch (error) {
    console.error('Error in approval endpoint:', error);
    return NextResponse.redirect(
      new URL('/error?message=An error occurred during approval', request.url)
    );
  }
}
