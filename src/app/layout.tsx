// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { Inter, Poppins } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

import MainFooter from '@/components/Footer';
import MainNavbar from '@/components/Navbar';
import { QueryProvider } from '@/providers/query';
import { ThemeProvider } from '@/providers/theme';
import 'katex/dist/katex.min.css';
import '@/styles/globals.css';
import type { ChildrenProps } from '@/types';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  adjustFontFallback: false,
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

export const metadata = {
  title: {
    default: 'MRHS STEM Magazine | Student Projects, Articles & Podcasts',
    template: '%s | MRHS STEM Magazine',
  },
  description:
    'MRHS STEM Magazine is a student-run STEM magazine featuring projects, articles, and podcasts from Marvin Ridge High School. Explore student innovation.',
  keywords: [
    'MRHS STEM Magazine',
    'STEM Magazine',
    'MRHS STEM',
    'STEM projects',
    'student projects',
    'high school STEM',
    'science magazine',
    'technology articles',
    'engineering projects',
    'mathematics',
    'STEM podcasts',
    'student innovation',
    'Marvin Ridge High School',
    'SM Expo',
    'SM Now',
    'SM Pods',
  ],
  authors: [{ name: 'MRHS STEM Magazine' }, { name: 'Arjun Cattamanchi' }],
  creator: 'Arjun Cattamanchi',
  metadataBase: new URL('https://mrhsstemmag.com'),
  icons: {
    icon: '/images/logo-normal.png',
    shortcut: '/images/logo-normal.png',
    apple: '/images/logo-normal.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://mrhsstemmag.com',
    title: 'MRHS STEM Magazine | Explore Student STEM Projects & Articles',
    description:
      'MRHS STEM Magazine is a student-run STEM magazine featuring projects, articles, and podcasts from Marvin Ridge High School. Explore student innovation.',
    siteName: 'MRHS STEM Magazine',
    images: [
      {
        url: '/images/carouselimages/logo-padded.png',
        width: 1200,
        height: 630,
        alt: 'MRHS STEM Magazine Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MRHS STEM Magazine | Student STEM Projects & Podcasts',
    description:
      'MRHS STEM Magazine is a student-run STEM magazine featuring projects, articles, and podcasts from Marvin Ridge High School. Explore student innovation.',
    images: ['/images/carouselimages/logo-padded.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

function RootLayoutContent({ children }: ChildrenProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryProvider>
        <div className="flex min-h-screen w-full overflow-x-hidden">
          <div className="flex-1 flex flex-col w-full">
            <MainNavbar />
            <main className="flex-1 w-full overflow-x-hidden">{children}</main>
            <MainFooter />
          </div>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            className:
              'bg-[var(--card)] text-[var(--foreground)] border-[color:var(--border)]',
            duration: 3000,
          }}
        />
      </QueryProvider>
    </ThemeProvider>
  );
}

export default function RootLayout({ children }: ChildrenProps) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
        <body
          suppressHydrationWarning
          className={`${inter.variable} ${poppins.variable} font-sans antialiased overflow-x-hidden`}
        >
          <RootLayoutContent>{children}</RootLayoutContent>
        </body>
      </html>
    </ClerkProvider>
  );
}
