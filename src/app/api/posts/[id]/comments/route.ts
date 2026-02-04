import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    return NextResponse.json({
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

    if (!userId) {
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

    // Create comment
    const comment = await db.submissionComment.create({
      data: {
        content: content.trim(),
        authorId: user.id,
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
