import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is moderator or admin (fetch full user to access role)
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const role = (user as any)?.role || 'USER';
    if (!user || (role !== 'MODERATOR' && role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const submissions = await prisma.submission.findMany({
      include: {
        author: {
          select: {
            id: true,
            clerkId: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      submissions: submissions.map((s: any) => ({
        id: s.id,
        postType: s.postType,
        title: s.title,
        content: s.content,
        thumbnailUrl: s.thumbnailUrl,
        projectLinks: s.projectLinks || [],
        sources: s.sources,
        status: s.status,
        createdAt: s.createdAt.toISOString(),
        submittedAt: s.submittedAt?.toISOString(),
        reviewedAt: s.reviewedAt?.toISOString(),
        publishedAt: s.publishedAt?.toISOString(),
        rejectionReason: s.rejectionReason,
        author: {
          id: s.author.id,
          email: s.author.email,
          name: s.author.name,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
