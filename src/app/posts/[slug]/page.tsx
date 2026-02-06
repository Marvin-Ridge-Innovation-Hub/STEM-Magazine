import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import PostContent, { type PostContentProps } from './PostContent';

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
type PostRecord = NonNullable<Awaited<ReturnType<typeof getPost>>>;

const serializePost = (post: PostRecord): SerializedPost => ({
  id: post.id,
  title: post.title,
  content: post.content,
  postType: post.postType,
  thumbnailUrl: post.thumbnailUrl ?? undefined,
  coverImage: post.thumbnailUrl ?? undefined,
  images: post.images || [],
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
      <PostContent post={serializedPost} />
    </>
  );
}
