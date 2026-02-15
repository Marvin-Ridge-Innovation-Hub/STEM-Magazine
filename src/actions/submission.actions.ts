'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  createSubmission,
  getSubmissionById,
  getSubmissionByToken,
  getUserSubmissions,
  approveSubmission,
  rejectSubmission,
  moveApprovedSubmissionToReview,
  deleteSubmission,
  moveToDraft,
} from '@/services/submissionService';
import {
  sendSubmissionForReview,
  sendApprovalNotification,
  sendRejectionNotification,
  notifyModeratorsForSubmission,
} from '@/services/emailService';
import { notifySubscribers } from '@/services/newsletterService';
import {
  getOrCreateUserProfile,
  getUserById,
} from '@/services/userProfileService';
import type { CreateSubmissionInput, SubmissionStatus } from '@/types';

const MODERATOR_NOTIFICATION_WARNING =
  'Submission saved, but moderator notification email failed. Our team has been alerted.';

/**
 * Submit a new post for review
 */
export async function submitPost(data: CreateSubmissionInput) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get or create user profile
    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    // Create submission
    const submission = await createSubmission(userProfile.id, data);

    let warning: string | undefined;
    try {
      // Send email notification to moderators
      await sendSubmissionForReview(
        submission,
        userProfile.name,
        userProfile.email
      );
    } catch (notificationError) {
      warning = MODERATOR_NOTIFICATION_WARNING;
      console.error(
        'Submission created but failed to send moderator notification:',
        {
          submissionId: submission.id,
          clerkUserId: userId,
          authorId: userProfile.id,
          error: notificationError,
        }
      );
    }

    revalidatePath('/dashboard');
    revalidatePath('/create');

    return {
      success: true,
      submissionId: submission.id,
      message: 'Your post has been submitted for review!',
      warning,
    };
  } catch (error) {
    console.error('Error submitting post:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit post',
    };
  }
}

/**
 * Retry moderator notification email for an existing submission (admin/mod only)
 */
export async function retrySubmissionModeratorNotificationAction(
  submissionId: string
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    const reviewerRole =
      typeof userProfile.role === 'string'
        ? userProfile.role.toUpperCase()
        : 'USER';

    if (reviewerRole !== 'ADMIN' && reviewerRole !== 'MODERATOR') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    await notifyModeratorsForSubmission(submissionId);

    return {
      success: true,
      message: `Moderator notification retried for "${submission.title}".`,
    };
  } catch (error) {
    console.error(
      'Error retrying moderator notification for submission:',
      submissionId,
      error
    );
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to retry moderator notification',
    };
  }
}

/**
 * Get submission by ID
 */
export async function getSubmission(submissionId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    return { success: true, submission };
  } catch (error) {
    console.error('Error fetching submission:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch submission',
    };
  }
}

/**
 * Get all submissions for current user
 */
export async function getMySubmissions(status?: SubmissionStatus) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    const submissions = await getUserSubmissions(userProfile.id, status);

    return { success: true, submissions };
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to fetch submissions',
    };
  }
}

/**
 * Approve a submission (moderator only)
 */
export async function approveSubmissionAction(submissionId: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin/moderator
    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    const reviewerRole =
      typeof userProfile.role === 'string'
        ? userProfile.role.toUpperCase()
        : 'USER';

    if (reviewerRole !== 'ADMIN' && reviewerRole !== 'MODERATOR') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    if (
      reviewerRole === 'MODERATOR' &&
      submission.authorId === userProfile.id
    ) {
      return {
        success: false,
        error: 'Moderators cannot review their own submissions.',
      };
    }

    // Approve submission
    const result = await approveSubmission(submissionId, userId);

    // Get author info for email by database ID
    const authorProfile = await getUserById(result.submission.authorId);

    if (!authorProfile) {
      console.warn('Author not found for submission:', submissionId);
    }

    // Send approval notification to author (respects user preferences)
    if (authorProfile) {
      void sendApprovalNotification(
        result.submission,
        authorProfile.name || 'User',
        authorProfile.email,
        authorProfile.id // Pass authorId to check email preferences
      ).catch((error) => {
        console.error('Error sending approval email:', error);
      });
    }

    // Notify newsletter subscribers about the new post (excludes the author)
    void notifySubscribers({
      postType: result.submission.postType,
      title: result.submission.title,
      excerpt: result.submission.content.substring(0, 200),
      postId: result.submission.id,
      authorName: authorProfile?.name || 'Anonymous',
      authorId: result.submission.authorId, // Exclude author from newsletter notification
      tags: result.submission.tags || [],
      thumbnailUrl: result.submission.thumbnailUrl || undefined,
    }).catch((error) => {
      console.error('Error notifying subscribers:', error);
    });

    revalidatePath('/dashboard');
    revalidatePath('/admin/submissions');
    revalidatePath('/posts');
    revalidatePath(`/posts/${submissionId}`);

    return {
      success: true,
      message: 'Submission approved and published!',
      postId: result.postId,
    };
  } catch (error) {
    console.error('Error approving submission:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to approve submission',
    };
  }
}

/**
 * Approve submission via one-click token (from email)
 */
