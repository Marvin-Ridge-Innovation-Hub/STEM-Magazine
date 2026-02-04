import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * POST /api/admin/users/ban
 * Ban a user (admin only)
 */
export async function POST(request: Request) {
  try {
    const { userId: adminId } = await auth();

    if (!adminId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminProfile = await prisma.user.findUnique({
      where: { clerkId: adminId },
    });

    if (!adminProfile || adminProfile.role !== 'ADMIN') {
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

    // Prevent banning admins
    const targetUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (targetUser?.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot ban admin users' },
        { status: 400 }
      );
    }

    // Ban user in Clerk
    const client = await clerkClient();
    await client.users.banUser(userId);

    return NextResponse.json({
      success: true,
      message: 'User banned successfully',
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
  }
}
