import { PrismaClient } from '@prisma/client';

/**
 * Optimized Prisma client for Vercel serverless environment
 *
 * Key optimizations for cold starts:
 * 1. Singleton pattern to reuse connections across invocations
 * 2. Lazy connection - only connects when first query is made
 * 3. Reduced logging in production to minimize overhead
 * 4. Connection pooling via PrismaClient's built-in pool
 *
 * For even better performance, consider:
 * - Prisma Accelerate (https://www.prisma.io/accelerate) for connection pooling
 * - Prisma Data Proxy for edge deployments
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
    // Optimize connection handling for serverless
    datasourceUrl: process.env.MONGODB_URI,
  });
};

// Use existing client if available (prevents connection exhaustion in serverless)
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Only cache in non-production to allow hot reload during development
// In production on Vercel, this helps reuse connections within the same instance
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  // In production, also cache to reuse across warm starts
  globalForPrisma.prisma = prisma;
}

export default prisma;
