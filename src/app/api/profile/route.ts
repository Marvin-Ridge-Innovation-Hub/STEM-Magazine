import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        twitter: true,
        github: true,
        linkedin: true,
        instagram: true,
        youtube: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile: user });
  } catch (error) {
    console.error('Failed to get profile:', error);
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bio, website, twitter, github, linkedin, instagram, youtube } =
      body;

    // Validate URLs if provided
    const urlFields = {
      website,
      twitter,
      github,
      linkedin,
      instagram,
      youtube,
    };
    for (const [field, value] of Object.entries(urlFields)) {
      if (value && typeof value === 'string' && value.trim() !== '') {
        try {
          // Allow URLs without protocol
          const urlToCheck = value.startsWith('http')
            ? value
            : `https://${value}`;
          new URL(urlToCheck);
        } catch {
          return NextResponse.json(
            { error: `Invalid URL for ${field}` },
            { status: 400 }
          );
        }
      }
    }

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        bio: bio?.trim() || null,
        website: website?.trim() || null,
        twitter: twitter?.trim() || null,
        github: github?.trim() || null,
        linkedin: linkedin?.trim() || null,
        instagram: instagram?.trim() || null,
        youtube: youtube?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        website: true,
        twitter: true,
        github: true,
        linkedin: true,
        instagram: true,
        youtube: true,
      },
    });

    return NextResponse.json({ success: true, profile: user });
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
