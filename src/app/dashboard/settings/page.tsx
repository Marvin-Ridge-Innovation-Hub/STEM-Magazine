'use client';

import { UserProfile, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const lastUpdatedAtRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const updatedAt = user.updatedAt
      ? new Date(user.updatedAt).toISOString()
      : null;

    if (!lastUpdatedAtRef.current) {
      lastUpdatedAtRef.current = updatedAt;
      return;
    }

    if (updatedAt && updatedAt !== lastUpdatedAtRef.current) {
      lastUpdatedAtRef.current = updatedAt;
      void fetch('/api/profile/sync', { method: 'POST' }).catch((error) => {
        console.error('Failed to sync profile:', error);
      });
    }
  }, [isLoaded, user]);

  return (
    <div className="min-h-screen bg-(--background)">
      {/* Header */}
      <div className="border-b border-(--border) bg-(--card)">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-(--muted-foreground) hover:text-(--foreground) transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Title */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-(--primary)/10 flex items-center justify-center">
              <Settings className="h-6 w-6 text-(--primary)" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-(--foreground)">
                Account Settings
              </h1>
              <p className="text-(--muted-foreground)">
                Manage your account security, password, and connected accounts
              </p>
            </div>
          </div>

          {/* Clerk UserProfile Component */}
          <div className="flex justify-center">
            <UserProfile
              appearance={{
                elements: {
                  rootBox: 'w-full max-w-4xl',
                  card: 'shadow-lg rounded-2xl border border-(--border)',
                  navbar: 'hidden',
                  pageScrollBox: 'p-6',
                  profileSection: 'mb-6',
                  formButtonPrimary:
                    'bg-(--primary) hover:bg-(--primary)/90 text-(--primary-foreground)',
                },
                variables: {
                  colorPrimary: 'hsl(var(--primary))',
                  colorBackground: 'hsl(var(--card))',
                  colorText: 'hsl(var(--foreground))',
                  colorTextSecondary: 'hsl(var(--muted-foreground))',
                  colorInputBackground: 'hsl(var(--background))',
                  colorInputText: 'hsl(var(--foreground))',
                  borderRadius: '0.75rem',
                },
              }}
              routing="hash"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