export async function approveSubmissionByToken(token: string) {
  try {
    const submission = await getSubmissionByToken(token);

    if (!submission) {
      return { success: false, error: 'Invalid or expired approval link' };
    }

    if (submission.status !== 'PENDING') {
      return {
        success: false,
        error: 'This submission has already been reviewed',
      };
    }

    // Approve submission (using system/moderator ID)
    const result = await approveSubmission(submission.id, 'system');

    // Get author info for email by database ID
    const authorProfile = await getUserById(submission.authorId);

    // Send approval notification (respects user preferences)
    if (authorProfile) {
      await sendApprovalNotification(
        result.submission,
        authorProfile.name || 'User',
        authorProfile.email,
        authorProfile.id // Pass authorId to check email preferences
      );
    }

    revalidatePath('/posts');
    revalidatePath(`/posts/${submission.id}`);

    return {
      success: true,
      message: 'Submission approved successfully!',
      postId: result.postId,
    };
  } catch (error) {
    console.error('Error approving submission by token:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to approve submission',
    };
  }
}

/**
 * Reject a submission (moderator only)
 */
export async function rejectSubmissionAction(
  submissionId: string,
  rejectionReason: string,
  allowMoveToDraft: boolean = true
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin/moderator
    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    const reviewerRole =
      typeof userProfile.role === 'string'
        ? userProfile.role.toUpperCase()
        : 'USER';

    if (reviewerRole !== 'ADMIN' && reviewerRole !== 'MODERATOR') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    if (
      reviewerRole === 'MODERATOR' &&
      submission.authorId === userProfile.id
    ) {
      return {
        success: false,
        error: 'Moderators cannot review their own submissions.',
      };
    }

    // Reject submission with canMoveToDraft flag
    const rejectedSubmission = await rejectSubmission(
      submissionId,
      userId,
      rejectionReason,
      allowMoveToDraft
    );

    // Get author info for email by database ID
    const authorProfile = await getUserById(rejectedSubmission.authorId);

    // Send rejection notification to author (respects user preferences)
    if (authorProfile) {
      void sendRejectionNotification(
        rejectedSubmission,
        authorProfile.name || 'User',
        authorProfile.email,
        rejectionReason,
        authorProfile.id // Pass authorId to check email preferences
      ).catch((error) => {
        console.error('Error sending rejection email:', error);
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin/submissions');
    revalidatePath(`/posts/${submissionId}`);

    return {
      success: true,
      message: allowMoveToDraft
        ? 'Submission rejected - author can revise and resubmit'
        : 'Submission rejected',
    };
  } catch (error) {
    console.error('Error rejecting submission:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to reject submission',
    };
  }
}

/**
 * Move an approved submission back to pending review (moderator only)
 */
export async function moveApprovedSubmissionToReviewAction(
  submissionId: string
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Check if user is admin/moderator
    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    const reviewerRole =
      typeof userProfile.role === 'string'
        ? userProfile.role.toUpperCase()
        : 'USER';

    if (reviewerRole !== 'ADMIN' && reviewerRole !== 'MODERATOR') {
      return { success: false, error: 'Insufficient permissions' };
    }

    const submission = await getSubmissionById(submissionId);
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    if (
      reviewerRole === 'MODERATOR' &&
      submission.authorId === userProfile.id
    ) {
      return {
        success: false,
        error: 'Moderators cannot review their own submissions.',
      };
    }

    if (submission.status !== 'APPROVED') {
      return {
        success: false,
        error: 'Only approved submissions can be moved back to review.',
      };
    }

    await moveApprovedSubmissionToReview(submissionId);

    revalidatePath('/dashboard');
    revalidatePath('/admin');
    revalidatePath('/admin/submissions');
    revalidatePath('/posts');
    revalidatePath(`/posts/${submissionId}`);

    return {
      success: true,
      message: 'Submission moved back to pending review.',
    };
  } catch (error) {
    console.error('Error moving approved submission back to review:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to move submission back to review',
    };
  }
}

/**
 * Delete a submission
 */
export async function deleteSubmissionAction(submissionId: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    const reviewerRole =
      typeof userProfile.role === 'string'
        ? userProfile.role.toUpperCase()
        : 'USER';

    // Only allow author or admin to delete
    if (
      submission.authorId !== userProfile.id &&
      reviewerRole !== 'ADMIN' &&
      reviewerRole !== 'MODERATOR'
    ) {
      return {
        success: false,
        error: 'Unauthorized to delete this submission',
      };
    }

    await deleteSubmission(submissionId);

    revalidatePath('/dashboard');
    revalidatePath('/posts');
    revalidatePath(`/posts/${submissionId}`);

    return { success: true, message: 'Submission deleted successfully' };
  } catch (error) {
    console.error('Error deleting submission:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to delete submission',
    };
  }
}

/**
 * Move a rejected submission back to drafts
 */
export async function moveToDraftAction(submissionId: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    // Only allow author to move to draft
    if (submission.authorId !== userProfile.id) {
      return { success: false, error: 'Unauthorized to move this submission' };
    }

    // Only rejected submissions can be moved to drafts
    if (submission.status !== 'REJECTED') {
      return {
        success: false,
        error: 'Only rejected submissions can be moved to drafts',
      };
    }

    const draftId = await moveToDraft(submissionId);

    revalidatePath('/dashboard');
    revalidatePath('/create');
    revalidatePath(`/posts/${submissionId}`);

    return {
      success: true,
      message: 'Submission moved to drafts. You can now edit and resubmit it.',
      draftId,
    };
  } catch (error) {
    console.error('Error moving submission to draft:', error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to move submission to draft',
    };
  }
}
