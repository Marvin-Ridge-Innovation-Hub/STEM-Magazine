'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clock, Headphones, Newspaper, Target } from 'lucide-react';
import { useEffect, useState } from 'react';
import HomeSection from '@/components/HomeSection';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

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
      return <Target className={className} />;
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
      return 'Post';
  }
};

const getPostTypeColor = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'text-[var(--program-expo)]';
    case 'SM_NOW':
      return 'text-[var(--program-now)]';
    case 'SM_PODS':
      return 'text-[var(--program-pods)]';
    default:
      return 'text-[var(--muted-foreground)]';
  }
};

export default function RecentPostsSection() {
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      const response = await fetch('/api/posts?take=3');
      const data = await response.json();
      if (data.success) {
        setRecentPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch recent posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  const getTimeAgo = (date: string | Date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffMs = now.getTime() - postDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const featuredPost = recentPosts[0];
  const secondaryPosts = recentPosts.slice(1, 3);

  return (
    <HomeSection
      variant="band"
      tone="light"
      className="relative py-0 sm:py-0 md:py-0"
    >
      <div className="home-rail home-rail-short" />
      <div className="py-6 sm:py-8 md:py-10">
        <div className="home-grid gap-8 lg:gap-12">
          <motion.div
            className="col-span-12 lg:col-span-4 flex flex-col gap-4 text-center lg:text-left h-full justify-center"
            {...fadeIn}
          >
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] flex items-center gap-2">
              <span className="accent-dot" />
              Latest
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--foreground)]">
              Recent Posts
            </h2>
            <p className="max-w-md text-[var(--muted-foreground)] text-base mx-auto lg:mx-0">
              See the latest student projects, articles, and podcasts from our
              community.
            </p>
            <div className="flex justify-center lg:justify-start">
              <Link href="/posts" className="btn-primary gap-2">
                View All Posts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          <div className="col-span-12 lg:col-span-8">
            {loadingPosts ? (
              <div className="relative">
                <div className="relative grid gap-6 lg:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-start lg:max-w-[900px] lg:ml-auto">
                  <div className="rounded-3xl bg-[var(--muted)] animate-pulse aspect-[16/9]" />
                  <div className="flex flex-col gap-5 lg:pt-4">
                    <div className="rounded-2xl bg-[var(--muted)] animate-pulse aspect-[16/9]" />
                    <div className="rounded-2xl bg-[var(--muted)] animate-pulse aspect-[16/9]" />
                  </div>
                </div>
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="relative">
                <div className="relative grid gap-6 lg:gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-start lg:max-w-[900px] lg:ml-auto">
                  {featuredPost && (
                    <motion.article
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4 }}
                      className="group lg:-rotate-[1.2deg] lg:translate-y-20 lg:origin-bottom-left"
                    >
                      <Link
                        href={`/posts/${featuredPost.slug || featuredPost.id}`}
                        className="block"
                      >
                        <div className="flex flex-col overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[var(--card)] shadow-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">
                          <div className="relative aspect-[16/9] overflow-hidden">
                            {featuredPost.coverImage ||
                            featuredPost.thumbnailUrl ? (
                              <Image
                                src={
                                  featuredPost.coverImage ||
                                  featuredPost.thumbnailUrl
                                }
                                alt={featuredPost.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[var(--muted)]">
                                <PostTypeIcon
                                  type={featuredPost.postType}
                                  className="h-14 w-14 text-[var(--muted-foreground)]"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-4 p-5">
                            <div>
                              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
                                <PostTypeIcon
                                  type={featuredPost.postType}
                                  className={`h-3.5 w-3.5 ${getPostTypeColor(
                                    featuredPost.postType
                                  )}`}
                                />
                                SM {getPostTypeLabel(featuredPost.postType)}
                              </div>
                              <h3 className="font-display text-xl sm:text-2xl leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)]">
                                {featuredPost.title}
                              </h3>
                              <p className="mt-3 line-clamp-2 text-sm text-[var(--muted-foreground)]">
                                {featuredPost.content?.substring(0, 200)}...
                              </p>
                            </div>
                            <div className="mt-5 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                              <Clock className="h-3.5 w-3.5" />
                              {getTimeAgo(
                                featuredPost.publishedAt ||
                                  featuredPost.createdAt
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.article>
                  )}
                  <div className="flex flex-col gap-5 lg:pt-6 lg:pl-2">
                    {secondaryPosts.map((post, index) => (
                      <motion.article
                        key={post.id}
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.35, delay: index * 0.1 }}
                        className={`group ${
                          index === 0
                            ? 'lg:rotate-[1.4deg] lg:translate-y-1 lg:origin-top-right'
                            : 'lg:-rotate-[1deg] lg:translate-y-10 lg:origin-top-right'
                        }`}
                      >
                        <Link
                          href={`/posts/${post.slug || post.id}`}
                          className="block"
                        >
                          <div className="flex flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--card)] shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                            <div className="relative aspect-[16/9] overflow-hidden">
                              {post.coverImage || post.thumbnailUrl ? (
                                <Image
                                  src={post.coverImage || post.thumbnailUrl}
                                  alt={post.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-[var(--muted)]">
                                  <PostTypeIcon
                                    type={post.postType}
                                    className="h-8 w-8 text-[var(--muted-foreground)]"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col gap-3 p-3.5">
                              <div>
                                <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                                  SM {getPostTypeLabel(post.postType)}
                                </div>
                                <h3 className="font-display text-base sm:text-lg leading-tight text-[var(--foreground)] transition-colors group-hover:text-[var(--primary)] line-clamp-2">
                                  {post.title}
                                </h3>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                                <Clock className="h-3 w-3" />
                                {getTimeAgo(post.publishedAt || post.createdAt)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center lg:text-left">
                <p className="text-[var(--muted-foreground)]">
                  No posts yet. Be the first to contribute!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
