'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OnboardingTooltipProps {
  id: string; // Unique key for localStorage
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

/**
 * OnboardingTooltip - A one-time tutorial tooltip that uses localStorage for persistence
 *
 * Usage:
 * <OnboardingTooltip
 *   id="create-post-type"
 *   title="Choose a Post Type"
 *   content="SM Expo is for projects, SM Now is for articles..."
 * >
 *   <PostTypeSelector />
 * </OnboardingTooltip>
 */
export default function OnboardingTooltip({
  id,
  title,
  content,
  position = 'bottom',
  children,
  className = '',
}: OnboardingTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);

    // Check if this tooltip has been seen before
    const storageKey = `onboarding_${id}_seen`;
    const hasBeenSeen = localStorage.getItem(storageKey);

    if (!hasBeenSeen) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [id]);

  const dismissTooltip = () => {
    const storageKey = `onboarding_${id}_seen`;
    localStorage.setItem(storageKey, 'true');
    setIsVisible(false);
  };

  // Position styles for the tooltip
  const positionStyles: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    left: 'right-full top-1/2 -translate-y-1/2 mr-3',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  // Arrow styles for the tooltip
  const arrowStyles: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-[var(--primary)]',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-[var(--primary)]',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-[var(--primary)]',
    right:
      'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-[var(--primary)]',
  };

  // Don't render anything on server or if not mounted
  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-50 ${positionStyles[position]}`}
          >
            {/* Tooltip card */}
            <div
              className="bg-(--primary) text-white rounded-xl shadow-xl p-4 min-w-[280px] max-w-[320px]"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="font-semibold text-sm">{title}</h4>
                </div>
                <button
                  onClick={dismissTooltip}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0"
                  aria-label="Dismiss tip"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <p className="text-sm text-white/90 leading-relaxed pl-8">
                {content}
              </p>

              {/* Got it button */}
              <div className="flex justify-end mt-3">
                <button
                  onClick={dismissTooltip}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>

            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-8 ${arrowStyles[position]}`}
              style={{
                borderTopColor:
                  position === 'bottom' ? 'transparent' : undefined,
                borderBottomColor:
                  position === 'top' ? 'transparent' : undefined,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Hook to manually check and reset onboarding states
 */
export function useOnboarding(id: string) {
  const [hasSeenTooltip, setHasSeenTooltip] = useState(true);

  useEffect(() => {
    const storageKey = `onboarding_${id}_seen`;
    setHasSeenTooltip(!!localStorage.getItem(storageKey));
  }, [id]);

  const markAsSeen = () => {
    const storageKey = `onboarding_${id}_seen`;
    localStorage.setItem(storageKey, 'true');
    setHasSeenTooltip(true);
  };

  const reset = () => {
    const storageKey = `onboarding_${id}_seen`;
    localStorage.removeItem(storageKey);
    setHasSeenTooltip(false);
  };

  return { hasSeenTooltip, markAsSeen, reset };
}

/**
 * Reset all onboarding tooltips (useful for testing or user preference)
 */
export function resetAllOnboarding() {
  const keys = Object.keys(localStorage).filter((key) =>
    key.startsWith('onboarding_')
  );
  keys.forEach((key) => localStorage.removeItem(key));
}
