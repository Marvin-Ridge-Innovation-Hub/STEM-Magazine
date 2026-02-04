import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Cast prisma to any to avoid stale type errors after schema update
const db = prisma as any;

// GET like status and count for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    const submission = await db.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    let hasLiked = false;

    if (userId) {
      const user = await db.user.findUnique({
        where: { clerkId: userId },
      });

      if (user) {
        const existingLike = await db.submissionLike.findUnique({
          where: {
            userId_submissionId: {
              userId: user.id,
              submissionId: id,
            },
          },
        });
        hasLiked = !!existingLike;
      }
    }

    return NextResponse.json({
      success: true,
      likeCount: submission.likeCount || 0,
      hasLiked,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}

// POST to toggle like
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to like posts' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get user from database
    const user = await db.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if submission exists and is approved
    const submission = await db.submission.findUnique({
      where: { id, status: 'APPROVED' },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Check if already liked
    const existingLike = await db.submissionLike.findUnique({
      where: {
        userId_submissionId: {
          userId: user.id,
          submissionId: id,
        },
      },
    });

    const currentLikeCount = submission.likeCount || 0;

    if (existingLike) {
      // Unlike
      await db.submissionLike.delete({
        where: { id: existingLike.id },
      });

      await db.submission.update({
        where: { id },
        data: { likeCount: { decrement: 1 } },
      });

      return NextResponse.json({
        success: true,
        hasLiked: false,
        likeCount: Math.max(0, currentLikeCount - 1),
      });
    } else {
      // Like
      await db.submissionLike.create({
        data: {
          userId: user.id,
          submissionId: id,
        },
      });

      await db.submission.update({
        where: { id },
        data: { likeCount: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        hasLiked: true,
        likeCount: currentLikeCount + 1,
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
