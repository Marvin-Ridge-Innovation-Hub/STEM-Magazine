'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Mail,
  Send,
  Target,
  Newspaper,
  Headphones,
  ChevronDown,
  ChevronUp,
  Bell,
  Heart,
  Clock,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import HeroCarousel from '@/components/HeroCarousel';

// Hero background images - add your images to public/images/hero/
const heroImages = [
  '/images/carouselimages/image.jpg',
  '/images/carouselimages/image2.jpg',
  '/images/carouselimages/image3.jpg',
  '/images/carouselimages/image4.jpg',
  '/images/carouselimages/image5.jpg',
  '/images/carouselimages/image6.jpg',
];

// Category tags for the tag cloud
const CATEGORY_TAGS = [
  {
    name: 'Technology',
    color:
      'bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20',
  },
  {
    name: 'Biology',
    color:
      'bg-green-500/10 text-green-600 dark:text-green-400 hover:bg-green-500/20',
  },
  {
    name: 'Chemistry',
    color:
      'bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20',
  },
  {
    name: 'Physics',
    color:
      'bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20',
  },
  {
    name: 'Engineering',
    color: 'bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20',
  },
  {
    name: 'Mathematics',
    color:
      'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20',
  },
  {
    name: 'Computer Science',
    color:
      'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20',
  },
  {
    name: 'AI',
    color:
      'bg-pink-500/10 text-pink-600 dark:text-pink-400 hover:bg-pink-500/20',
  },
  {
    name: 'Environment',
    color:
      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20',
  },
  {
    name: 'Health',
    color:
      'bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20',
  },
];

// FAQ data
const FAQ_ITEMS = [
  {
    question: 'Who can submit?',
    answer:
      'Any student at Marvin Ridge High School can submit content to the magazine. Whether you have a science project, a tech article, or want to share your thoughts on current science or technology events, we welcome your contributions.',
  },
  {
    question: 'What types of content can I submit?',
    answer:
      'We accept three types of content: SM Expo for showcasing student projects with images, SM Now for written articles and opinion pieces on science or tech topics, and SM Pods for podcast-style video content via YouTube links.',
  },
  {
    question: 'How long does the approval process take?',
    answer:
      "Our moderation team typically reviews submissions within 24-48 hours. You'll receive an email notification once your submission has been approved or if any changes are requested.",
  },
  {
    question: 'Can I edit my submission after posting?',
    answer:
      'Once a submission is approved and published, it cannot be edited directly. However, you can contact our team through the contact form if you need to make corrections to a published post.',
  },
  {
    question: 'How do I get updates on new stories?',
    answer:
      'You can subscribe to our newsletter below to receive notifications when new stories are published. You can choose to receive updates for SM Expo projects, SM Now articles, SM Pods episodes, or all of them.',
  },
];

