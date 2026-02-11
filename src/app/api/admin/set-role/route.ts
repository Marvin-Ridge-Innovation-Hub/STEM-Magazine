import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, role } = await request.json();
    const requestedRole = typeof role === 'string' ? role.toUpperCase() : '';

    if (!email || !['MODERATOR', 'ADMIN', 'USER'].includes(requestedRole)) {
      return NextResponse.json(
        { error: 'Invalid email or role' },
        { status: 400 }
      );
    }

    // Check if caller is already an ADMIN
    const caller = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, email: true },
    });

    // Allow if caller is admin, or if this is their first time setting their own role
    const isSettingOwnRole =
      clerkUser.emailAddresses[0]?.emailAddress === email;
    const callerRole =
      typeof caller?.role === 'string' ? caller.role.toUpperCase() : 'USER';
    const callerHasAdminRole = callerRole === 'ADMIN';

    if (!callerHasAdminRole && !isSettingOwnRole) {
      return NextResponse.json(
        {
          error: 'Only admins can set roles for other users',
        },
        { status: 403 }
      );
    }

    // Update or create user with role
    const user = await prisma.user.upsert({
      where: { email },
      update: { role: requestedRole },
      create: {
        email,
        clerkId: userId,
        name: clerkUser.firstName || clerkUser.username || 'User',
        role: requestedRole,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${user.email} is now a ${requestedRole}`,
      shouldRefresh: isSettingOwnRole,
    });
  } catch (error) {
    console.error('Error setting role:', error);
    return NextResponse.json({ error: 'Failed to set role' }, { status: 500 });
  }
}
