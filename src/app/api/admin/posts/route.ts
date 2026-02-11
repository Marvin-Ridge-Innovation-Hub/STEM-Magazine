import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { deleteSubmission } from '@/services/submissionService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Check if user can access admin moderation routes
async function checkAdminAccess() {
  const { userId } = await auth();
  if (!userId) return false;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  const normalizedRole =
    typeof user?.role === 'string' ? user.role.toUpperCase() : 'USER';
  return normalizedRole === 'MODERATOR' || normalizedRole === 'ADMIN';
}

// GET - Get all published posts (for admin view)
export async function GET() {
  try {
    const hasAdminAccess = await checkAdminAccess();
    if (!hasAdminAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const posts = await prisma.submission.findMany({
      where: {
        status: 'APPROVED',
        publishedAt: { not: null },
      },
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    const response = NextResponse.json({
      success: true,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        postType: post.postType,
        thumbnailUrl: post.thumbnailUrl,
        coverImage: post.thumbnailUrl,
        publishedAt: post.publishedAt,
        author: {
          id: post.author.clerkId,
          name: post.author.name,
          email: post.author.email,
        },
        likeCount: post._count.likes,
        commentCount: post._count.comments,
      })),
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching posts for admin:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a post (submission)
export async function DELETE(request: NextRequest) {
  try {
    const hasAdminAccess = await checkAdminAccess();
    if (!hasAdminAccess) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Find the submission/post
    const post = await prisma.submission.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Use the shared service so approved submissions also clean up legacy posts.
    await deleteSubmission(postId);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