// Post type icon component
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
      return 'text-blue-600 dark:text-blue-400';
    case 'SM_NOW':
      return 'text-purple-600 dark:text-purple-400';
    case 'SM_PODS':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600';
  }
};

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);
  const [useAccountEmail, setUseAccountEmail] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recent posts state
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
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

  // Prevent hydration mismatch
  const showAuthContent = mounted && isLoaded;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const emailToUse =
        showAuthContent && isSignedIn && useAccountEmail
          ? user?.primaryEmailAddress?.emailAddress
          : formData.email;

      const nameToUse =
        showAuthContent && isSignedIn && useAccountEmail
          ? user?.fullName || user?.firstName || 'User'
          : formData.name;

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: nameToUse,
          email: emailToUse,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send message'
      );
    } finally {
      setIsSubmitting(false);
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

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <>
      {/* Preload hero images for faster display */}
      {heroImages.slice(0, 3).map((image, index) => (
        <link
          key={image}
          rel="preload"
          as="image"
          href={image}
          // @ts-ignore - Next.js specific attribute
          fetchPriority={index === 0 ? 'high' : 'low'}
        />
      ))}

      <div className="flex flex-col items-center w-full overflow-hidden">
        {/* Hero Section with Background Carousel */}
        <motion.section
          className="w-full py-12 sm:py-16 md:py-24 lg:py-32 relative overflow-hidden min-h-[60vh] flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <HeroCarousel
            images={heroImages}
            autoplayInterval={8000}
            overlayOpacity={55}
          />

          <div className="container px-4 sm:px-6 relative z-10 max-w-full">
            <motion.div
              className="flex flex-col items-center space-y-6 text-center"
              {...fadeIn}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter font-poppins text-white drop-shadow-lg">
                MRHS STEM Magazine
              </h1>
              <p className="mx-auto max-w-150 text-white/90 text-base sm:text-lg px-4 drop-shadow-md">
                A student-run publication built to spotlight creativity,
                innovation, and problem-solving across science, technology,
                engineering, and math. Through projects, articles, and
                conversations, the magazine gives students a space to share what
                they build, how they think, and why it matters.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4">
                <Link
                  href="/posts"
                  className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-semibold text-gray-900 shadow-lg hover:opacity-90 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  Explore Posts
                </Link>
                {showAuthContent && isSignedIn ? (
                  <Link
                    href="/create"
                    className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white px-8 text-sm font-semibold text-white shadow-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 w-full sm:w-auto backdrop-blur-sm"
                  >
                    Create Post
                  </Link>
                ) : (
                  <Link
                    href="/sign-up"
                    className="inline-flex h-12 items-center justify-center rounded-full border-2 border-white px-8 text-sm font-semibold text-white shadow-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 w-full sm:w-auto backdrop-blur-sm"
                  >
                    Get Started
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Recent Posts Section */}
        <motion.section
          className="w-full py-12 sm:py-16 md:py-20 bg-(--background)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 sm:px-6 max-w-6xl mx-auto">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
              {...fadeIn}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter font-poppins text-(--foreground)">
                Recent Posts
              </h2>
              <p className="mx-auto max-w-xl text-(--muted-foreground) text-base">
                See the latest student projects, articles, and podcasts from our
                community.
              </p>
            </motion.div>

            {loadingPosts ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-(--muted) rounded-xl mb-4"></div>
                    <div className="h-4 bg-(--muted) rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-(--muted) rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {recentPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group h-full"
                  >
                    <Link
                      href={`/posts/${post.slug || post.id}`}
                      className="block h-full"
                    >
                      <div className="relative rounded-xl overflow-hidden bg-(--card) border border-(--border) hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                        {/* Image */}
                        <div className="relative w-full h-48 overflow-hidden">
                          {post.coverImage || post.thumbnailUrl ? (
                            <Image
                              src={post.coverImage || post.thumbnailUrl}
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
                        </div>

                        {/* Content */}
                        <div className="p-5 flex flex-col flex-1">
                          <div className="flex items-center gap-2 mb-3">
                            <span
                              className={`text-xs font-bold uppercase flex items-center gap-1 ${getPostTypeColor(post.postType)}`}
                            >
                              <PostTypeIcon
                                type={post.postType}
                                className="h-3 w-3"
                              />
                              SM {getPostTypeLabel(post.postType)}
                            </span>
                            <span className="text-xs text-(--muted-foreground) flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {getTimeAgo(post.publishedAt || post.createdAt)}
                            </span>
                          </div>
                          <h3 className="font-bold text-lg text-(--foreground) group-hover:text-(--primary) transition-colors leading-snug line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-sm text-(--muted-foreground) line-clamp-2 mb-4">
                            {post.content?.substring(0, 100)}...
                          </p>
                          <div className="flex items-center justify-between pt-3 border-t border-(--border) mt-auto">
                            <div className="flex items-center gap-2">
                              {post.author?.imageUrl ? (
                                <div className="relative w-6 h-6 rounded-full overflow-hidden">
                                  <Image
                                    src={post.author.imageUrl}
                                    alt={post.author.name || 'Author'}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-(--muted) flex items-center justify-center">
                                  <span className="text-xs font-medium text-(--muted-foreground)">
                                    {(post.author?.name || 'A')[0]}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm text-(--muted-foreground)">
                                {post.author?.name || 'Anonymous'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-(--muted-foreground)">
                              <Heart className="h-4 w-4" />
                              {post.likeCount || post._count?.likes || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-(--muted-foreground)">
                  No posts yet. Be the first to contribute!
                </p>
              </div>
            )}

            <motion.div
              className="flex justify-center mt-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-(--primary) text-(--primary-foreground) rounded-full font-semibold hover:opacity-90 transition-all hover:scale-105"
              >
                View All Posts
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="w-full py-12 sm:py-16 md:py-24 bg-(--card)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 sm:px-6 max-w-full">
            <motion.div
              className="flex flex-col items-center justify-center space-y-6 text-center"
              {...fadeIn}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter font-poppins text-(--foreground)">
                Our Platforms
              </h2>
              <p className="mx-auto max-w-150 text-(--muted-foreground) text-base sm:text-lg px-4">
                The magazine offers several resources for both reading and
                creating. While some are available only to members of the
                Computer Science Club, which manages this site, others are open
                to everyone.
              </p>
            </motion.div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3 px-4">
              {[
                {
                  icon: Headphones,
                  title: 'SM Pods',
                  description:
                    'Every month, our student researchers curate a list of current events in the science and technology world. In these forty-five minute episodes, we sit down and consider the nuances of our ever-growing field.',
                },
                {
                  icon: Newspaper,
                  title: 'SM Now',
                  description:
                    'With new frameworks and corporate shenanigans constantly emerging out of the blue, we are all trying our best to stay on top of it all. This blog lets students provide their opinions and insights on topics that interest them, creating a single platform for exposure.',
                },
                {
                  icon: Target,
                  title: 'SM Expo',
                  description:
                    "Oftentimes, high school student projects can go unseen. To celebrate each other's accomplishments and build on them, this platform helps students find peers with similar goals.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="relative flex flex-col items-center space-y-4 rounded-xl bg-(--background) p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-(--border)"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--accent) p-3 shadow-md">
                    <feature.icon className="h-6 w-6 text-(--accent-foreground)" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-(--foreground) pt-8">
                    {feature.title}
                  </h3>
                  <p className="text-center text-(--muted-foreground) text-sm sm:text-base">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Category Tags Cloud Section */}
        <motion.section
          className="w-full py-12 sm:py-16 bg-(--background)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 sm:px-6 max-w-4xl mx-auto">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
              {...fadeIn}
            >
              <div className="flex items-center gap-2">
                <Tag className="h-6 w-6 text-(--primary)" />
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tighter font-poppins text-(--foreground)">
                  Browse Topics
                </h2>
              </div>
              <p className="mx-auto max-w-xl text-(--muted-foreground) text-base">
                Discover content across different disciplines and find topics
                that interest you.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-wrap justify-center gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {CATEGORY_TAGS.map((tag, index) => (
                <motion.div
                  key={tag.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link
                    href={`/posts?tag=${tag.name.toLowerCase().replace(' ', '-')}`}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 ${tag.color}`}
                  >
                    {tag.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          className="w-full py-12 sm:py-16 md:py-20 bg-(--card)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 sm:px-6 max-w-3xl mx-auto">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-10"
              {...fadeIn}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter font-poppins text-(--foreground)">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto max-w-xl text-(--muted-foreground) text-base">
                Have questions about the magazine? Find answers to common
                questions below.
              </p>
            </motion.div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="border border-(--border) rounded-xl overflow-hidden bg-(--background)"
                >
                  <button
                    onClick={() =>
                      setOpenFaqIndex(openFaqIndex === index ? null : index)
                    }
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-(--muted)/50 transition-colors"
                  >
                    <span className="font-semibold text-(--foreground) pr-4">
                      {faq.question}
                    </span>
                    {openFaqIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-(--muted-foreground) shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-(--muted-foreground) shrink-0" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-6 pb-4"
                    >
                      <p className="text-(--muted-foreground) leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Newsletter Signup Section */}
        <motion.section
          className="w-full py-12 sm:py-16"
          style={{
            background:
              'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 sm:px-6 max-w-2xl mx-auto">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
              {...fadeIn}
            >
              <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-2">
                <Bell
                  className="h-7 w-7"
                  style={{ color: 'var(--primary-foreground)' }}
                />
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary-foreground)' }}
              >
                Stay Updated
              </h2>
              <p className="mx-auto max-w-md text-white/80">
                Subscribe to our newsletter and never miss new projects,
                articles, and podcast episodes from our student community.
              </p>
            </motion.div>

            {/* Show different content based on auth state */}
            {showAuthContent && isSignedIn ? (
              // Signed-in users: Redirect to dashboard
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-white/80 mb-4">
                  Manage your newsletter subscription and notification
                  preferences in your dashboard.
                </p>
                <Link
                  href="/dashboard?tab=email-preferences"
                  className="inline-flex items-center justify-center h-12 rounded-xl px-8 text-sm font-semibold bg-white text-gray-900 shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Manage Email Preferences
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </motion.div>
            ) : (
              // Not signed in: Prompt to sign up with redirect
              <motion.div
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="text-white/80 mb-4">
                  Create an account to subscribe to our newsletter and get
                  alerts when new stories are published.
                </p>
                <Link
                  href="/sign-up?redirect_url=/dashboard?tab=email-preferences"
                  className="inline-flex items-center justify-center h-12 rounded-xl px-8 text-sm font-semibold bg-white text-gray-900 shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  Sign Up to Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <p className="text-white/60 text-sm mt-4">
                  Already have an account?{' '}
                  <Link
                    href="/sign-in?redirect_url=/dashboard?tab=email-preferences"
                    className="text-white underline hover:no-underline"
                  >
                    Sign in
                  </Link>
                </p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Contact Section */}
        <motion.section
          className="w-full py-12 sm:py-14 bg-(--card)"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
            {/* Header */}
            <motion.div
              className="flex items-center justify-center gap-4 mb-6"
              {...fadeIn}
            >
              <div className="w-10 h-10 rounded-full bg-(--primary)/10 flex items-center justify-center">
                <Mail className="h-5 w-5 text-(--primary)" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-(--foreground)">
                Get in Touch
              </h2>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="bg-(--background) rounded-2xl shadow-lg border border-(--border) p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {showAuthContent && isSignedIn && (
                <div
                  className="flex items-center p-3 rounded-lg border mb-4"
                  style={{
                    backgroundColor:
                      'color-mix(in oklch, var(--primary) 10%, transparent)',
                    borderColor: 'var(--border)',
                  }}
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAccountEmail}
                      onChange={(e) => setUseAccountEmail(e.target.checked)}
                      className="w-4 h-4 rounded focus:ring-2"
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Use my account email (
                      {user?.primaryEmailAddress?.emailAddress})
                    </span>
                  </label>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {(!showAuthContent || !isSignedIn || !useAccountEmail) && (
                  <>
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border transition-all text-sm"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--input)',
                          color: 'var(--foreground)',
                        }}
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium mb-1"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg border transition-all text-sm"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--input)',
                          color: 'var(--foreground)',
                        }}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </>
                )}

                <div className="md:col-span-2">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border transition-all text-sm"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--input)',
                      color: 'var(--foreground)',
                    }}
                    placeholder="What's this about?"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium mb-1"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border transition-all resize-none text-sm"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--input)',
                      color: 'var(--foreground)',
                    }}
                    placeholder="Tell us more..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center h-10 rounded-lg px-6 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  background:
                    'linear-gradient(to right, var(--primary), var(--accent))',
                  color: 'var(--primary-foreground)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin mr-2"
                      style={{ borderColor: 'var(--primary-foreground)' }}
                    />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </button>
            </motion.form>
          </div>
        </motion.section>
      </div>
    </>
  );
}
