'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Mail,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import HomeSection from '@/components/HomeSection';
import { FAQ_ITEMS, NEWSLETTER_BENEFITS } from './home-data';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function FAQSection() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuthContent = mounted && isLoaded;

  return (
    <HomeSection variant="split" tone="light">
      <div className="home-grid gap-8 lg:gap-12">
        <motion.div className="col-span-12 lg:col-span-7 space-y-4" {...fadeIn}>
          <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] flex items-center gap-2">
            <span className="accent-dot" />
            FAQs
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--foreground)]">
            Frequently Asked Questions
          </h2>
          <p className="max-w-xl text-[var(--muted-foreground)] text-base">
            Have questions about the magazine? Here are the common answers.
          </p>
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--background)] p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-[var(--muted-foreground)]">
              Quick Snapshot
            </div>
            <div className="mt-3 space-y-2 text-sm text-[var(--muted-foreground)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                Open to MRHS students
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                Typical review in 24-48 hours
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                Three formats: Expo, Now, Pods
              </div>
            </div>
          </div>
          <div>
            <Link href="/contact" className="btn-secondary">
              Contact us
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="border border-[color:var(--border)] rounded-xl overflow-hidden bg-[var(--background)]"
              >
                <button
                  onClick={() =>
                    setOpenFaqIndex(openFaqIndex === index ? null : index)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[color:var(--muted)/50] transition-colors"
                >
                  <span className="text-[var(--foreground)] pr-4">
                    {faq.question}
                  </span>
                  {openFaqIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[var(--muted-foreground)] shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-6 pb-4"
                  >
                    <p className="text-[var(--muted-foreground)] leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="col-span-12 lg:col-span-5"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="rounded-3xl border border-[color:var(--border)] bg-[var(--card)] p-6 sm:p-7 shadow-lg">
            <div className="w-12 h-12 rounded-full bg-[color:var(--accent)/12] flex items-center justify-center ring-1 ring-[color:var(--accent)/55]">
              <Bell className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <h3 className="mt-4 font-display text-2xl text-[var(--foreground)]">
              Stay Updated
            </h3>
            <p className="mt-2 text-sm sm:text-base text-[var(--muted-foreground)]">
              Subscribe for curated updates on student projects, articles, and
              podcast episodes. One weekly digest, zero noise.
            </p>
            <div className="mt-5 space-y-2.5">
              {NEWSLETTER_BENEFITS.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-start gap-2.5 text-[var(--muted-foreground)]"
                >
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-[var(--accent)]" />
                  <span className="text-sm sm:text-base">{benefit}</span>
                </div>
              ))}
            </div>
            <div className="mt-6">
              {showAuthContent && isSignedIn ? (
                <Link
                  href="/dashboard?tab=email-preferences"
                  className="btn-base bg-[var(--foreground)] text-[var(--background)] w-full sm:w-auto"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Manage Email Preferences
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/sign-up?redirect_url=/dashboard?tab=email-preferences"
                    className="btn-base bg-[var(--foreground)] text-[var(--background)] w-full sm:w-auto"
                  >
                    Sign Up to Subscribe
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <p className="text-[var(--muted-foreground)] text-sm mt-4">
                    Already have an account?{' '}
                    <Link
                      href="/sign-in?redirect_url=/dashboard?tab=email-preferences"
                      className="text-[var(--foreground)] underline hover:no-underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </HomeSection>
  );
}
