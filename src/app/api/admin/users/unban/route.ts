import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/users/unban
 * Unban a user (admin or moderator)
 */
export async function POST(request: Request) {
  try {
    const { userId: adminId } = await auth();

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or moderator
    const adminProfile = await prisma.user.findUnique({
      where: { clerkId: adminId },
    });

    if (
      !adminProfile ||
      (adminProfile.role !== 'ADMIN' && adminProfile.role !== 'MODERATOR')
    ) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Unban user in Clerk
    const client =
      typeof clerkClient === 'function' ? await clerkClient() : clerkClient;
    await client.users.unbanUser(userId);

    return NextResponse.json({
      success: true,
      message: 'User unbanned successfully',
    });
  } catch (error) {
    console.error('Error unbanning user:', error);
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    );
  }
}
