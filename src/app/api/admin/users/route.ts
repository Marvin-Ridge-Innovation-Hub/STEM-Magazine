import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or moderator
    const userProfile = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (
      !userProfile ||
      (userProfile.role !== 'ADMIN' && userProfile.role !== 'MODERATOR')
    ) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get all Clerk users
    const client =
      typeof clerkClient === 'function' ? await clerkClient() : clerkClient;
    const clerkUsers = await client.users.getUserList({ limit: 500 });

    // Get database users to get role information
    const dbUsers = await prisma.user.findMany({
      select: {
        clerkId: true,
        role: true,
      },
    });

    const roleMap = new Map(dbUsers.map((u) => [u.clerkId, u.role]));

    // Combine Clerk and DB data
    const users = clerkUsers.data.map((user) => ({
      id: user.id,
      clerkId: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: user.firstName
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : null,
      imageUrl: user.imageUrl,
      banned: user.banned,
      role: roleMap.get(user.id) || 'USER',
      createdAt: user.createdAt,
    }));

    const response = NextResponse.json({ success: true, users });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
