import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - List all SM Pods (for admin management)
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin/moderator
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const role =
      typeof user?.role === 'string' ? user.role.toUpperCase() : 'USER';

    if (!user || (role !== 'ADMIN' && role !== 'MODERATOR')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const pods = await prisma.submission.findMany({
      where: {
        postType: 'SM_PODS',
      },
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
      pods,
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching SM Pods:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SM Pods' },
      { status: 500 }
    );
  }
}

// POST - Create a new SM Pod (admin only)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin/moderator
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const role =
      typeof user?.role === 'string' ? user.role.toUpperCase() : 'USER';

    if (!user || (role !== 'ADMIN' && role !== 'MODERATOR')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content, youtubeUrl, thumbnailUrl, tags } = body;

    // Validate required fields
    if (!title || !youtubeUrl) {
      return NextResponse.json(
        { success: false, error: 'Title and YouTube URL are required' },
        { status: 400 }
      );
    }

    // Validate YouTube URL
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[a-zA-Z0-9_-]+/;
    if (!youtubeRegex.test(youtubeUrl)) {
      return NextResponse.json(
        { success: false, error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Extract YouTube video ID for thumbnail if not provided
    let finalThumbnailUrl = thumbnailUrl;
    if (!finalThumbnailUrl) {
      const videoIdMatch = youtubeUrl.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
      );
      if (videoIdMatch) {
        finalThumbnailUrl = `https://img.youtube.com/vi/${videoIdMatch[1]}/maxresdefault.jpg`;
      }
    }

    // Create SM Pod (auto-approved since it's admin-created)
    const pod = await prisma.submission.create({
      data: {
        postType: 'SM_PODS',
        title,
        content: content || '',
        youtubeUrl,
        thumbnailUrl: finalThumbnailUrl,
        tags: tags || [],
        projectLinks: [],
        status: 'APPROVED',
        authorId: user.id,
        reviewedBy: userId,
        submittedAt: new Date(),
        reviewedAt: new Date(),
        publishedAt: new Date(),
      },
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
    });

    return NextResponse.json({
      success: true,
      pod,
      message: 'SM Pod created successfully',
    });
  } catch (error) {
    console.error('Error creating SM Pod:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create SM Pod' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an SM Pod (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin/moderator
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    const role =
      typeof user?.role === 'string' ? user.role.toUpperCase() : 'USER';

    if (!user || (role !== 'ADMIN' && role !== 'MODERATOR')) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const podId = searchParams.get('id');

    if (!podId) {
      return NextResponse.json(
        { success: false, error: 'Pod ID is required' },
        { status: 400 }
      );
    }

    // Verify it's an SM Pod
    const pod = await prisma.submission.findUnique({
      where: { id: podId },
    });

    if (!pod || pod.postType !== 'SM_PODS') {
      return NextResponse.json(
        { success: false, error: 'SM Pod not found' },
        { status: 404 }
      );
    }

    await prisma.submission.delete({
      where: { id: podId },
    });

    return NextResponse.json({
      success: true,
      message: 'SM Pod deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting SM Pod:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete SM Pod' },
      { status: 500 }
    );
  }
}
