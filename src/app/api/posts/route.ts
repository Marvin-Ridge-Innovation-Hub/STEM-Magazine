import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PostType, type Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 24;

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, MAX_LIMIT);
};

const normalizeTag = (tag: string) =>
  tag.toLowerCase().trim().replace(/\s+/g, '-');

const parseTags = (searchParams: URLSearchParams) =>
  searchParams
    .getAll('tag')
    .flatMap((value) => value.split(','))
    .map(normalizeTag)
    .filter((tag, index, tags) => tag && tags.indexOf(tag) === index);

const encodeCursor = (post: {
  id: string;
  publishedAt: Date | null;
  createdAt: Date;
}) =>
  Buffer.from(
    JSON.stringify({
      publishedAt: post.publishedAt?.toISOString() ?? null,
      createdAt: post.createdAt.toISOString(),
      id: post.id,
    })
  ).toString('base64url');

const decodeCursor = (cursor: string | null) => {
  if (!cursor) return null;

  try {
    const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString());
    if (
      typeof parsed !== 'object' ||
      typeof parsed.id !== 'string' ||
      typeof parsed.createdAt !== 'string'
    ) {
      return null;
    }

    const publishedAt =
      typeof parsed.publishedAt === 'string'
        ? new Date(parsed.publishedAt)
        : null;
    const createdAt = new Date(parsed.createdAt as string);

    if (
      (publishedAt && Number.isNaN(publishedAt.getTime())) ||
      Number.isNaN(createdAt.getTime())
    ) {
      return null;
    }

    return {
      id: parsed.id as string,
      publishedAt,
      createdAt,
    };
  } catch {
    return null;
  }
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type');
    const search = searchParams.get('search') || searchParams.get('query');
    const legacySkip = Number.parseInt(searchParams.get('skip') || '', 10);
    const limit = parsePositiveInt(
      searchParams.get('limit') || searchParams.get('take'),
      DEFAULT_LIMIT
    );
    const tags = parseTags(searchParams);
    const cursor = decodeCursor(searchParams.get('cursor'));

    const where: Prisma.SubmissionWhereInput = {
      status: 'APPROVED',
      publishedAt: {
        not: null,
      },
    };

    if (
      type &&
      type !== 'ALL' &&
      Object.values(PostType).includes(type as PostType)
    ) {
      where.postType = type as PostType;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ] as Prisma.SubmissionWhereInput['OR'];
    }

    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    const paginationWhere: Prisma.SubmissionWhereInput =
      cursor && cursor.publishedAt
        ? {
            OR: [
              { publishedAt: { lt: cursor.publishedAt } },
              {
                publishedAt: cursor.publishedAt,
                createdAt: { lt: cursor.createdAt },
              },
              {
                publishedAt: cursor.publishedAt,
                createdAt: cursor.createdAt,
                id: { lt: cursor.id },
              },
            ],
          }
        : {};

    const combinedWhere =
      cursor && cursor.publishedAt ? { AND: [where, paginationWhere] } : where;

    const totalCount = await prisma.submission.count({ where });

    const posts = await prisma.submission.findMany({
      where: combinedWhere,
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
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      skip: cursor ? 0 : Number.isFinite(legacySkip) ? legacySkip : 0,
      take: limit + 1,
    });

    const visiblePosts = posts.slice(0, limit);
    const nextCursor =
      posts.length > limit && visiblePosts.length > 0
        ? encodeCursor(visiblePosts[visiblePosts.length - 1])
        : null;

    const response = NextResponse.json({
      success: true,
      posts: visiblePosts.map((post: any) => ({
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
        imageAttributions: post.imageAttributions ?? undefined,
        thumbnailAttribution: post.thumbnailAttribution ?? undefined,
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
        skip: Number.isFinite(legacySkip) ? legacySkip : 0,
        take: limit,
        limit,
        cursor: searchParams.get('cursor'),
        nextCursor,
        hasMore: Boolean(nextCursor),
      },
      nextCursor,
      hasMore: Boolean(nextCursor),
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}
