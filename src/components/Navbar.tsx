'use client';

import { SignInButton, useUser } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import ThemeToggle from './ThemeToggle';

const NAV_SCROLL_THRESHOLD_Y = 350;
const NAV_SLIDE_DURATION_MS = 50;

export default function MainNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isFloatingMounted, setIsFloatingMounted] = useState(false);
  const [isFloatingVisible, setIsFloatingVisible] = useState(false);
  const { isSignedIn, user, isLoaded } = useUser();

  const enterRafRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatingMountedRef = useRef(false);
  const floatingVisibleRef = useRef(false);
  const pendingEnterRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const showFloatingNav = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      if (!floatingMountedRef.current) {
        floatingMountedRef.current = true;
        setIsFloatingMounted(true);
        floatingVisibleRef.current = false;
        setIsFloatingVisible(false);
        pendingEnterRef.current = true;

        if (enterRafRef.current !== null) {
          cancelAnimationFrame(enterRafRef.current);
          enterRafRef.current = null;
        }

        enterRafRef.current = requestAnimationFrame(() => {
          enterRafRef.current = requestAnimationFrame(() => {
            pendingEnterRef.current = false;
            floatingVisibleRef.current = true;
            setIsFloatingVisible(true);
            enterRafRef.current = null;
          });
        });
        return;
      }

      if (!floatingVisibleRef.current && !pendingEnterRef.current) {
        floatingVisibleRef.current = true;
        setIsFloatingVisible(true);
      }
    };

    const hideFloatingNav = () => {
      if (!floatingMountedRef.current) return;

      if (enterRafRef.current !== null) {
        cancelAnimationFrame(enterRafRef.current);
        enterRafRef.current = null;
      }

      if (pendingEnterRef.current) {
        pendingEnterRef.current = false;
        floatingMountedRef.current = false;
        floatingVisibleRef.current = false;
        setIsFloatingVisible(false);
        setIsFloatingMounted(false);
        return;
      }

      if (floatingVisibleRef.current) {
        floatingVisibleRef.current = false;
        setIsFloatingVisible(false);
      }

      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }

      hideTimeoutRef.current = setTimeout(() => {
        if (!floatingVisibleRef.current) {
          floatingMountedRef.current = false;
          setIsFloatingMounted(false);
        }
        hideTimeoutRef.current = null;
      }, NAV_SLIDE_DURATION_MS);
    };

    const handleScroll = () => {
      if (window.scrollY > NAV_SCROLL_THRESHOLD_Y) {
        showFloatingNav();
      } else {
        hideFloatingNav();
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (enterRafRef.current !== null) {
        cancelAnimationFrame(enterRafRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  const handleToggle = () => {
    setMobileMenuOpen((prev) => !prev);
  };

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

  const renderNavbarBar = () => (
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
    </div>
  );

  return (
    <div className="relative h-16 w-full">
      <header
        className={`relative z-40 w-full border-b border-[color:var(--border)] bg-[color:var(--background)/85] backdrop-blur-lg transition-opacity duration-200 ${
          isFloatingMounted ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {renderNavbarBar()}
      </header>

      {isFloatingMounted && (
        <header
          className={`fixed inset-x-0 top-0 z-50 w-full border-b border-[color:var(--border)] bg-[color:var(--background)/85] backdrop-blur-lg shadow-sm transition-transform duration-300 ${
            isFloatingVisible ? 'translate-y-0' : '-translate-y-full'
          }`}
        >
          {renderNavbarBar()}
        </header>
      )}

      {mobileMenuOpen && (
        <div className="fixed inset-x-0 top-16 z-[60] border-b border-[color:var(--border)] bg-[var(--background)] shadow-lg md:hidden animate-in slide-in-from-top duration-300 max-w-full">
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
  );
}
