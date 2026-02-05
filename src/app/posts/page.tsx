'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Clock,
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
}: {
  post: any;
  index: number;
  getTimeAgo: (date: string | Date) => string;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
    className="group"
  >
    <Link href={`/posts/${post.slug || post.id}`} className="block h-full">
      <div className="relative rounded-xl overflow-hidden bg-(--card) border border-(--border) flex flex-col h-70">
        {/* Image */}
        <div className="relative w-full h-40 overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-(--muted) flex items-center justify-center">
              <PostTypeIcon
                type={post.postType}
                className="h-10 w-10 text-(--muted-foreground)"
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-bold uppercase flex items-center gap-1 ${
                  post.postType === 'SM_EXPO'
                    ? 'text-blue-600 dark:text-blue-400'
                    : post.postType === 'SM_PODS'
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-purple-600 dark:text-purple-400'
                }`}
              >
                <PostTypeIcon type={post.postType} className="h-3 w-3" />
                {getPostTypeLabel(post.postType)}
              </span>
              <span className="text-xs text-(--muted-foreground)">
                {getTimeAgo(post.publishedAt || post.createdAt)}
              </span>
            </div>
            <h3 className="font-bold text-base text-(--foreground) group-hover:text-(--primary) transition-colors leading-snug line-clamp-2 mb-2">
              {post.title}
            </h3>
            <p className="text-xs text-(--muted-foreground) line-clamp-2">
              {post.excerpt || post.content?.substring(0, 80)}
            </p>
          </div>

          {/* Author & Likes */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-(--border)">
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
                <div className="w-5 h-5 rounded-full bg-(--muted) flex items-center justify-center">
                  <span className="text-xs font-medium text-(--muted-foreground)">
                    {(post.author?.name || 'A')[0]}
                  </span>
                </div>
              )}
              <span className="text-xs text-(--muted-foreground) truncate max-w-20">
                {post.author?.name || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-(--muted-foreground)">
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
}: {
  post: any;
  getTimeAgo: (date: string | Date) => string;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="group"
  >
    <Link href={`/posts/${post.slug || post.id}`} className="block">
      <div className="relative rounded-xl overflow-hidden bg-(--card) border border-(--border) h-105">
        {/* Full bleed image */}
        <div className="absolute inset-0 overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-(--muted) flex items-center justify-center">
              <PostTypeIcon
                type={post.postType}
                className="h-16 w-16 text-(--muted-foreground)"
              />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-8 z-10">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                post.postType === 'SM_EXPO'
                  ? 'bg-blue-500 text-white'
                  : post.postType === 'SM_PODS'
                    ? 'bg-red-500 text-white'
                    : 'bg-purple-500 text-white'
              }`}
            >
              <PostTypeIcon type={post.postType} className="h-3.5 w-3.5" />
              SM {getPostTypeLabel(post.postType)}
            </span>
            <span className="text-sm text-white/80">
              {getTimeAgo(post.publishedAt || post.createdAt)}
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white leading-tight mb-3 line-clamp-3">
            {post.title}
          </h2>
          <p className="text-white/80 text-sm lg:text-base line-clamp-2 mb-4 hidden sm:block">
            {post.excerpt || post.content?.substring(0, 150)}
          </p>
          <div className="flex items-center gap-3">
            {post.author?.imageUrl ? (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
                <Image
                  src={post.author.imageUrl}
                  alt={post.author.name || 'Author'}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {(post.author?.name || 'A')[0]}
                </span>
              </div>
            )}
            <span className="text-sm text-white/90 font-medium">
              {post.author?.name || 'Anonymous'}
            </span>
            <div className="flex items-center gap-1 text-sm text-white/70 ml-auto">
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

  // Organize posts into columns for the offset masonry layout
  // Column 1: posts at indices 1, 3, 5, 9, 13...
  // Column 2: posts at indices 5, 7, 11, 15... (offset by featured height)
  // Column 3: posts at indices 6, 8, 12, 16... (offset by featured height)
  // Column 4: posts at indices 2, 4, 6, 10, 14...
  const organizeIntoColumns = (posts: any[]) => {
    if (posts.length === 0)
      return { featured: null, col1: [], col2: [], col3: [], col4: [] };

    const featured = posts[0];
    const remaining = posts.slice(1);

    const col1: any[] = [];
    const col2: any[] = [];
    const col3: any[] = [];
    const col4: any[] = [];

    remaining.forEach((post, idx) => {
      // Distribute: col1, col4, col1, col4, then col2, col3, col2, col3, then repeat all
      const cycle = idx % 8;
      if (cycle === 0 || cycle === 2) col1.push(post);
      else if (cycle === 1 || cycle === 3) col4.push(post);
      else if (cycle === 4 || cycle === 6) col2.push(post);
      else if (cycle === 5 || cycle === 7) col3.push(post);
    });

    return { featured, col1, col2, col3, col4 };
  };

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Search & Filter Bar */}
      <div className="border-b border-(--border) bg-(--card) sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-(--muted-foreground)" />
            <input
              type="text"
              placeholder="Search articles, authors, topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3 bg-(--background) border border-(--border) rounded-xl text-(--foreground) placeholder:text-(--muted-foreground) focus:outline-none focus:ring-2 focus:ring-(--primary) focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-(--muted) rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-(--muted-foreground)" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <span className="text-sm font-semibold text-(--muted-foreground) mr-1 sm:mr-2 shrink-0">
              Type:
            </span>
            {['ALL', 'SM_EXPO', 'SM_NOW', 'SM_PODS'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 text-xs sm:text-sm rounded-full font-medium transition-all shrink-0 ${
                  selectedType === type
                    ? 'bg-(--accent) text-(--accent-foreground) shadow-md'
                    : 'bg-(--muted) text-(--foreground) hover:bg-(--muted)/80'
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
            <span className="text-sm font-semibold text-(--muted-foreground) mr-1 sm:mr-2 shrink-0">
              Tags:
            </span>
            <div className="flex gap-2">
              {ALL_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 sm:px-3 py-1 text-xs rounded-full font-medium capitalize transition-all shrink-0 ${
                    selectedTags.includes(tag)
                      ? 'bg-(--accent) text-(--accent-foreground) shadow-md'
                      : 'bg-(--muted) text-(--foreground) hover:bg-(--muted)/80'
                  }`}
                >
                  {tag.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters & Clear */}
          {hasActiveFilters && (
            <div className="flex items-center justify-between pt-2 border-t border-(--border)">
              <p className="text-sm text-(--muted-foreground)">
                Found{' '}
                <span className="font-semibold text-(--foreground)">
                  {filteredPosts.length}
                </span>{' '}
                articles
              </p>
              <button
                onClick={clearFilters}
                className="text-sm text-(--primary) hover:underline font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="animate-pulse space-y-8">
            {/* Hero Skeleton */}
            <div className="relative h-96 bg-(--muted) rounded-xl"></div>
            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-48 bg-(--muted) rounded-lg"></div>
                  <div className="h-6 bg-(--muted) rounded w-3/4"></div>
                  <div className="h-4 bg-(--muted) rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-(--foreground) mb-4">
              No articles yet
            </h2>
            <p className="text-(--muted-foreground) mb-6">
              Be the first to share your STEM story!
            </p>
            <Link
              href="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Submit an Article
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-24">
            <Search className="h-16 w-16 mx-auto text-(--muted-foreground) mb-4" />
            <h2 className="text-2xl font-bold text-(--foreground) mb-4">
              No matching articles
            </h2>
            <p className="text-(--muted-foreground) mb-6">
              Try adjusting your search or filters
            </p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-full font-semibold hover:opacity-90 transition-opacity"
            >
              Clear Filters
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Desktop: 4-column masonry layout with offset middle columns */}
            {isLargeScreen ? (
              <div className="flex gap-5">
                {/* Column 1 - starts at top */}
                <div className="flex-1 flex flex-col gap-5">
                  {organizeIntoColumns(organizedPosts).col1.map((post, idx) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={idx}
                      getTimeAgo={getTimeAgo}
                    />
                  ))}
                </div>

                {/* Columns 2-3 - Featured + offset cards */}
                <div className="flex-2 flex flex-col gap-5">
                  {/* Featured Post */}
                  {organizeIntoColumns(organizedPosts).featured && (
                    <FeaturedCard
                      post={organizeIntoColumns(organizedPosts).featured}
                      getTimeAgo={getTimeAgo}
                    />
                  )}
                  {/* Cards below featured in 2-column grid */}
                  <div className="grid grid-cols-2 gap-5">
                    <div className="flex flex-col gap-5">
                      {organizeIntoColumns(organizedPosts).col2.map(
                        (post, idx) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            index={idx + 5}
                            getTimeAgo={getTimeAgo}
                          />
                        )
                      )}
                    </div>
                    <div className="flex flex-col gap-5">
                      {organizeIntoColumns(organizedPosts).col3.map(
                        (post, idx) => (
                          <PostCard
                            key={post.id}
                            post={post}
                            index={idx + 6}
                            getTimeAgo={getTimeAgo}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Column 4 - starts at top */}
                <div className="flex-1 flex flex-col gap-5">
                  {organizeIntoColumns(organizedPosts).col4.map((post, idx) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      index={idx + 2}
                      getTimeAgo={getTimeAgo}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Mobile/Tablet: Simple grid */
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

            {/* Load More Button */}
            {hasMore && !hasActiveFilters && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => loadPosts(false)}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-(--card) border border-(--border) text-(--foreground) rounded-full font-semibold hover:bg-(--muted) transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-(--foreground) border-t-transparent rounded-full animate-spin" />
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
  );
}
