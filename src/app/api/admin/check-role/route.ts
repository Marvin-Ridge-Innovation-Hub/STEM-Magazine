import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { authorized: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get user from database (fetch full user to access role)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json(
        { authorized: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is MODERATOR or ADMIN
    const role = (user as any).role || 'USER';
    const authorized = role === 'MODERATOR' || role === 'ADMIN';

    const response = NextResponse.json({
      authorized,
      role,
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      { authorized: false, error: 'Failed to check authorization' },
      { status: 500 }
    );
  }
}
