'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Clock,
  Share2,
  ArrowLeft,
  ExternalLink,
  User,
  Target,
  Newspaper,
  Headphones,
} from 'lucide-react';
import CommentSection from '@/components/CommentSection';
import LikeButton from '@/components/LikeButton';
import ImageCarousel from '@/components/ImageCarousel';

// Helper for consistent iconography
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
      return 'SM Expo Project';
    case 'SM_NOW':
      return 'SM Now Article';
    case 'SM_PODS':
      return 'SM Pods Episode';
    default:
      return type;
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
}

export default function PostContent({ post }: PostContentProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: post.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
    );
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-(--background)"
    >
      {/* Back Navigation */}
      <div className="border-b border-(--border) bg-(--card)">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Article Header */}
        <header className="mb-8">
          {/* Category Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span
              className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 ${
                post.postType === 'SM_EXPO'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : post.postType === 'SM_PODS'
                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              }`}
            >
              <PostTypeIcon type={post.postType} className="h-4 w-4" />
              {getPostTypeLabel(post.postType)}
            </span>
            {post.postType !== 'SM_PODS' && (
              <span className="flex items-center gap-1 text-sm text-(--muted-foreground)">
                <Clock className="h-4 w-4" />
                {getReadingTime(post.content)} min read
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-(--foreground) leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author & Date */}
          <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-(--border)">
            <Link
              href={`/author/${post.author?.id}`}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-(--muted) ring-2 ring-transparent group-hover:ring-(--primary) transition-all">
                {post.author?.imageUrl ? (
                  <Image
                    src={post.author.imageUrl}
                    alt={post.author.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-6 w-6 text-(--muted-foreground)" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold text-(--foreground) group-hover:text-(--primary) transition-colors">
                  {post.author?.name || 'MRHS Student'}
                </p>
                <p className="text-sm text-(--muted-foreground)">
                  {formatDate(post.publishedAt || post.createdAt)}
                </p>
              </div>
            </Link>

            {/* Like & Share */}
            <div className="flex items-center gap-3">
              <LikeButton postId={post.id} size="md" />
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-(--border) text-sm font-medium text-(--foreground) hover:bg-(--muted) transition-colors"
              >
                <Share2 className="h-4 w-4" />
                {copied ? 'Copied!' : 'Share'}
              </button>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-4">
              {post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs rounded-full bg-(--muted) text-(--foreground) capitalize"
                >
                  {tag.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image / Image Carousel / YouTube Embed */}
        {post.postType === 'SM_PODS' &&
        post.youtubeUrl &&
        getYouTubeEmbedUrl(post.youtubeUrl) ? (
          <div className="mb-10">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
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
              className="inline-flex items-center gap-2 mt-4 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Watch on YouTube
            </a>
          </div>
        ) : post.postType === 'SM_EXPO' &&
          post.images &&
          post.images.length > 0 ? (
          <div className="mb-10">
            <ImageCarousel
              images={post.images}
              alt={post.title ?? undefined}
              showThumbnails={post.images.length > 1}
              aspectRatio="video"
            />
          </div>
        ) : (
          post.coverImage && (
            <div className="mb-10">
              <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )
        )}

        {/* Article Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
          <div className="text-lg leading-relaxed text-(--foreground) whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Project Links - SM EXPO */}
        {post.postType === 'SM_EXPO' &&
          post.projectLinks &&
          post.projectLinks.length > 0 && (
            <div className="mb-10 p-6 bg-(--card) border border-(--border) rounded-xl">
              <h3 className="text-xl font-bold text-(--foreground) mb-4 flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-blue-600" />
                Project Links
              </h3>
              <div className="space-y-3">
                {post.projectLinks.map((link: string, index: number) => (
                  <a
                    key={index}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-(--primary) hover:underline break-all"
                  >
                    <span className="w-6 h-6 rounded-full bg-(--primary) text-(--primary-foreground) flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </span>
                    {link}
                  </a>
                ))}
              </div>
            </div>
          )}

        {/* Sources - SM NOW */}
        {post.postType === 'SM_NOW' && post.sources && (
          <div className="mb-10 p-6 bg-(--card) border border-(--border) rounded-xl">
            <h3 className="text-xl font-bold text-(--foreground) mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-purple-600" />
              Sources
            </h3>
            <div className="text-(--muted-foreground) whitespace-pre-wrap">
              {post.sources}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentSection postId={post.id} />

        {/* Footer Navigation */}
        <footer className="pt-8 border-t border-(--border)">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-(--primary) font-semibold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all articles
          </Link>
        </footer>
      </article>
    </motion.div>
  );
}
