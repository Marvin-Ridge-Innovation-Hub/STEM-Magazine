import type { NextConfig } from 'next';

// Optional bundle analyzer - only load if installed
let withBundleAnalyzer: (config: NextConfig) => NextConfig;
try {
  const bundleAnalyzer = require('@next/bundle-analyzer');
  withBundleAnalyzer = bundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });
} catch {
  // Bundle analyzer not installed, use identity function
  withBundleAnalyzer = (config: NextConfig) => config;
}

const nextConfig: NextConfig = {
  // ============================================
  // VERCEL OPTIMIZATION SETTINGS
  // ============================================

  experimental: {
    turbopackFileSystemCacheForDev: true,
    // Optimize imports for commonly used packages to reduce bundle size
    optimizePackageImports: [
      'lucide-react',
      'react-icons',
      'date-fns',
      'framer-motion',
      '@tanstack/react-query',
    ],
  },

  // cacheComponents: true, // TODO: Enable after resolving Clerk compatibility
  reactCompiler: true,

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Packages that should not be bundled (reduces function size for cold starts)
  serverExternalPackages: ['nodemailer', 'winston'],

  // Enable output file tracing for smaller serverless functions
  outputFileTracingIncludes: {
    '/api/**/*': ['./node_modules/.prisma/**/*'],
  },

  images: {
    qualities: [75, 85],
    // Optimize image loading with proper sizing
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
  },

  // Reduce bundle size by excluding source maps in production
  productionBrowserSourceMaps: false,

  // Enable gzip compression
  compress: true,

  // Optimize for Vercel's edge network
  poweredByHeader: false,

  // Strict mode for better error catching
  reactStrictMode: true,
};

export default withBundleAnalyzer(nextConfig);
