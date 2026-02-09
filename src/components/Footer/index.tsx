'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { getCurrentYear } from '@/lib/date';

function CurrentYear() {
  const currentYear = getCurrentYear();
  return <>{currentYear}</>;
}

export default function MainFooter() {
  return (
    <footer className="w-full py-8 bg-(--card) border-t border-(--border)">
      <div className="container px-4 md:px-6 max-w-full">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-semibold text-(--foreground) font-poppins">
              MRHS STEM Magazine by Arjun Cattamanchi
            </span>
            <span className="text-sm text-(--muted-foreground)">
              (c){' '}
              <Suspense fallback="2024">
                <CurrentYear />
              </Suspense>{' '}
              All rights reserved.
            </span>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Link
              href="/posts"
              className="text-sm text-(--muted-foreground) hover:text-(--primary) transition-colors duration-200"
            >
              Explore
            </Link>
            <Link
              href="/credits"
              className="text-sm text-(--muted-foreground) hover:text-(--primary) transition-colors duration-200"
            >
              Credits
            </Link>
            <Link
              href="/tos"
              className="text-sm text-(--muted-foreground) hover:text-(--primary) transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-(--muted-foreground) hover:text-(--primary) transition-colors duration-200"
            >
              Privacy
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
