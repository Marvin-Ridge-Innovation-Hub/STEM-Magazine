'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Tag } from 'lucide-react';
import { useState } from 'react';
import HomeSection from '@/components/HomeSection';
import { PLATFORM_CARD_STYLES, PLATFORM_ROWS, TOPIC_GROUPS } from './home-data';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const toTagSlug = (tag: string) =>
  tag.toLowerCase().trim().replace(/\s+/g, '-');

export default function ExploreTracksSection() {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const activeTrack = PLATFORM_ROWS[activeTrackIndex] || PLATFORM_ROWS[0];

  return (
    <HomeSection
      variant="band"
      tone="card"
      className="relative py-0 sm:py-0 md:py-0"
    >
      <div className="absolute inset-0 left-1/2 -translate-x-1/2 w-screen pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_60%)] opacity-50" />
        <div className="absolute -top-24 left-[8%] h-40 w-40 rounded-full bg-[color:var(--accent)/16] blur-3xl pointer-events-none" />
      </div>
      <div className="py-6 sm:py-8 md:py-10">
        <div className="home-grid gap-8 lg:gap-10 lg:grid-cols-1 lg:place-items-center">
          <motion.div
            className="col-span-12 lg:col-span-1 space-y-4 flex flex-col justify-center lg:text-center lg:items-center"
            {...fadeIn}
          >
            <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] flex items-center gap-2">
              <span className="accent-dot" />
              Explore
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-[var(--foreground)]">
              Platforms and Topics
            </h2>
            <p className="max-w-xl text-[var(--muted-foreground)] text-base sm:text-lg">
              Browse the three publishing platforms, then explore the topic
              constellations students write about. Each area stands on its own
              while still living in the same creative space.
            </p>
          </motion.div>

          <div className="col-span-12 lg:col-span-1 grid gap-6 lg:gap-8 lg:max-w-5xl w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative rounded-3xl border border-[color:var(--border)] bg-[var(--background)] p-6 sm:p-7 shadow-lg flex flex-col"
            >
              <div className="relative">
                <div className="flex flex-wrap items-center justify-between gap-3 lg:justify-center">
                  <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                    Platforms
                  </div>
                  <Link
                    href={`/posts?type=${activeTrack.postType}`}
                    className="btn-secondary"
                  >
                    {activeTrack.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
                <h3 className="mt-3 font-display text-2xl text-[var(--foreground)]">
                  Publishing Tracks
                </h3>
                <p className="mt-2 text-sm sm:text-base text-[var(--muted-foreground)]">
                  Choose the format that fits your story, then jump into the
                  workflow for that track.
                </p>
              </div>
              <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:justify-center">
                {PLATFORM_ROWS.map((platform, index) => (
                  <motion.button
                    key={platform.title}
                    type="button"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.1 }}
                    onClick={() => setActiveTrackIndex(index)}
                    className={`w-full rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 lg:flex-1 lg:min-w-[220px] ${
                      activeTrackIndex === index
                        ? 'border-[color:var(--primary)] bg-[color:var(--primary)/6] shadow-md'
                        : 'border-[color:var(--border)] bg-[var(--background)] hover:border-[color:var(--primary)]'
                    } ${PLATFORM_CARD_STYLES[index % PLATFORM_CARD_STYLES.length]}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)]">
                        <platform.icon className="h-6 w-6" />
                      </div>
                      <div className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                    <h3 className="mt-4 font-display text-2xl text-[var(--foreground)]">
                      {platform.title}
                    </h3>
                    <p className="mt-2 text-sm sm:text-base text-[var(--muted-foreground)]">
                      {platform.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--muted-foreground)]">
                      {platform.meta.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-[color:var(--border)] px-3 py-1"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative rounded-3xl border border-[color:var(--border)] bg-[var(--background)] p-6 sm:p-7 shadow-lg flex flex-col"
            >
              <div className="relative">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] lg:justify-center">
                  <Tag className="h-4 w-4 text-[var(--primary)]" />
                  Topics
                </div>
                <h3 className="mt-3 font-display text-2xl text-[var(--foreground)] lg:text-center">
                  Topic Constellations
                </h3>
                <p className="mt-2 text-sm sm:text-base text-[var(--muted-foreground)] lg:text-center lg:max-w-2xl lg:mx-auto">
                  Explore clusters of ideas students are building, debating, and
                  explaining across the STEM spectrum.
                </p>
              </div>

              <div className="mt-6">
                <div className="constellation">
                  <div className="constellation-hub">STEM Topics</div>
                  {TOPIC_GROUPS.map((group, index) => (
                    <div
                      key={group.label}
                      className={`constellation-node constellation-node-${index + 1}`}
                    >
                      <div className="constellation-label">{group.label}</div>
                      <div className="constellation-links">
                        {group.tags.map((tag) => (
                          <Link
                            key={`${group.label}-${tag}`}
                            href={`/posts?tag=${toTagSlug(tag)}`}
                            className="chip-outline text-xs"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                  <svg
                    className="constellation-lines"
                    viewBox="0 0 200 200"
                    preserveAspectRatio="none"
                  >
                    <line x1="100" y1="28" x2="8" y2="86" />
                    <line x1="100" y1="28" x2="192" y2="86" />
                    <line x1="100" y1="28" x2="36" y2="186" />
                    <line x1="100" y1="28" x2="164" y2="186" />
                  </svg>
                </div>
                <div className="constellation-fallback">
                  {TOPIC_GROUPS.map((group) => (
                    <div
                      key={group.label}
                      className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-4 shadow-sm w-full sm:w-[calc(50%-0.5rem)]"
                    >
                      <div className="mb-3 text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                        {group.label}
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {group.tags.map((tag) => (
                          <Link
                            key={`${group.label}-${tag}`}
                            href={`/posts?tag=${toTagSlug(tag)}`}
                            className="chip-outline text-xs"
                          >
                            {tag}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
