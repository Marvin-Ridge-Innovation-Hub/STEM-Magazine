'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import {
  createDraft,
  updateDraft,
  getDraftById,
  getUserDrafts,
  deleteDraft,
  convertDraftToSubmission,
} from '@/services/draftService';
import { sendSubmissionForReview } from '@/services/emailService';
import { getOrCreateUserProfile } from '@/services/userProfileService';
import { getSubmissionById } from '@/services/submissionService';
import type { CreateDraftInput, UpdateDraftInput } from '@/types';
import { randomBytes } from 'crypto';

/**
 * Save a new draft
 */
export async function saveDraft(data: CreateDraftInput) {
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

    const draft = await createDraft(userProfile.id, data);

    revalidatePath('/dashboard');
    revalidatePath('/create');

    return {
      success: true,
      draftId: draft.id,
      message: 'Draft saved successfully!',
    };
  } catch (error) {
    console.error('Error saving draft:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save draft',
    };
  }
}

/**
 * Update an existing draft
 */
export async function updateDraftAction(data: UpdateDraftInput) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    // Verify ownership
    const existingDraft = await getDraftById(data.id);
    if (!existingDraft) {
      return { success: false, error: 'Draft not found' };
    }

    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    if (existingDraft.authorId !== userProfile.id) {
      return { success: false, error: 'Unauthorized to update this draft' };
    }

    const draft = await updateDraft(data);

    revalidatePath('/dashboard');
    revalidatePath('/create');

    return {
      success: true,
      draftId: draft.id,
      message: 'Draft updated successfully!',
    };
  } catch (error) {
    console.error('Error updating draft:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update draft',
    };
  }
}

/**
 * Get draft by ID
 */
export async function getDraft(draftId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Unauthorized' };
    }

    const draft = await getDraftById(draftId);

    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    return { success: true, draft };
  } catch (error) {
    console.error('Error fetching draft:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch draft',
    };
  }
}

/**
 * Get all drafts for current user
 */
export async function getMyDrafts() {
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

    const drafts = await getUserDrafts(userProfile.id);

    return { success: true, drafts };
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch drafts',
    };
  }
}

/**
 * Delete a draft
 */
export async function deleteDraftAction(draftId: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    if (draft.authorId !== userProfile.id) {
      return { success: false, error: 'Unauthorized to delete this draft' };
    }

    await deleteDraft(draftId, userProfile.id);

    revalidatePath('/dashboard');

    return { success: true, message: 'Draft deleted successfully' };
  } catch (error) {
    console.error('Error deleting draft:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete draft',
    };
  }
}

/**
 * Submit a draft for review (converts draft to submission)
 */
export async function submitDraftForReview(draftId: string) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const draft = await getDraftById(draftId);
    if (!draft) {
      return { success: false, error: 'Draft not found' };
    }

    const userProfile = await getOrCreateUserProfile(
      userId,
      user.emailAddresses[0]?.emailAddress || '',
      user.fullName || user.username || 'Unknown User',
      user.imageUrl
    );

    if (draft.authorId !== userProfile.id) {
      return { success: false, error: 'Unauthorized to submit this draft' };
    }

    // Validate draft is complete
    if (!draft.postType || !draft.title || !draft.content) {
      return {
        success: false,
        error: 'Draft is incomplete. Please fill in all required fields.',
      };
    }

    // Generate approval token
    const approvalToken = randomBytes(32).toString('hex');

    // Convert draft to submission
    const result = await convertDraftToSubmission(draftId, approvalToken);

    // Get the submission for email
    const submission = await getSubmissionById(result.submissionId);
    if (!submission) {
      throw new Error('Failed to retrieve submission after creation');
    }

    // Send email notification to moderators
    await sendSubmissionForReview(
      submission,
      userProfile.name,
      userProfile.email
    );

    revalidatePath('/dashboard');
    revalidatePath('/create');

    return {
      success: true,
      submissionId: result.submissionId,
      message: 'Draft submitted for review!',
    };
  } catch (error) {
    console.error('Error submitting draft:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to submit draft',
    };
  }
}
