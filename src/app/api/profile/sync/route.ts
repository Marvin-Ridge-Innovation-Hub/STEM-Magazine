import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    const name = user.fullName || user.firstName || user.username || 'User';
    const image = user.imageUrl;

    const updated = await prisma.user.upsert({
      where: { clerkId: userId },
      update: {
        email,
        name,
        image,
      },
      create: {
        clerkId: userId,
        email,
        name,
        image,
      },
    });

    return NextResponse.json({ success: true, userId: updated.id });
  } catch (error) {
    console.error('Error syncing profile:', error);
    return NextResponse.json(
      { error: 'Failed to sync profile' },
      { status: 500 }
    );
  }
}
