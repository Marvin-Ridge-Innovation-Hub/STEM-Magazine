import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const response = NextResponse.json({
      subscription: subscription || null,
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching newsletter subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    );
  }
}

// POST - Create or update newsletter subscription (unified with notification preferences)
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      subscribeExpo,
      subscribeNow,
      subscribePods,
      tags,
      // Unified notification preferences
      emailOnApproval,
      emailOnRejection,
      emailEnabled,
      // Activity digest preferences
      digestEnabled,
      emailOnLike,
      emailOnComment,
      emailOnReply,
    } = body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update data - only include fields that were provided
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Newsletter preferences
    if (subscribeExpo !== undefined) updateData.subscribeExpo = subscribeExpo;
    if (subscribeNow !== undefined) updateData.subscribeNow = subscribeNow;
    if (subscribePods !== undefined) updateData.subscribePods = subscribePods;
    if (tags !== undefined) updateData.tags = tags;

    // If any newsletter subscription is being set, activate subscription
    if (subscribeExpo || subscribeNow || subscribePods) {
      updateData.isActive = true;
    }

    // Notification preferences
    if (emailOnApproval !== undefined)
      updateData.emailOnApproval = emailOnApproval;
    if (emailOnRejection !== undefined)
      updateData.emailOnRejection = emailOnRejection;
    if (emailEnabled !== undefined) updateData.emailEnabled = emailEnabled;

    // Activity digest preferences
    if (digestEnabled !== undefined) updateData.digestEnabled = digestEnabled;
    if (emailOnLike !== undefined) updateData.emailOnLike = emailOnLike;
    if (emailOnComment !== undefined)
      updateData.emailOnComment = emailOnComment;
    if (emailOnReply !== undefined) updateData.emailOnReply = emailOnReply;

    // Upsert subscription with unified preferences
    const subscription = await prisma.newsletterSubscription.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        subscribeExpo: subscribeExpo ?? false,
        subscribeNow: subscribeNow ?? false,
        subscribePods: subscribePods ?? false,
        tags: tags ?? [],
        isActive: subscribeExpo || subscribeNow || subscribePods ? true : false,
        emailOnApproval: emailOnApproval ?? true,
        emailOnRejection: emailOnRejection ?? true,
        emailEnabled: emailEnabled ?? true,
        // Activity digest defaults
        digestEnabled: digestEnabled ?? true,
        emailOnLike: emailOnLike ?? true,
        emailOnComment: emailOnComment ?? true,
        emailOnReply: emailOnReply ?? true,
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
