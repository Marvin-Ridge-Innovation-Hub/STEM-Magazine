import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const post = await prisma.submission.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Only return approved posts to the public
    if (post.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    const postData = post as any;

    const response = NextResponse.json({
      success: true,
      post: {
        id: postData.id,
        title: postData.title,
        content: postData.content,
        postType: postData.postType,
        thumbnailUrl: postData.thumbnailUrl,
        coverImage: postData.thumbnailUrl,
        images: postData.images || [], // For SM Expo: array of image URLs
        youtubeUrl: postData.youtubeUrl, // For SM Pods: YouTube video URL
        projectLinks: postData.projectLinks || [],
        sources: postData.sources,
        tags: postData.tags || [],
        likeCount: postData.likeCount || 0,
        commentCount: postData.commentCount || 0,
        publishedAt: postData.publishedAt?.toISOString(),
        createdAt: postData.createdAt.toISOString(),
        author: {
          id: postData.author.id,
          name: postData.author.name,
          email: postData.author.email,
          imageUrl: postData.author.image,
        },
      },
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}
