import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getAssistantWarningsForSubmission } from '@/lib/moderation/assistantChecks';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    const role =
      typeof user?.role === 'string' ? user.role.toUpperCase() : 'USER';

    if (!user || (role !== 'MODERATOR' && role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id: submissionId } = await context.params;
    if (!submissionId) {
      return NextResponse.json(
        { success: false, error: 'Missing submission id.' },
        { status: 400 }
      );
    }

    const existingSubmission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        author: {
          select: {
            clerkId: true,
          },
        },
      },
    });
    if (!existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found.' },
        { status: 404 }
      );
    }

    if (role === 'MODERATOR' && existingSubmission.author?.clerkId === userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Moderators cannot review their own submissions.',
        },
        { status: 403 }
      );
    }

    const warnings = await getAssistantWarningsForSubmission(submissionId);
    const blockingCount = warnings.filter((warning) => warning.blocking).length;

    return NextResponse.json({
      success: true,
      warnings,
      summary: {
        totalCount: warnings.length,
        blockingCount,
      },
    });
  } catch (error) {
    console.error('Failed to get assistant warnings:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run assistant warning checks.',
      },
      { status: 500 }
    );
  }
}
