'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Bell, CheckCircle2, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { NEWSLETTER_BENEFITS } from './home-data';

export default function NewsletterSection() {
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuthContent = mounted && isLoaded;

  return (
    <motion.section
      className="w-full py-16 sm:py-20 relative"
      style={{
        background: 'var(--gradient-home-cta)',
      }}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="absolute -top-12 left-[10%] h-60 w-60 rounded-full bg-white/[0.08] blur-3xl pointer-events-none" />

      <div className="container px-4 sm:px-6 max-w-[1100px] mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center lg:items-start">
          <motion.div
            className="space-y-5 text-center lg:text-left max-w-2xl mx-auto lg:mx-0 lg:order-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto lg:mx-0 ring-1 ring-[color:var(--accent)/55]">
              <Bell className="h-7 w-7 text-white/90" />
            </div>
            <h2 className="font-display text-3xl sm:text-5xl leading-tight tracking-[0.02em] text-white">
              Stay Updated
            </h2>
            <p className="max-w-xl text-white/[0.85] text-lg leading-relaxed mx-auto lg:mx-0">
              Subscribe for curated updates on student projects, articles, and
              podcast episodes. One weekly digest, zero noise.
            </p>
            <div className="space-y-2.5 w-fit mx-auto lg:mx-0 lg:w-full lg:max-w-md">
              {NEWSLETTER_BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-2.5 text-white/[0.85]"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span className="text-sm sm:text-base">{benefit}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="w-full max-w-3xl mx-auto lg:mx-0 rounded-2xl p-6 sm:p-7 border border-white/20 bg-white/10 backdrop-blur-sm text-center lg:order-1"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-white/[0.85] text-lg mb-5">
              {showAuthContent && isSignedIn
                ? 'Manage your newsletter subscription and notification preferences in your dashboard.'
                : 'Create an account to subscribe and get alerted when new stories are published.'}
            </p>
            {showAuthContent && isSignedIn ? (
              <Link
                href="/dashboard?tab=email-preferences"
                className="btn-base bg-white text-[var(--accent-foreground)] shadow-lg w-full sm:w-auto"
              >
                <Mail className="mr-2 h-4 w-4" />
                Manage Email Preferences
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-up?redirect_url=/dashboard?tab=email-preferences"
                  className="btn-base bg-white text-[var(--accent-foreground)] shadow-lg w-full sm:w-auto"
                >
                  Sign Up to Subscribe
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <p className="text-white/70 text-sm mt-4">
                  Already have an account?{' '}
                  <Link
                    href="/sign-in?redirect_url=/dashboard?tab=email-preferences"
                    className="text-white underline hover:no-underline"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
