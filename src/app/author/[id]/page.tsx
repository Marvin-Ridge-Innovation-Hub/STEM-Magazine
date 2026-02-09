'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Globe,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Calendar,
  FileText,
  ExternalLink,
  Target,
  Newspaper,
  Headphones,
  Heart,
  MessageSquare,
} from 'lucide-react';

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
      return <FileText className={className} />;
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

const getPostTypeColors = (type: string) => {
  switch (type) {
    case 'SM_EXPO':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'SM_NOW':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    case 'SM_PODS':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

interface AuthorProfile {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
  youtube: string | null;
  createdAt: string;
  posts: Array<{
    id: string;
    title: string;
    excerpt: string | null;
    coverImage: string | null;
    postType: string;
    slug?: string;
    tags: string[];
    publishedAt: string;
    likeCount: number;
    commentCount: number;
  }>;
  postCount: number;
}

export default function AuthorProfilePage() {
  const params = useParams();
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [params.id]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/profile/${params.id}`);
      const data = await response.json();

      if (!data.success || !data.profile) {
        setError('Author not found');
        setProfile(null);
        return;
      }

      setProfile(data.profile);
    } catch (err) {
      console.error('Failed to load profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatJoinDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const socialLinks = profile
    ? [
        {
          url: profile.website,
          icon: Globe,
          label: 'Website',
          color: 'hover:text-gray-600',
        },
        {
          url: profile.twitter,
          icon: Twitter,
          label: 'Twitter',
          color: 'hover:text-sky-500',
        },
        {
          url: profile.github,
          icon: Github,
          label: 'GitHub',
          color: 'hover:text-gray-900 dark:hover:text-gray-100',
        },
        {
          url: profile.linkedin,
          icon: Linkedin,
          label: 'LinkedIn',
          color: 'hover:text-blue-600',
        },
        {
          url: profile.instagram,
          icon: Instagram,
          label: 'Instagram',
          color: 'hover:text-pink-500',
        },
        {
          url: profile.youtube,
          icon: Youtube,
          label: 'YouTube',
          color: 'hover:text-red-500',
        },
      ].filter((link) => link.url)
    : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-(--background)">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-(--muted) rounded-full"></div>
              <div className="space-y-3 flex-1">
                <div className="h-8 bg-(--muted) rounded w-48"></div>
                <div className="h-4 bg-(--muted) rounded w-32"></div>
              </div>
            </div>
            <div className="h-20 bg-(--muted) rounded-xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-(--muted) rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-(--background) flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-(--muted) flex items-center justify-center">
            <User className="h-10 w-10 text-(--muted-foreground)" />
          </div>
          <h1 className="text-3xl font-bold text-(--foreground) mb-4">
            {error || 'Author Not Found'}
          </h1>
          <p className="text-(--muted-foreground) mb-6">
            The author you're looking for doesn't exist.
          </p>
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-full font-semibold hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-(--background)"
    >
      {/* Back Navigation */}
      <div className="border-b border-(--border) bg-(--card)">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-(--muted) ring-4 ring-(--border) shrink-0">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt={profile.name || 'Author'}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-16 w-16 text-(--muted-foreground)" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-(--foreground) mb-2">
                {profile.name || 'MRHS Student'}
              </h1>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-(--muted-foreground) mb-4">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Joined {formatJoinDate(profile.createdAt)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {profile.postCount}{' '}
                  {profile.postCount === 1 ? 'post' : 'posts'}
                </span>
              </div>

              {/* Social Links */}
              {socialLinks.length > 0 && (
                <div className="flex items-center justify-center sm:justify-start gap-3">
                  {socialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 rounded-full bg-(--muted) text-(--muted-foreground) ${link.color} transition-colors`}
                      title={link.label}
                    >
                      <link.icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 p-6 bg-(--card) rounded-xl border border-(--border)">
              <p className="text-(--foreground) whitespace-pre-wrap leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}
        </motion.div>

        {/* Posts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-(--foreground) mb-6 flex items-center gap-2">
            <FileText className="h-6 w-6 text-(--primary)" />
            Published Work
          </h2>

          {profile.posts.length === 0 ? (
            <div className="text-center py-12 bg-(--card) rounded-xl border border-(--border)">
              <FileText className="h-12 w-12 mx-auto text-(--muted-foreground) mb-4" />
              <p className="text-(--muted-foreground)">
                This author hasn't published any posts yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {profile.posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="h-full"
                >
                  <Link
                    href={`/posts/${post.id}`}
                    className="group block h-full bg-(--card) rounded-xl border border-(--border) overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                  >
                    {/* Cover Image */}
                    <div className="relative h-40 overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-(--muted) flex items-center justify-center">
                          <PostTypeIcon
                            type={post.postType}
                            className="h-12 w-12 text-(--muted-foreground)"
                          />
                        </div>
                      )}
                      {/* Type Badge */}
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getPostTypeColors(post.postType)}`}
                        >
                          <PostTypeIcon
                            type={post.postType}
                            className="h-3 w-3"
                          />
                          {getPostTypeLabel(post.postType)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-(--foreground) line-clamp-2 mb-2 group-hover:text-(--primary) transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-sm text-(--muted-foreground) line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                      )}

                      {/* Meta */}
                      <div className="flex items-center justify-between text-xs text-(--muted-foreground) mt-auto pt-3 border-t border-(--border)">
                        <span>{formatDate(post.publishedAt)}</span>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Heart className="h-3.5 w-3.5" />
                            {post.likeCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            {post.commentCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
