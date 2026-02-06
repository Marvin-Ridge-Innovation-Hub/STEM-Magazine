'use client';

import { SignInButton, SignOutButton, useUser } from '@clerk/nextjs';
import { Github, Menu, X } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-50 w-full bg-(--background)/85 backdrop-blur-lg border-b border-(--border) shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 max-w-full">
        <Link href="/" className="flex h-full items-center">
          <Image
            src="/images/carouselimages/logo-padded.png"
            alt="MRHS STEM Magazine"
            width={48}
            height={48}
            className="h-12 w-12 rounded-full shadow-sm ring-1 ring-white/30"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/posts"
            className="text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors duration-200"
          >
            Explore
          </Link>
          {showAuthContent && isSignedIn && (
            <Link
              href="/create"
              className="text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors duration-200"
            >
              Post
            </Link>
          )}
          {showAuthContent ? (
            isSignedIn ? (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors duration-200"
              >
                {user?.firstName
                  ? `${user.firstName}'s Dashboard`
                  : 'Dashboard'}
              </Link>
            ) : (
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors duration-200">
                  Sign In
                </button>
              </SignInButton>
            )
          ) : (
            <span className="text-sm font-medium text-(--muted-foreground) w-20" />
          )}
        </nav>

        <button
          type="button"
          className="md:hidden text-(--foreground) hover:text-(--primary) transition-colors duration-200"
          onClick={handleToggle}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {mobileMenuOpen && (
          <div className="fixed inset-x-0 top-16 z-50 bg-(--background) border-b border-(--border) shadow-lg md:hidden animate-in slide-in-from-top duration-300 max-w-full">
            <div className="container py-6 flex flex-col space-y-4 px-4 sm:px-6 max-w-full">
              <Link
                href="/posts"
                className="text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors duration-200"
                onClick={handleToggle}
              >
                Explore
              </Link>
              {showAuthContent && isSignedIn && (
                <Link
                  href="/create"
                  className="text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors duration-200"
                  onClick={handleToggle}
                >
                  Post
                </Link>
              )}
              <div className="flex items-center justify-between">
                {showAuthContent ? (
                  isSignedIn ? (
                    <Link
                      href="/dashboard"
                      className="text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors duration-200"
                      onClick={handleToggle}
                    >
                      {user?.firstName
                        ? `${user.firstName}'s Dashboard`
                        : 'Dashboard'}
                    </Link>
                  ) : (
                    <SignInButton mode="modal">
                      <button className="text-sm font-medium text-(--foreground) hover:text-(--primary) transition-colors duration-200">
                        Sign In
                      </button>
                    </SignInButton>
                  )
                ) : (
                  <span className="text-sm font-medium text-(--muted-foreground)" />
                )}
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
