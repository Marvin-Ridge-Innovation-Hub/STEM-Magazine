'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import HeroCarousel from '@/components/HeroCarousel';
import { HERO_METRICS, HERO_MODULES, heroImages } from './home-data';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function HeroSection() {
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showAuthContent = mounted && isLoaded;

  return (
    <motion.section
      className="w-full py-14 sm:py-20 md:py-24 lg:py-28 relative min-h-[60vh] sm:min-h-[66vh] flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <HeroCarousel
        images={heroImages}
        autoplayInterval={8000}
        surfaceOpacity={0.26}
        overlayVariant="subtle"
      />
      <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-[color:var(--accent)/18] blur-3xl pointer-events-none" />

      <div className="container px-4 sm:px-6 relative z-10 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center lg:pl-4">
          <motion.div
            className="space-y-6 text-center lg:text-left"
            {...fadeIn}
          >
            <div className="inline-flex items-center gap-2 rounded-full border backdrop-blur-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] hero-label hero-bubble">
              <span className="accent-dot" />
              <Sparkles className="h-3.5 w-3.5" />
              Student-led STEM Publication
            </div>
            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl hero-title leading-[0.95] tracking-[0.03em]">
              MRHS STEM
              <br />
              MAGAZINE
            </h1>
            <p className="max-w-xl text-base sm:text-lg leading-relaxed mx-auto lg:mx-0 hero-lead">
              A publication built to spotlight creativity, innovation, and
              problem-solving across science, technology, engineering, and math.
              Students share what they build, how they think, and why it
              matters.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start lg:items-start gap-4 w-full sm:w-auto">
              <Link href="/posts" className="btn-primary w-full sm:w-auto">
                Explore Posts
              </Link>
              {showAuthContent && isSignedIn ? (
                <Link href="/create" className="btn-secondary w-full sm:w-auto">
                  Create Post
                </Link>
              ) : (
                <Link
                  href="/sign-up"
                  className="btn-secondary w-full sm:w-auto"
                >
                  Get Started
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 min-[520px]:grid-cols-3 gap-3 pt-2 max-w-xl mx-auto lg:mx-0 w-full">
              {HERO_METRICS.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-xl border px-3 py-3 text-center hero-metric"
                >
                  <div className="font-bold text-base sm:text-lg hero-metric-value">
                    {metric.value}
                  </div>
                  <div className="text-[11px] sm:text-xs hero-metric-label">
                    {metric.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.aside
            className="w-full max-w-xl mx-auto lg:max-w-none rounded-3xl border p-5 sm:p-6 shadow-xl backdrop-blur-xl hero-panel"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.22em] hero-panel-text">
                Publish Paths
              </p>
              <h3 className="font-display text-xl sm:text-3xl leading-tight tracking-[0.02em] hero-panel-text">
                Build. Write. Broadcast.
              </h3>
              <p className="text-sm hero-panel-text">
                Three different formats for one shared goal: student ideas
                reaching more students.
              </p>
            </div>
            <div className="mt-5 space-y-3">
              {HERO_MODULES.map((module) => (
                <div
                  key={module.name}
                  className="rounded-xl border p-3.5 hero-panel-card"
                >
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className={`rounded-lg p-2 ${module.chipClass}`}>
                      <module.icon className="h-4 w-4" />
                    </div>
                    <span className="font-semibold hero-panel-text">
                      {module.name}
                    </span>
                  </div>
                  <p className="text-xs ml-11 hero-panel-text">{module.note}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>
    </motion.section>
  );
}
