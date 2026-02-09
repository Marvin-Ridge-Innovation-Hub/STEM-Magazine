'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  SlidersHorizontal,
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

const getCardPreviewText = (post: any, maxLength = 120) => {
  const source = (post.excerpt || post.content || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!source) return '';
  if (source.length <= maxLength) return source;
  return `${source.slice(0, maxLength).trimEnd()}...`;
};

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
    className={`group h-full ${className ?? ''}`}
  >
    <Link href={`/posts/${post.slug || post.id}`} className="block h-full">
      <div className="relative h-full rounded-2xl overflow-hidden bg-[var(--card)] border border-[color:var(--border)] flex flex-col shadow-sm transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
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
            <h3 className="font-display text-lg sm:text-xl text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight line-clamp-2 min-h-[3.5rem]">
              {post.title}
            </h3>
            <p className="text-sm leading-5 text-[var(--muted-foreground)] line-clamp-2 min-h-10 mt-2">
              {getCardPreviewText(post)}
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

const PostListRow = ({
  post,
  index,
  getTimeAgo,
}: {
  post: any;
  index: number;
  getTimeAgo: (date: string | Date) => string;
}) => (
  <motion.article
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
    className="group"
  >
    <Link href={`/posts/${post.slug || post.id}`} className="block">
      <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-4 sm:p-5 shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-md">
        <div className="relative w-full sm:w-44 md:w-52 aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-[var(--muted)]">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PostTypeIcon
                type={post.postType}
                className="h-10 w-10 text-[var(--muted-foreground)]"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 flex-1">
          <div className="flex flex-wrap items-center gap-2">
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
          <h3 className="font-display text-lg sm:text-xl text-[var(--foreground)] leading-tight group-hover:text-[var(--primary)] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
            {post.excerpt || post.content?.substring(0, 160)}
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-[color:var(--border)]">
            <div className="flex items-center gap-2">
              {post.author?.imageUrl ? (
                <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[color:var(--border)]">
                  <Image
                    src={post.author.imageUrl}
                    alt={post.author.name || 'Author'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[var(--muted)] flex items-center justify-center">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    {(post.author?.name || 'A')[0]}
                  </span>
                </div>
              )}
              <span className="text-xs text-[var(--muted-foreground)]">
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

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement | null>(null);

  const INITIAL_LOAD = 10;
  const LOAD_MORE_COUNT = 4;

  useEffect(() => {
    loadPosts(true);
  }, []);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterOpen]);

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
  const activeFilterCount =
    (selectedType !== 'ALL' ? 1 : 0) + selectedTags.length;

  const { featuredPost, latestPosts } = useMemo(() => {
    if (hasActiveFilters || filteredPosts.length === 0) {
      return { featuredPost: null, latestPosts: [] };
    }

    const first10 = filteredPosts.slice(0, 10);
    const featured = first10.reduce((mostLiked, post) => {
      const currentLikes = post._count?.likes || post.likeCount || 0;
      const mostLikedLikes =
        mostLiked._count?.likes || mostLiked.likeCount || 0;
      return currentLikes > mostLikedLikes ? post : mostLiked;
    }, first10[0]);

    const remaining = filteredPosts.filter((post) => post.id !== featured.id);

    return {
      featuredPost: featured,
      latestPosts: remaining.slice(0, 8),
    };
  }, [filteredPosts, hasActiveFilters]);

  const showFeaturedInHeader = Boolean(featuredPost);

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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="page-header relative overflow-hidden py-8 sm:py-10">
        <div className="absolute -top-24 right-[-2rem] h-64 w-64 rounded-full bg-[color:var(--accent)/16] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-[10%] h-40 w-40 rounded-full bg-[color:var(--primary)/10] blur-3xl pointer-events-none" />
        <div className="section-container relative">
          <div className="max-w-6xl mx-auto grid gap-5 lg:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center">
            <div className="flex flex-col gap-4 text-center lg:text-left">
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
            {showFeaturedInHeader && (
              <div className="relative w-full max-w-xl mx-auto lg:mx-0 lg:max-w-sm lg:justify-self-end">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-28 w-28 rounded-full bg-[color:var(--accent)/12] blur-3xl pointer-events-none" />
                <div className="relative space-y-3">
                  <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] flex items-center gap-2 justify-start text-left">
                    <span className="accent-dot" />
                    Spotlight story
                  </div>
                  <div className="lg:scale-[0.92] lg:origin-top-left">
                    <FeaturedCard post={featuredPost} getTimeAgo={getTimeAgo} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="border-b border-[color:var(--border)] bg-[color:var(--background)/85] backdrop-blur-xl sticky top-0 z-40">
        <div className="section-container py-4">
          <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)/92] shadow-sm p-4 space-y-4">
            {/* Search Input */}
            <div className="relative" ref={filterPanelRef}>
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="relative flex-1">
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
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 text-[var(--muted-foreground)]" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  aria-haspopup="true"
                  aria-expanded={isFilterOpen}
                  aria-controls="posts-filter-panel"
                  className={`relative inline-flex items-center justify-center h-12 w-12 rounded-xl border border-[color:var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--muted)] ${
                    isFilterOpen ? 'ring-2 ring-[var(--primary)]' : ''
                  }`}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-[var(--accent)] text-[var(--accent-foreground)] text-[10px] font-semibold flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {isFilterOpen && (
                <div
                  id="posts-filter-panel"
                  className="absolute right-0 mt-3 w-full sm:w-[360px] rounded-2xl border border-[color:var(--border)] bg-[var(--card)] shadow-xl p-4 z-50 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Filters
                    </span>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs font-semibold text-[var(--primary)] hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                      Type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {['ALL', 'SM_EXPO', 'SM_NOW', 'SM_PODS'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-semibold transition-all ${
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
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ALL_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-2.5 py-1 text-xs rounded-full font-semibold capitalize transition-all ${
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
                </div>
              )}
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

      <div className="page-section pt-8 sm:pt-10 md:pt-4">
        <div className="section-container">
          {loading ? (
            <div className="animate-pulse space-y-10">
              <div className="space-y-4">
                <div className="h-6 w-32 rounded-full bg-[var(--muted)]" />
                <div className="rounded-3xl bg-[var(--muted)] aspect-[16/9]" />
              </div>
              <div className="space-y-4">
                <div className="h-6 w-28 rounded-full bg-[var(--muted)]" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3">
                      <div className="h-40 bg-[var(--muted)] rounded-2xl" />
                      <div className="h-5 bg-[var(--muted)] rounded w-3/4" />
                      <div className="h-4 bg-[var(--muted)] rounded w-1/2" />
                    </div>
                  ))}
                </div>
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
          ) : hasActiveFilters ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Results
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                    Matching articles
                  </h2>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Showing{' '}
                  <span className="font-semibold text-[var(--foreground)]">
                    {filteredPosts.length}
                  </span>{' '}
                  {filteredPosts.length === 1 ? 'result' : 'results'}
                </p>
              </div>
              <div className="space-y-4">
                {filteredPosts.map((post, index) => (
                  <PostListRow
                    key={post.id}
                    post={post}
                    index={index}
                    getTimeAgo={getTimeAgo}
                  />
                ))}
              </div>
            </div>
          ) : (
            <>
              {latestPosts.length > 0 && (
                <section className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                        Latest
                      </p>
                      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                        Newly published
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {latestPosts.map((post, index) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        index={index}
                        getTimeAgo={getTimeAgo}
                      />
                    ))}
                  </div>
                </section>
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
