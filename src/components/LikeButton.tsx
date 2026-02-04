'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LikeButtonProps {
  postId: string;
  initialLikeCount?: number;
  initialHasLiked?: boolean;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LikeButton({
  postId,
  initialLikeCount = 0,
  initialHasLiked = false,
  showCount = true,
  size = 'md',
}: LikeButtonProps) {
  const { isSignedIn } = useUser();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [hasLiked, setHasLiked] = useState(initialHasLiked);
  const [loading, setLoading] = useState(false);
  const [showSignInTooltip, setShowSignInTooltip] = useState(false);

  // Load initial like status
  useEffect(() => {
    const loadLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/likes`);
        const data = await response.json();
        if (data.success) {
          setLikeCount(data.likeCount);
          setHasLiked(data.hasLiked);
        }
      } catch (error) {
        console.error('Failed to load like status:', error);
      }
    };

    loadLikeStatus();
  }, [postId]);

  const handleLike = async () => {
    if (!isSignedIn) {
      setShowSignInTooltip(true);
      setTimeout(() => setShowSignInTooltip(false), 2000);
      return;
    }

    if (loading) return;

    // Optimistic update
    setHasLiked(!hasLiked);
    setLikeCount((prev) => (hasLiked ? prev - 1 : prev + 1));
    setLoading(true);

    try {
      const response = await fetch(`/api/posts/${postId}/likes`, {
        method: 'POST',
      });

      const data = await response.json();
      if (data.success) {
        setHasLiked(data.hasLiked);
        setLikeCount(data.likeCount);
      } else {
        // Revert on error
        setHasLiked(hasLiked);
        setLikeCount(likeCount);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert on error
      setHasLiked(hasLiked);
      setLikeCount(likeCount);
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const buttonSizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2',
  };

  return (
    <div className="relative">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`inline-flex items-center rounded-full font-medium transition-all ${buttonSizeClasses[size]} ${
          hasLiked
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-(--muted) text-(--muted-foreground) hover:bg-(--muted)/80'
        } ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <motion.div
          animate={hasLiked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart
            className={`${sizeClasses[size]} ${hasLiked ? 'fill-current' : ''}`}
          />
        </motion.div>
        {showCount && <span>{likeCount > 0 ? likeCount : ''}</span>}
      </button>

      {/* Sign in tooltip */}
      <AnimatePresence>
        {showSignInTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-(--foreground) text-(--background) text-xs rounded-lg whitespace-nowrap shadow-lg"
          >
            Sign in to like posts
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-(--foreground)"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
