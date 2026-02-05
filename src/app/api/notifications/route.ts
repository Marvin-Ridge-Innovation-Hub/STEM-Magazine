import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/services/notificationService';
import { getOrCreateUserProfile } from '@/services/userProfileService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch user's notification preferences
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    const user = await currentUser();

    if (!clerkId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get or create user profile
    const userProfile = await getOrCreateUserProfile(
      clerkId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    const preferences = await getNotificationPreferences(userProfile.id);

    const response = NextResponse.json({
      success: true,
      preferences: {
        emailOnLike: preferences.emailOnLike,
        emailOnComment: preferences.emailOnComment,
        emailOnReply: preferences.emailOnReply,
        emailOnApproval: preferences.emailOnApproval,
        emailOnRejection: preferences.emailOnRejection,

        emailEnabled: preferences.emailEnabled,
      },
    });

    response.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// PUT - Update user's notification preferences
export async function PUT(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    const user = await currentUser();

    if (!clerkId || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Get or create user profile
    const userProfile = await getOrCreateUserProfile(
      clerkId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    // Validate and extract only allowed fields
    const updates: Record<string, boolean> = {};
    const allowedFields = [
      'emailOnLike',
      'emailOnComment',
      'emailOnReply',
      'emailOnApproval',
      'emailOnRejection',
      'emailEnabled',
    ];

    for (const field of allowedFields) {
      if (typeof body[field] === 'boolean') {
        updates[field] = body[field];
      }
    }

    const preferences = await updateNotificationPreferences(
      userProfile.id,
      updates
    );

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: {
        emailOnLike: preferences.emailOnLike,
        emailOnComment: preferences.emailOnComment,
        emailOnReply: preferences.emailOnReply,
        emailOnApproval: preferences.emailOnApproval,
        emailOnRejection: preferences.emailOnRejection,
        emailEnabled: preferences.emailEnabled,
      },
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
}
