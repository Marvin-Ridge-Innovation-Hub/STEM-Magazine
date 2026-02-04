'use client';

import { cn } from '@/lib/utils';

/**
 * Simple CSS-only skeleton component for loading states
 * Avoids framer-motion dependency for faster initial load
 */
function SimpleSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-md bg-gray-200 dark:bg-gray-800 animate-pulse',
        className
      )}
      {...props}
    />
  );
}

/**
 * Loading fallback for HeroCarousel during dynamic import
 * Matches the approximate size and style of the carousel
 */
export function HeroCarouselSkeleton() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <SimpleSkeleton className="w-full h-full rounded-none" />
      <div
        className="absolute inset-0 bg-linear-to-b from-black/50 via-black/30 to-black/50"
        style={{ opacity: 0.55 }}
      />
    </div>
  );
}

/**
 * Loading fallback for motion sections
 */
export function SectionSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <SimpleSkeleton className="h-12 w-3/4 mx-auto mb-4" />
      <SimpleSkeleton className="h-6 w-1/2 mx-auto mb-2" />
      <SimpleSkeleton className="h-6 w-2/3 mx-auto" />
    </div>
  );
}

/**
 * Loading fallback for feature cards
 */
export function FeatureCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-800 animate-pulse">
      <SimpleSkeleton className="h-12 w-12 rounded-full mb-4" />
      <SimpleSkeleton className="h-6 w-3/4 mb-2" />
      <SimpleSkeleton className="h-4 w-full mb-1" />
      <SimpleSkeleton className="h-4 w-5/6" />
    </div>
  );
}
