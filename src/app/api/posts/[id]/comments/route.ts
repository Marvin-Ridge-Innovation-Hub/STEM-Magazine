import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateUserProfile } from '@/services/userProfileService';
import {
  moderateContent,
  sanitizeContent,
  COMMENT_MAX_LENGTH,
} from '@/lib/contentModeration';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Cast prisma to any to avoid stale type errors after schema update
const db = prisma as any;

// GET comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await db.submissionComment.findMany({
      where: {
        submissionId: id,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            image: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                clerkId: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const response = NextResponse.json({
      success: true,
      comments: comments.map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.clerkId,
          name: comment.author.name,
          imageUrl: comment.author.image,
        },
        replies: comment.replies.map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt.toISOString(),
          author: {
            id: reply.author.clerkId,
            name: reply.author.name,
            imageUrl: reply.author.image,
          },
        })),
      })),
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to comment' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { content, parentId } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Comment content is required' },
        { status: 400 }
      );
    }

    // Sanitize and moderate content
    const sanitizedContent = sanitizeContent(content);
    const moderationResult = moderateContent(sanitizedContent);

    if (!moderationResult.isClean) {
      return NextResponse.json(
        {
          success: false,
          error:
            moderationResult.reason || 'Comment contains inappropriate content',
          maxLength: COMMENT_MAX_LENGTH,
        },
        { status: 400 }
      );
    }

    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    // Check if submission exists and is approved
    const submission = await db.submission.findUnique({
      where: { id },
    });

    if (!submission || submission.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Create comment with sanitized content
    const comment = await db.submissionComment.create({
      data: {
        content: sanitizedContent,
        authorId: userProfile.id,
        submissionId: id,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            clerkId: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update comment count
    await db.submission.update({
      where: { id },
      data: { commentCount: { increment: 1 } },
    });

    // Flag for digest notifications
    if (parentId) {
      // This is a reply - flag the parent comment author (if not replying to self)
      const parentComment = await db.submissionComment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });

      if (parentComment && parentComment.authorId !== userProfile.id) {
        await db.newsletterSubscription.updateMany({
          where: {
            userId: parentComment.authorId,
            digestEnabled: true,
            emailOnReply: true,
            emailEnabled: true,
          },
          data: { hasPendingDigest: true },
        });
      }
    } else {
      // This is a top-level comment - flag the post author (if not commenting on own post)
      if (submission.authorId !== userProfile.id) {
        await db.newsletterSubscription.updateMany({
          where: {
            userId: submission.authorId,
            digestEnabled: true,
            emailOnComment: true,
            emailEnabled: true,
          },
          data: { hasPendingDigest: true },
        });
      }
    }

    return NextResponse.json({
      success: true,
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
        author: {
          id: comment.author.clerkId,
          name: comment.author.name,
          imageUrl: comment.author.image,
        },
        replies: [],
      },
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
