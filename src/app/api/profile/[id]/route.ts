import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET /api/profile/[id] - Get a user's public profile by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        website: true,
        twitter: true,
        github: true,
        linkedin: true,
        instagram: true,
        youtube: true,
        createdAt: true,
        submissions: {
          where: {
            status: 'APPROVED',
            publishedAt: { not: null },
          },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            content: true,
            thumbnailUrl: true,
            postType: true,
            tags: true,
            publishedAt: true,
            likeCount: true,
            commentCount: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const posts = user.submissions.map((submission) => {
      const normalizedContent = submission.content.replace(/\s+/g, ' ').trim();
      const excerpt =
        normalizedContent.length > 140
          ? `${normalizedContent.slice(0, 140).trimEnd()}...`
          : normalizedContent;

      return {
        id: submission.id,
        title: submission.title,
        excerpt,
        coverImage: submission.thumbnailUrl,
        postType: submission.postType,
        slug: submission.id,
        tags: submission.tags,
        publishedAt: submission.publishedAt,
        likeCount: submission.likeCount,
        commentCount: submission.commentCount,
      };
    });

    const response = NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        image: user.image,
        bio: user.bio,
        website: user.website,
        twitter: user.twitter,
        github: user.github,
        linkedin: user.linkedin,
        instagram: user.instagram,
        youtube: user.youtube,
        createdAt: user.createdAt,
        posts,
        postCount: posts.length,
      },
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}
