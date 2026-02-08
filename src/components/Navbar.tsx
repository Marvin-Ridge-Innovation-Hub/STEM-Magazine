'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';

import ThemeToggle from './ThemeToggle';

export default function MainNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  const showAuthContent = mounted && isLoaded;
  const authDesktopItem = showAuthContent ? (
    isSignedIn ? (
      <Link
        href="/dashboard"
        className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
      >
        {user?.firstName ? `${user.firstName}'s Dashboard` : 'Dashboard'}
      </Link>
    ) : (
      <SignInButton mode="modal">
        <button className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200">
          Sign In
        </button>
      </SignInButton>
    )
  ) : (
    <span className="text-sm font-medium text-[var(--muted-foreground)] w-20" />
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[color:var(--border)] bg-[color:var(--background)/85] backdrop-blur-lg shadow-sm">
      <div className="relative grid h-16 w-full grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6">
        <Link href="/" className="flex h-full items-center justify-start">
          <Image
            src="/images/carouselimages/logo-padded.png"
            alt="MRHS STEM Magazine"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full shadow-sm ring-1 ring-white/30"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center justify-center gap-8">
          <Link
            href="/posts"
            className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
          >
            Explore
          </Link>
          {showAuthContent && isSignedIn && (
            <Link
              href="/create"
              className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
            >
              Post
            </Link>
          )}
          {authDesktopItem}
        </nav>

        <div className="flex items-center justify-end gap-2">
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              className="text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
              onClick={handleToggle}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-16 z-50 border-b border-[color:var(--border)] bg-[var(--background)] shadow-lg md:hidden animate-in slide-in-from-top duration-300 max-w-full">
            <div className="w-full py-6 flex flex-col space-y-4 px-4 sm:px-6">
              <Link
                href="/posts"
                className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                onClick={handleToggle}
              >
                Explore
              </Link>
              {showAuthContent && isSignedIn && (
                <Link
                  href="/create"
                  className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                  onClick={handleToggle}
                >
                  Post
                </Link>
              )}
              {showAuthContent ? (
                isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200"
                    onClick={handleToggle}
                  >
                    {user?.firstName
                      ? `${user.firstName}'s Dashboard`
                      : 'Dashboard'}
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <button className="text-left text-sm font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors duration-200">
                      Sign In
                    </button>
                  </SignInButton>
                )
              ) : (
                <span className="text-sm font-medium text-[var(--muted-foreground)]" />
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
