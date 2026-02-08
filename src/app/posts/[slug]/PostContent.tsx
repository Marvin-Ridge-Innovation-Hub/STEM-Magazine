'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Headphones,
  Newspaper,
  Share2,
  Target,
  User,
} from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import LikeButton from '@/components/LikeButton';
import ImageCarousel from '@/components/ImageCarousel';
import MarkdownContent from '@/components/MarkdownContent';
import ImageAttribution from '@/components/ImageAttribution';
import type { ImageAttribution as ImageAttributionType } from '@/types';

const PostTypeIcon = ({
  type,
  className,
}: {
  type: string;
  className?: string;
}) => {
  switch (type) {
    case 'SM_EXPO':
      return <Target className={className} />;
    case 'SM_NOW':
      return <Newspaper className={className} />;
    case 'SM_PODS':
      return <Headphones className={className} />;
    default:
      return null;
  }
};

const getPostTypeLabel = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'Expo';
    case 'SM_NOW':
      return 'Now';
    case 'SM_PODS':
      return 'Pods';
    default:
      return type;
  }
};

const getPostTypeChipClass = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'program-chip-expo';
    case 'SM_NOW':
      return 'program-chip-now';
    case 'SM_PODS':
      return 'program-chip-pods';
    default:
      return 'bg-[var(--muted)] text-[var(--foreground)]';
  }
};

export interface PostContentProps {
  post: {
    id: string;
    title: string;
    content: string;
    postType: string;
    thumbnailUrl?: string;
    coverImage?: string;
    images: string[];
    imageAttributions?: ImageAttributionType[];
    thumbnailAttribution?: ImageAttributionType;
    youtubeUrl?: string;
    projectLinks: string[];
    sources?: string;
    tags: string[];
    likeCount: number;
    commentCount: number;
    publishedAt?: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      imageUrl?: string;
    };
  };
  relatedPosts: Array<{
    id: string;
    title: string;
    excerpt: string;
    postType: string;
    thumbnailUrl?: string;
    publishedAt: string;
    tags: string[];
    author: {
      id: string;
      name: string;
      imageUrl?: string;
    };
  }>;
}

