import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const skip = parseInt(searchParams.get('skip') || '0');
    const take = parseInt(searchParams.get('take') || '10');

    const where: any = {
      status: 'APPROVED',
      publishedAt: {
        not: null,
      },
    };

    if (type && type !== 'ALL') {
      where.postType = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination
    const totalCount = await prisma.submission.count({ where });

    const posts = await prisma.submission.findMany({
      where,
      include: {
        author: {
          select: {
            clerkId: true,
            name: true,
            email: true,
            image: true,
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
      skip,
      take,
    });

    return NextResponse.json({
      success: true,
      posts: posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        content: post.content,
        slug: post.id,
        postType: post.postType,
        thumbnailUrl: post.thumbnailUrl,
        coverImage: post.thumbnailUrl,
        projectLinks: post.projectLinks || [],
        sources: post.sources,
        tags: post.tags || [],
        images: post.images || [],
        youtubeUrl: post.youtubeUrl,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        publishedAt: post.publishedAt,
        createdAt: post.createdAt,
        author: {
          id: post.author.clerkId,
          name: post.author.name,
          email: post.author.email,
          imageUrl: post.author.image,
        },
        _count: {
          likes: post._count.likes,
          comments: post._count.comments,
        },
      })),
      pagination: {
        total: totalCount,
        skip,
        take,
        hasMore: skip + take < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
