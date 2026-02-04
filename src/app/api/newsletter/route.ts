import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET - Fetch user's newsletter subscription
export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get subscription
    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({
      subscription: subscription || null,
    });
  } catch (error) {
    console.error('Error fetching newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST - Create or update newsletter subscription
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscribeExpo, subscribeNow, subscribePods, tags } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Upsert subscription
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { userId: user.id },
      update: {
        subscribeExpo: subscribeExpo ?? false,
        subscribeNow: subscribeNow ?? false,
        subscribePods: subscribePods ?? false,
        tags: tags ?? [],
        isActive: true,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        subscribeExpo: subscribeExpo ?? false,
        subscribeNow: subscribeNow ?? false,
        subscribePods: subscribePods ?? false,
        tags: tags ?? [],
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error('Error updating newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from newsletter
export async function DELETE() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete subscription (or just set inactive)
    await prisma.newsletterSubscription.update({
      where: { userId: user.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
