import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { deleteSubmission } from '@/services/submissionService';

/**
 * POST /api/admin/users/ban
 * Ban a user (admin or moderator)
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

    const adminRole =
      typeof adminProfile?.role === 'string'
        ? adminProfile.role.toUpperCase()
        : 'USER';

    if (!adminProfile || (adminRole !== 'ADMIN' && adminRole !== 'MODERATOR')) {
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

    const targetRole =
      typeof targetUser?.role === 'string'
        ? targetUser.role.toUpperCase()
        : 'USER';

    if (targetRole === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot ban admin users' },
        { status: 400 }
      );
    }

    // Delete all pending and rejected submissions for this user (if they exist)
    let deletedSubmissionsCount = 0;
    if (targetUser) {
      const submissionsToDelete = await prisma.submission.findMany({
        where: {
          authorId: targetUser.id,
          status: { in: ['PENDING', 'REJECTED'] },
        },
        select: { id: true },
      });

      if (submissionsToDelete.length > 0) {
        const ids = submissionsToDelete.map((s) => s.id);
        for (const sid of ids) {
          try {
            await deleteSubmission(sid);
            console.log('Deleted submission on ban:', sid);
            deletedSubmissionsCount++;
          } catch (err) {
            console.error('Failed to delete submission during ban:', sid, err);
          }
        }

        // Clean up pendingPostIds on the user
        try {
          const userPending = (
            await prisma.user.findUnique({
              where: { id: targetUser.id },
              select: { pendingPostIds: true },
            })
          )?.pendingPostIds;

          if (userPending && userPending.length > 0) {
            await prisma.user.update({
              where: { id: targetUser.id },
              data: {
                pendingPostIds: {
                  set: userPending.filter((pid) => !ids.includes(pid)),
                },
              },
            });
          }
        } catch (err) {
          console.error(
            'Failed to clean up pendingPostIds for banned user:',
            err
          );
        }
      }
    }

    // Ban user in Clerk
    const client =
      typeof clerkClient === 'function' ? await clerkClient() : clerkClient;
    await client.users.banUser(userId);

    return NextResponse.json({
      success: true,
      message: 'User banned successfully',
      deletedSubmissions: deletedSubmissionsCount,
    });
  } catch (error) {
    console.error('Error banning user:', error);
    return NextResponse.json({ error: 'Failed to ban user' }, { status: 500 });
  }
}
