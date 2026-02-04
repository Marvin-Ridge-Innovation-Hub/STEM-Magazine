import { prisma } from '@/lib/prisma';
import type { UserProfile, DashboardData } from '@/types';
import { getUserDrafts } from './draftService';
import { getUserSubmissions } from './submissionService';

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(
  clerkId: string,
  email: string,
  name: string,
  imageUrl?: string
): Promise<UserProfile> {
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { clerkId },
  });

  // Create user if doesn't exist
  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
        image: imageUrl,
        postIds: [],
        draftIds: [],
        pendingPostIds: [],
      },
    });
  }

  return user as unknown as UserProfile;
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(
  clerkId: string
): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  return user as unknown as UserProfile | null;
}

/**
 * Get user by database ID
 */
export async function getUserById(userId: string): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  return user as unknown as UserProfile | null;
}

/**
 * Get user statistics
 */
export async function getUserStats(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      postIds: true,
      draftIds: true,
      pendingPostIds: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const submissions = await getUserSubmissions(userId);

  return {
    totalDrafts: user.draftIds?.length || 0,
    totalSubmissions: submissions.length,
    pendingCount: submissions.filter((s) => s.status === 'PENDING').length,
    approvedCount: submissions.filter((s) => s.status === 'APPROVED').length,
    rejectedCount: submissions.filter((s) => s.status === 'REJECTED').length,
  };
}

/**
 * Get complete dashboard data for a user
 */
export async function getUserDashboardData(
  userId: string
): Promise<DashboardData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const drafts = await getUserDrafts(userId);
  const submissions = await getUserSubmissions(userId);

  const pendingSubmissions = submissions.filter((s) => s.status === 'PENDING');
  const approvedSubmissions = submissions.filter(
    (s) => s.status === 'APPROVED'
  );
  const rejectedSubmissions = submissions.filter(
    (s) => s.status === 'REJECTED'
  );

  const stats = {
    totalDrafts: drafts.length,
    totalSubmissions: submissions.length,
    pendingCount: pendingSubmissions.length,
    approvedCount: approvedSubmissions.length,
    rejectedCount: rejectedSubmissions.length,
  };

  return {
    user: user as unknown as UserProfile,
    drafts,
    pendingSubmissions,
    approvedSubmissions,
    rejectedSubmissions,
    stats,
  };
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: { name?: string; imageUrl?: string; bio?: string }
): Promise<UserProfile> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      image: data.imageUrl,
      bio: data.bio,
    },
  });

  return user as unknown as UserProfile;
}