export default function PostContent({ post, relatedPosts }: PostContentProps) {
  const [copied, setCopied] = useState(false);
  const shellClass = 'mx-auto w-full max-w-3xl';

  const handleShare = async () => {
    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({ title: post.title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content?.trim().split(/\s+/).length || 0;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCompactDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const publishedDate = formatDate(post.publishedAt || post.createdAt);
  const readingMeta =
    post.postType === 'SM_PODS'
      ? null
      : `${getReadingTime(post.content)} min read`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[var(--background)]"
    >
      <header className="page-header relative overflow-hidden py-8 sm:py-10">
        <div className="absolute -top-20 right-[-2rem] h-56 w-56 rounded-full bg-[color:var(--accent)/14] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 left-[12%] h-44 w-44 rounded-full bg-[color:var(--primary)/10] blur-3xl pointer-events-none" />

        <div className="section-container relative">
          <div className={`${shellClass} space-y-5`}>
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Articles
            </Link>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted-foreground)] inline-flex items-center gap-2">
                <span className="accent-dot" />
                SM {getPostTypeLabel(post.postType)}
              </p>
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--foreground)] leading-tight">
                {post.title}
              </h1>
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {post.tags.map((tag) => (
                    <span key={tag} className="chip-outline text-xs capitalize">
                      {tag.replace('-', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-[color:var(--border)] pt-4 flex items-center justify-between gap-4 flex-wrap">
              <Link
                href={`/author/${post.author.id}`}
                className="inline-flex items-center gap-3 group"
              >
                <div className="relative h-9 w-9 rounded-full overflow-hidden bg-[var(--muted)] border border-[color:var(--border)]">
                  {post.author.imageUrl ? (
                    <Image
                      src={post.author.imageUrl}
                      alt={post.author.name || 'Author'}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                  {post.author.name || 'MRHS Student'}
                </p>
              </Link>

              <div className="text-sm text-[var(--muted-foreground)] inline-flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {publishedDate}
                  {readingMeta ? ` | ${readingMeta}` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <article className="py-10 sm:py-12">
        <div className="section-container">
          <div className={shellClass}>
            {post.postType === 'SM_PODS' &&
            post.youtubeUrl &&
            getYouTubeEmbedUrl(post.youtubeUrl) ? (
              <div className="mb-10 space-y-3">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-[color:var(--border)]">
                  <iframe
                    src={getYouTubeEmbedUrl(post.youtubeUrl)!}
                    title={post.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <a
                  href={post.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Watch on YouTube
                </a>
              </div>
            ) : post.postType === 'SM_EXPO' &&
              post.images &&
              post.images.length > 0 ? (
              <div className="mb-10 rounded-2xl overflow-hidden border border-[color:var(--border)]">
                <ImageCarousel
                  images={post.images}
                  alt={post.title ?? undefined}
                  showThumbnails={post.images.length > 1}
                  aspectRatio="video"
                  attributions={post.imageAttributions}
                  author={{ id: post.author.id, name: post.author.name }}
                />
              </div>
            ) : (
              post.coverImage && (
                <div className="mb-10 space-y-2">
                  <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden border border-[color:var(--border)]">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <ImageAttribution
                    attribution={post.thumbnailAttribution}
                    author={{ id: post.author.id, name: post.author.name }}
                    className="px-1"
                  />
                </div>
              )
            )}

            <div className="mb-12">
              <MarkdownContent
                content={post.content}
                className="max-w-none text-[1.06rem] leading-8"
              />
            </div>

            {post.postType === 'SM_EXPO' &&
              post.projectLinks &&
              post.projectLinks.length > 0 && (
                <div className="mb-10 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 sm:p-6">
                  <h2 className="font-display text-xl text-[var(--foreground)] mb-4 flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-[var(--program-expo)]" />
                    Project Links
                  </h2>
                  <div className="space-y-3">
                    {post.projectLinks.map((link: string, index: number) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[var(--primary)] hover:underline break-all"
                      >
                        <span className="w-6 h-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center text-xs font-semibold shrink-0">
                          {index + 1}
                        </span>
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            {post.postType === 'SM_NOW' && post.sources && (
              <div className="mb-10 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-5 sm:p-6">
                <h2 className="font-display text-xl text-[var(--foreground)] mb-4 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-[var(--program-now)]" />
                  Sources
                </h2>
                <div className="text-[var(--muted-foreground)] whitespace-pre-wrap leading-relaxed">
                  {post.sources}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[var(--muted-foreground)]">
                Enjoyed this piece? Support the author and share it.
              </p>
              <div className="flex items-center gap-3">
                <LikeButton postId={post.id} size="md" />
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[color:var(--border)] bg-[var(--background)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <section
              className={`${shellClass} border-t border-[color:var(--border)] pt-10 mt-12`}
            >
              <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] inline-flex items-center gap-2">
                <span className="accent-dot" />
                Related
              </div>
              <h2 className="mt-2 font-display text-2xl text-[var(--foreground)]">
                More Stories
              </h2>

              <div className="mt-6 space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id}>
                    <Link
                      href={`/posts/${relatedPost.id}`}
                      className="group flex gap-4 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-3 sm:p-4 shadow-sm transition-all duration-300 hover:shadow-md"
                    >
                      <div className="relative h-24 w-32 sm:h-28 sm:w-40 shrink-0 overflow-hidden rounded-xl bg-[var(--muted)]">
                        {relatedPost.thumbnailUrl ? (
                          <Image
                            src={relatedPost.thumbnailUrl}
                            alt={relatedPost.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <PostTypeIcon
                              type={relatedPost.postType}
                              className="h-8 w-8 text-[var(--muted-foreground)]"
                            />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${getPostTypeChipClass(
                              relatedPost.postType
                            )}`}
                          >
                            <PostTypeIcon
                              type={relatedPost.postType}
                              className="h-3 w-3"
                            />
                            SM {getPostTypeLabel(relatedPost.postType)}
                          </span>
                          <span className="text-xs text-[var(--muted-foreground)]">
                            {formatCompactDate(relatedPost.publishedAt)}
                          </span>
                        </div>

                        <h3 className="font-display text-lg leading-tight text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="mt-2 text-sm text-[var(--muted-foreground)] line-clamp-2">
                          {relatedPost.excerpt}
                        </p>

                        <p className="mt-2 text-xs text-[var(--muted-foreground)] truncate">
                          By {relatedPost.author.name}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          )}

          <div className={`${shellClass} mt-12`}>
            <CommentSection postId={post.id} />
          </div>

          <footer
            className={`${shellClass} pt-8 mt-8 border-t border-[color:var(--border)]`}
          >
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 text-[var(--primary)] font-semibold hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to all articles
            </Link>
          </footer>
        </div>
      </article>
    </motion.div>
  );
}
