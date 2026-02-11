import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const role =
      typeof (user as any)?.role === 'string'
        ? (user as any).role.toUpperCase()
        : 'USER';
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

    const response = NextResponse.json({
      success: true,
      submissions: submissions.map((s: any) => {
        const isOwnSubmission = s.author.clerkId === userId;
        const canReview = role === 'ADMIN' || !isOwnSubmission;
        return {
          id: s.id,
          postType: s.postType,
          title: s.title,
          content: s.content,
          thumbnailUrl: s.thumbnailUrl,
          images: s.images || [],
          imageAttributions: s.imageAttributions ?? undefined,
          thumbnailAttribution: s.thumbnailAttribution ?? undefined,
          projectLinks: s.projectLinks || [],
          sources: s.sources,
          tags: s.tags || [],
          status: s.status,
          canMoveToDraft: s.canMoveToDraft,
          canReview,
          reviewBlockedReason: canReview
            ? null
            : 'Moderators cannot review their own submissions.',
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
        };
      }),
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
