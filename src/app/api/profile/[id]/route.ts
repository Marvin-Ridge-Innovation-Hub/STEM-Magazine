import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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
        posts: {
          where: { published: true },
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            excerpt: true,
            coverImage: true,
            postType: true,
            slug: true,
            tags: true,
            publishedAt: true,
            _count: {
              select: {
                comments: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get like counts for each post
    const postsWithLikes = await Promise.all(
      user.posts.map(async (post) => {
        const likeCount = await prisma.submissionLike
          .count({
            where: { submissionId: post.id },
          })
          .catch(() => 0);

        return {
          ...post,
          likeCount,
          commentCount: post._count.comments,
        };
      })
    );

    return NextResponse.json({
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
        posts: postsWithLikes,
        postCount: user.posts.length,
      },
    });
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}
