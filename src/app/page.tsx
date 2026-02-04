'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Rocket, ShieldCheck, Zap, Mail, Send } from 'lucide-react';
import Link from 'next/link';
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
  // Add more images as needed
];

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

  useEffect(() => {
    setMounted(true);
  }, []);

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
          {/* Background Carousel with tinted overlay */}
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
                STEM Magazine is a student-run platform built to spotlight
                creativity, innovation, and problem-solving across STEM. Through
                projects, articles, and conversations, STEM Magazine gives
                students a space to share what they build, how they think, and
                why it matters.
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
                STEM Magazine offers several resources for both consumption and
                creating. While some are available only to members of Computer
                Science Club, the managers of this website, others are available
                to everyone.
              </p>
            </motion.div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3 px-4">
              {[
                {
                  icon: Zap,
                  title: 'SM Pods',
                  description:
                    'Every month, our student researchers curate a list of current events in the STEM-world. In these fourty-five minute episodes, we sit down and consider the nuances of our evergrowing field.',
                },
                {
                  icon: ShieldCheck,
                  title: 'SM Now',
                  description:
                    'With new frameworks and corporate shenanigans constantly emerging out of the blue, we are all trying our best to stay on top of it all. This blog lets students provide their opinions and insights on topics that interest them, creating a single platform for exposure.',
                },
                {
                  icon: Rocket,
                  title: 'SM Expo',
                  description:
                    "Oftentimes, highschool STEM projects can go unseen. To celebrate each other's accomplishments and build on them, this promotional platform helps students find peers with similar goals.",
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

        {/* Contact Section */}
        <motion.section
          className="w-full py-12 sm:py-14"
          style={{
            background:
              'linear-gradient(to bottom right, var(--primary), var(--accent))',
          }}
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
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Mail
                  className="h-5 w-5"
                  style={{ color: 'var(--primary-foreground)' }}
                />
              </div>
              <h2
                className="text-2xl sm:text-3xl font-bold"
                style={{ color: 'var(--primary-foreground)' }}
              >
                Get in Touch
              </h2>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="card rounded-2xl shadow-2xl p-6"
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
