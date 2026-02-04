import prisma from '@/lib/prisma';

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailOnLike: boolean;
  emailOnComment: boolean;
  emailOnReply: boolean;
  emailOnApproval: boolean;
  emailOnRejection: boolean;
  emailEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DEFAULT_PREFERENCES: Omit<
  NotificationPreferences,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
> = {
  emailOnLike: true,
  emailOnComment: true,
  emailOnReply: true,
  emailOnApproval: true,
  emailOnRejection: true,
  emailEnabled: true,
};

/**
 * Get notification preferences for a user
 * Creates default preferences if none exist
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  let preferences = await prisma.notificationPreferences.findUnique({
    where: { userId },
  });

  if (!preferences) {
    // Create default preferences
    preferences = await prisma.notificationPreferences.create({
      data: {
        userId,
        ...DEFAULT_PREFERENCES,
      },
    });
  }

  return preferences;
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<
    Omit<NotificationPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  >
): Promise<NotificationPreferences> {
  // Ensure preferences exist first
  await getNotificationPreferences(userId);

  return await prisma.notificationPreferences.update({
    where: { userId },
    data: updates,
  });
}

/**
 * Check if a user should receive email notifications for a specific event
 */
export async function shouldNotifyUser(
  userId: string,
  notificationType: 'like' | 'comment' | 'reply' | 'approval' | 'rejection'
): Promise<boolean> {
  const preferences = await getNotificationPreferences(userId);

  // If master switch is off, no notifications
  if (!preferences.emailEnabled) {
    return false;
  }

  // Check specific notification type
  switch (notificationType) {
    case 'like':
      return preferences.emailOnLike;
    case 'comment':
      return preferences.emailOnComment;
    case 'reply':
      return preferences.emailOnReply;
    case 'approval':
      return preferences.emailOnApproval;
    case 'rejection':
      return preferences.emailOnRejection;
    default:
      return true;
  }
}
