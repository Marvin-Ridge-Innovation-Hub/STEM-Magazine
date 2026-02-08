import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PostContent, { type PostContentProps } from './PostContent';
import type { ImageAttribution } from '@/types';

export const revalidate = 60;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getDescription = (content: string) => {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 160)}...`;
};

const getExcerpt = (content: string, maxLength = 120) => {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength)}...`;
};

const isValidObjectId = (value: string) => /^[0-9a-fA-F]{24}$/.test(value);

async function getPost(id: string) {
  if (!isValidObjectId(id)) {
    return null;
  }

  const post = await prisma.submission.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!post || post.status !== 'APPROVED') {
    return null;
  }

  return post;
}

type SerializedPost = PostContentProps['post'];
type SerializedRelatedPost = PostContentProps['relatedPosts'][number];
type PostRecord = NonNullable<Awaited<ReturnType<typeof getPost>>>;
type RelatedPostRecord = {
  id: string;
  title: string;
  content: string;
  postType: string;
  thumbnailUrl: string | null;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

const serializePost = (post: PostRecord): SerializedPost => ({
  id: post.id,
  title: post.title,
  content: post.content,
  postType: post.postType,
  thumbnailUrl: post.thumbnailUrl ?? undefined,
  coverImage: post.thumbnailUrl ?? undefined,
  images: post.images || [],
  imageAttributions:
    (post.imageAttributions as ImageAttribution[] | null) ?? undefined,
  thumbnailAttribution:
    (post.thumbnailAttribution as ImageAttribution | null) ?? undefined,
  youtubeUrl: post.youtubeUrl ?? undefined,
  projectLinks: post.projectLinks || [],
  sources: post.sources ?? undefined,
  tags: post.tags || [],
  likeCount: post.likeCount || 0,
  commentCount: post.commentCount || 0,
  publishedAt: post.publishedAt ? post.publishedAt.toISOString() : undefined,
  createdAt: post.createdAt.toISOString(),
  author: {
    id: post.author.id,
    name: post.author.name || 'MRHS Student',
    imageUrl: post.author.image ?? undefined,
  },
});

const serializeRelatedPost = (
  post: RelatedPostRecord
): SerializedRelatedPost => ({
  id: post.id,
  title: post.title,
  excerpt: getExcerpt(post.content, 120),
  postType: post.postType,
  thumbnailUrl: post.thumbnailUrl ?? undefined,
  publishedAt: (post.publishedAt ?? post.createdAt).toISOString(),
  tags: post.tags || [],
  author: {
    id: post.author.id,
    name: post.author.name || 'MRHS Student',
    imageUrl: post.author.image ?? undefined,
  },
});

const getSharedTagCount = (currentTags: string[], candidateTags: string[]) => {
  if (currentTags.length === 0 || candidateTags.length === 0) return 0;

  const candidateSet = new Set(candidateTags);
  return currentTags.reduce(
    (count, tag) => count + (candidateSet.has(tag) ? 1 : 0),
    0
  );
};

async function getRelatedPosts(
  post: PostRecord
): Promise<SerializedRelatedPost[]> {
  const currentTags = post.tags || [];

  const relationFilters: Array<Record<string, unknown>> = [
    { postType: post.postType },
  ];

  if (currentTags.length > 0) {
    relationFilters.push({ tags: { hasSome: currentTags } });
  }

  const primaryCandidates = await prisma.submission.findMany({
    where: {
      status: 'APPROVED',
      publishedAt: { not: null },
      id: { not: post.id },
      OR: relationFilters,
    },
    select: {
      id: true,
      title: true,
      content: true,
      postType: true,
      thumbnailUrl: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 6,
  });

  const rankedPrimary = primaryCandidates
    .map((candidate) => {
      const sharedTagCount = getSharedTagCount(
        currentTags,
        candidate.tags || []
      );
      const sameType = candidate.postType === post.postType;
      const score = sharedTagCount * 10 + (sameType ? 3 : 0);

      return {
        candidate,
        score,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;

      const bTime = (
        b.candidate.publishedAt ?? b.candidate.createdAt
      ).getTime();
      const aTime = (
        a.candidate.publishedAt ?? a.candidate.createdAt
      ).getTime();
      return bTime - aTime;
    })
    .slice(0, 3)
    .map((entry) => entry.candidate as RelatedPostRecord);

  if (rankedPrimary.length < 3) {
    const selectedIds = rankedPrimary.map((item) => item.id);
    const fallbackPosts = await prisma.submission.findMany({
      where: {
        status: 'APPROVED',
        publishedAt: { not: null },
        id: { notIn: [post.id, ...selectedIds] },
      },
      select: {
        id: true,
        title: true,
        content: true,
        postType: true,
        thumbnailUrl: true,
        tags: true,
        publishedAt: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 3 - rankedPrimary.length,
    });

    rankedPrimary.push(...(fallbackPosts as RelatedPostRecord[]));
  }

  return rankedPrimary.slice(0, 3).map(serializeRelatedPost);
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    return { title: 'Post Not Found' };
  }

  const description = getDescription(post.content);
  const authorName = post.author.name || 'MRHS Student';
  const publishedTime = post.publishedAt?.toISOString();
  const ogImages = post.thumbnailUrl
    ? [{ url: post.thumbnailUrl, width: 1200, height: 630 }]
    : undefined;

  return {
    title: post.title,
    description,
    keywords: post.tags || [],
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      publishedTime,
      authors: [authorName],
      images: ogImages,
    },
    twitter: {
      card: post.thumbnailUrl ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: post.thumbnailUrl ? [post.thumbnailUrl] : undefined,
    },
    alternates: {
      canonical: `/posts/${post.id}`,
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) {
    notFound();
  }

  const serializedPost = serializePost(post);
  const relatedPosts = await getRelatedPosts(post);
  const description = getDescription(post.content);
  const publishedDate = (post.publishedAt || post.createdAt).toISOString();
  const canonicalUrl = `https://mrhsstemmag.com/posts/${post.id}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    author: {
      '@type': 'Person',
      name: post.author.name || 'MRHS Student',
    },
    datePublished: publishedDate,
    publisher: {
      '@type': 'Organization',
      name: 'MRHS STEM Magazine',
      url: 'https://mrhsstemmag.com',
    },
    image: post.thumbnailUrl ?? undefined,
    description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PostContent post={serializedPost} relatedPosts={relatedPosts} />
    </>
  );
}
