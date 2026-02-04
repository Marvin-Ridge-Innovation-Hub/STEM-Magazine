import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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

    return NextResponse.json({
      authorized,
      role,
    });
  } catch (error) {
    console.error('Error checking role:', error);
    return NextResponse.json(
      { authorized: false, error: 'Failed to check authorization' },
      { status: 500 }
    );
  }
}
