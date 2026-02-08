'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Search,
  X,
  Heart,
  Target,
  Newspaper,
  Headphones,
  LayoutGrid,
} from 'lucide-react';

// Icon mapping for consistent iconography
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
      return <LayoutGrid className={className} />;
  }
};

const getPostTypeColors = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'SM_NOW':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'SM_PODS':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-600';
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
      return 'All';
  }
};

// Available tags for filtering
const ALL_TAGS = [
  'health',
  'technology',
  'engineering',
  'mathematics',
  'environment',
  'biology',
  'chemistry',
  'physics',
  'computer-science',
  'ai',
];

// Regular Post Card Component
const PostCard = ({
  post,
  index,
  getTimeAgo,
  className,
}: {
  post: any;
  index: number;
  getTimeAgo: (date: string | Date) => string;
  className?: string;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
    className={`group ${className ?? ''}`}
  >
    <Link href={`/posts/${post.slug || post.id}`} className="block h-full">
      <div className="relative rounded-2xl overflow-hidden bg-[var(--card)] border border-[color:var(--border)] flex flex-col shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-[var(--muted)] flex items-center justify-center">
              <PostTypeIcon
                type={post.postType}
                className="h-10 w-10 text-[var(--muted-foreground)]"
              />
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-1 gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] font-semibold uppercase tracking-[0.22em] inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${getPostTypeColors(
                  post.postType
                )}`}
              >
                <PostTypeIcon type={post.postType} className="h-3 w-3" />
                SM {getPostTypeLabel(post.postType)}
              </span>
              <span className="text-xs text-[var(--muted-foreground)]">
                {getTimeAgo(post.publishedAt || post.createdAt)}
              </span>
            </div>
            <h3 className="font-display text-base text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-snug line-clamp-2">
              {post.title}
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mt-2">
              {post.excerpt || post.content?.substring(0, 80)}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[color:var(--border)]">
            <div className="flex items-center gap-2">
              {post.author?.imageUrl ? (
                <div className="relative w-5 h-5 rounded-full overflow-hidden">
                  <Image
                    src={post.author.imageUrl}
                    alt={post.author.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-[var(--muted)] flex items-center justify-center">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    {(post.author?.name || 'A')[0]}
                  </span>
                </div>
              )}
              <span className="text-xs text-[var(--muted-foreground)] truncate max-w-20">
                {post.author?.name || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
              <Heart className="h-3 w-3" />
              {post._count?.likes || 0}
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.article>
);

// Featured Post Card Component
const FeaturedCard = ({
  post,
  getTimeAgo,
  className,
}: {
  post: any;
  getTimeAgo: (date: string | Date) => string;
  className?: string;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className={`group ${className ?? ''}`}
  >
    <Link href={`/posts/${post.slug || post.id}`} className="block">
      <div className="relative rounded-3xl overflow-hidden bg-[var(--card)] border border-[color:var(--border)] shadow-xl transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-2xl">
        <div className="relative w-full aspect-[16/9] overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-[var(--muted)] flex items-center justify-center">
              <PostTypeIcon
                type={post.postType}
                className="h-16 w-16 text-[var(--muted-foreground)]"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
        </div>

        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.22em] inline-flex items-center gap-1.5 ${getPostTypeColors(
                post.postType
              )}`}
            >
              <PostTypeIcon type={post.postType} className="h-3.5 w-3.5" />
              SM {getPostTypeLabel(post.postType)}
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">
              {getTimeAgo(post.publishedAt || post.createdAt)}
            </span>
          </div>
          <h2 className="font-display text-2xl lg:text-3xl text-[var(--foreground)] leading-tight line-clamp-2">
            {post.title}
          </h2>
          <p className="text-sm lg:text-base text-[var(--muted-foreground)] line-clamp-1">
            {post.excerpt || post.content?.substring(0, 150)}
          </p>
          <div className="flex items-center gap-3 pt-2 border-t border-[color:var(--border)]">
            {post.author?.imageUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-[color:var(--border)]">
                <Image
                  src={post.author.imageUrl}
                  alt={post.author.name || 'Author'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--muted)] flex items-center justify-center">
                <span className="text-sm font-medium text-[var(--muted-foreground)]">
                  {(post.author?.name || 'A')[0]}
                </span>
              </div>
            )}
            <span className="text-sm text-[var(--foreground)] font-medium">
              {post.author?.name || 'Anonymous'}
            </span>
            <div className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] ml-auto">
              <Heart className="h-4 w-4" />
              {post._count?.likes || 0}
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.article>
);

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  const INITIAL_LOAD = 10;
  const LOAD_MORE_COUNT = 4;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    loadPosts(true);
  }, []);

  const loadPosts = async (initial = false) => {
    try {
      if (initial) {
        setLoading(true);
        setPosts([]);
      } else {
        setLoadingMore(true);
      }

      const skip = initial ? 0 : posts.length;
      const take = initial ? INITIAL_LOAD : LOAD_MORE_COUNT;

      const response = await fetch(`/api/posts?skip=${skip}&take=${take}`);
      const data = await response.json();

      if (initial) {
        setPosts(data.posts || []);
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])]);
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Failed to load posts:', error);
      if (initial) setPosts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Filter posts based on search, type, and tags
  const filteredPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      // Type filter
      const matchesType =
        selectedType === 'ALL' || post.postType === selectedType;

      // Tags filter
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => post.tags?.includes(tag));

      return matchesSearch && matchesType && matchesTags;
    });

    return filtered;
  }, [posts, searchQuery, selectedType, selectedTags]);

  // Organize posts with featured post (most liked from first 10)
  const organizedPosts = useMemo(() => {
    if (filteredPosts.length === 0) return [];

    // Get the first 10 posts to find the most liked
    const first10 = filteredPosts.slice(0, 10);

    // Find the most liked post from the first 10
    const featuredPost = first10.reduce((mostLiked, post) => {
      const currentLikes = post._count?.likes || post.likeCount || 0;
      const mostLikedLikes =
        mostLiked._count?.likes || mostLiked.likeCount || 0;
      return currentLikes > mostLikedLikes ? post : mostLiked;
    }, first10[0]);

    // Remove featured from the list and put it first
    const otherPosts = filteredPosts.filter((p) => p.id !== featuredPost.id);

    return [featuredPost, ...otherPosts];
  }, [filteredPosts]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedTags([]);
  };

  const hasActiveFilters =
    searchQuery !== '' || selectedType !== 'ALL' || selectedTags.length > 0;

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

  const galleryFeatured = organizedPosts[0];
  const gallerySidePosts = organizedPosts.slice(1, 3);
  const galleryGridPosts = organizedPosts.slice(3);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="page-header relative overflow-hidden">
        <div className="absolute -top-24 right-[-2rem] h-64 w-64 rounded-full bg-[color:var(--accent)/16] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-[10%] h-40 w-40 rounded-full bg-[color:var(--primary)/10] blur-3xl pointer-events-none" />
        <div className="section-container relative">
          <div className="max-w-5xl mx-auto flex flex-col gap-4 text-center lg:text-left">
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] flex items-center gap-2 justify-center lg:justify-start">
              <span className="accent-dot" />
              Explore
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-[var(--foreground)]">
              Explore the Magazine
            </h1>
            <p className="max-w-3xl text-base sm:text-lg text-[var(--muted-foreground)]">
              A curated stream of student projects, long-form features, and
              audio stories across every STEM track.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <div className="chip-outline">3 publishing tracks</div>
              <div className="chip-outline">Student-led stories</div>
              <div className="chip-outline">Updated weekly</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="border-b border-[color:var(--border)] bg-[color:var(--background)/85] backdrop-blur-xl sticky top-0 z-40">
        <div className="section-container py-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)/92] shadow-sm p-4 space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search articles, authors, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-[var(--background)] border border-[color:var(--border)] rounded-xl text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[var(--muted)] rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-[var(--muted-foreground)]" />
                </button>
              )}
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)] mr-1 sm:mr-2 shrink-0">
                Type
              </span>
              {['ALL', 'SM_EXPO', 'SM_NOW', 'SM_PODS'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs rounded-full font-semibold transition-all shrink-0 ${
                    selectedType === type
                      ? 'shadow-md'
                      : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[color:var(--muted)/80]'
                  } ${selectedType === type && type !== 'ALL' ? getPostTypeColors(type) : ''} ${
                    selectedType === type && type === 'ALL'
                      ? 'bg-[var(--accent)] text-[var(--accent-foreground)]'
                      : ''
                  }`}
                >
                  {type === 'ALL' ? (
                    <LayoutGrid className="h-3.5 w-3.5" />
                  ) : (
                    <PostTypeIcon type={type} className="h-3.5 w-3.5" />
                  )}
                  {type === 'ALL' ? 'All' : getPostTypeLabel(type)}
                </button>
              ))}
            </div>

            {/* Tags Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)] mr-1 sm:mr-2 shrink-0">
                Tags
              </span>
              <div className="flex gap-2">
                {ALL_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 sm:px-3 py-1 text-xs rounded-full font-semibold capitalize transition-all shrink-0 ${
                      selectedTags.includes(tag)
                        ? 'bg-[var(--accent)] text-[var(--accent-foreground)] shadow-md'
                        : 'bg-[var(--muted)] text-[var(--foreground)] hover:bg-[color:var(--muted)/80]'
                    }`}
                  >
                    {tag.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Filters & Clear */}
            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-2 border-t border-[color:var(--border)]">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Found{' '}
                  <span className="font-semibold text-[var(--foreground)]">
                    {filteredPosts.length}
                  </span>{' '}
                  articles
                </p>
                <button
                  onClick={clearFilters}
                  className="text-sm text-[var(--primary)] hover:underline font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="page-section">
        <div className="section-container">
          {loading ? (
            <div className="animate-pulse space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-3xl bg-[var(--muted)] aspect-[16/9]" />
                <div className="lg:col-span-5 flex flex-col gap-5">
                  <div className="rounded-2xl bg-[var(--muted)] aspect-[16/9]" />
                  <div className="rounded-2xl bg-[var(--muted)] aspect-[16/9]" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-48 bg-[var(--muted)] rounded-lg" />
                    <div className="h-6 bg-[var(--muted)] rounded w-3/4" />
                    <div className="h-4 bg-[var(--muted)] rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24">
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                No articles yet
              </h2>
              <p className="text-[var(--muted-foreground)] mb-6">
                Be the first to share your STEM story!
              </p>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Submit an Article
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-24">
              <Search className="h-16 w-16 mx-auto text-[var(--muted-foreground)] mb-4" />
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">
                No matching articles
              </h2>
              <p className="text-[var(--muted-foreground)] mb-6">
                Try adjusting your search or filters
              </p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-full font-semibold hover:opacity-90 transition-opacity"
              >
                Clear Filters
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              {isLargeScreen ? (
                <>
                  <div className="relative max-w-[880px] xl:max-w-[960px] mx-auto">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-[color:var(--accent)/12] blur-3xl pointer-events-none" />
                    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.55fr)] gap-5 items-start">
                      <div>
                        {galleryFeatured && (
                          <FeaturedCard
                            post={galleryFeatured}
                            getTimeAgo={getTimeAgo}
                            className="lg:-rotate-[1.4deg] lg:translate-y-3 lg:origin-bottom-left"
                          />
                        )}
                      </div>
                      <div className="flex flex-col gap-5 lg:pt-8">
                        {gallerySidePosts.map((post, index) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            index={index}
                            getTimeAgo={getTimeAgo}
                            className={
                              index === 0
                                ? 'lg:rotate-[1.8deg] lg:translate-x-2'
                                : 'lg:-rotate-[1.2deg] lg:translate-x-4 lg:translate-y-6'
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {galleryGridPosts.length > 0 && (
                    <div className="relative mt-12 pt-10 max-w-5xl mx-auto">
                      <div className="absolute left-0 right-0 top-0 h-px bg-[color:var(--border)] opacity-60" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {galleryGridPosts.map((post, index) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            index={index + 3}
                            getTimeAgo={getTimeAgo}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {organizedPosts.map((post, index) =>
                    index === 0 ? (
                      <div key={post.id} className="sm:col-span-2">
                        <FeaturedCard post={post} getTimeAgo={getTimeAgo} />
                      </div>
                    ) : (
                      <PostCard
                        key={post.id}
                        post={post}
                        index={index}
                        getTimeAgo={getTimeAgo}
                      />
                    )
                  )}
                </div>
              )}

              {hasMore && !hasActiveFilters && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => loadPosts(false)}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[var(--card)] border border-[color:var(--border)] text-[var(--foreground)] rounded-full font-semibold hover:bg-[var(--muted)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMore ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[var(--foreground)] border-t-transparent rounded-full animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
