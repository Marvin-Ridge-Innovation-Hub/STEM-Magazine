import { prisma } from '@/lib/prisma';
import type { Draft, CreateDraftInput, UpdateDraftInput } from '@/types';
import { deletePostImages } from './cloudinaryService';

function validateDraftAttributions(draft: Draft) {
  if (draft.postType === 'SM_EXPO') {
    if (!draft.images || draft.images.length === 0) {
      throw new Error('SM Expo submissions require at least one image.');
    }
    const attributions = (draft.imageAttributions as any[]) || [];
    if (attributions.length !== draft.images.length) {
      throw new Error('Each SM Expo image requires a credit selection.');
    }
    attributions.forEach((attr, index) => {
      if (!attr || !attr.type) {
        throw new Error(`Image ${index + 1} is missing a credit.`);
      }
      if (attr.type === 'custom' && !attr.creditText?.trim()) {
        throw new Error(
          `Image ${index + 1} requires custom credit text when not original.`
        );
      }
    });
  }

  if (draft.postType === 'SM_NOW') {
    if (!draft.thumbnailFile) {
      throw new Error('SM Now submissions require a thumbnail.');
    }
    const attribution = draft.thumbnailAttribution as any;
    if (!attribution || !attribution.type) {
      throw new Error('SM Now submissions require a thumbnail credit.');
    }
    if (attribution.type === 'custom' && !attribution.creditText?.trim()) {
      throw new Error('Thumbnail custom credit text is required.');
    }
  }
}

/**
 * Generate a draft name based on current date/time
 */
function generateDraftName(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return `Draft - ${now.toLocaleString('en-US', options)}`;
}

/**
 * Create a new draft
 */
export async function createDraft(
  authorId: string,
  data: CreateDraftInput
): Promise<Draft> {
  const draftName = generateDraftName();

  const draft = await prisma.draft.create({
    data: {
      postType: data.postType,
      title: data.title,
      content: data.content,
      thumbnailFile: data.thumbnailFile,
      images: data.images || [], // For SM Expo: array of image URLs
      imageAttributions: data.imageAttributions ?? undefined,
      thumbnailAttribution: data.thumbnailAttribution ?? undefined,
      projectLinks: data.projectLinks || [],
      sources: data.sources,
      tags: data.tags || [],
      draftName,
      authorId,
    },
  });

  // Add draft ID to user's draftIds
  await prisma.user.update({
    where: { id: authorId },
    data: {
      draftIds: {
        push: draft.id,
      },
    },
  });

  return draft as Draft;
}

/**
 * Update an existing draft
 */
export async function updateDraft(data: UpdateDraftInput): Promise<Draft> {
  const { id, ...updateData } = data;

  const draft = await prisma.draft.update({
    where: { id },
    data: {
      ...updateData,
      updatedAt: new Date(),
    },
  });

  return draft as Draft;
}

/**
 * Get draft by ID
 */
export async function getDraftById(draftId: string): Promise<Draft | null> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
  });

  return draft as Draft | null;
}

/**
 * Get all drafts for a user
 */
export async function getUserDrafts(authorId: string): Promise<Draft[]> {
  const drafts = await prisma.draft.findMany({
    where: { authorId },
    orderBy: { updatedAt: 'desc' },
  });

  return drafts as Draft[];
}

/**
 * Delete a draft
 */
export async function deleteDraft(
  draftId: string,
  authorId: string
): Promise<void> {
  // First, get the draft to access its images
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
  });

  if (draft) {
    // Delete images from Cloudinary
    await deletePostImages(draft.thumbnailFile, draft.images);
  }

  await prisma.draft.delete({
    where: { id: draftId },
  });

  // Remove draft ID from user's draftIds
  const user = await prisma.user.findUnique({
    where: { id: authorId },
    select: { draftIds: true },
  });

  await prisma.user.update({
    where: { id: authorId },
    data: {
      draftIds: {
        set: user?.draftIds.filter((id) => id !== draftId),
      },
    },
  });
}

/**
 * Convert a draft to a submission
 */
export async function convertDraftToSubmission(
  draftId: string,
  approvalToken: string
): Promise<{ submissionId: string }> {
  const draft = await prisma.draft.findUnique({
    where: { id: draftId },
  });

  if (!draft || !draft.postType || !draft.title || !draft.content) {
    throw new Error('Draft is incomplete or not found');
  }
  validateDraftAttributions(draft as Draft);

  // Create submission from draft
  const submission = await prisma.submission.create({
    data: {
      postType: draft.postType,
      title: draft.title,
      content: draft.content,
      thumbnailUrl: draft.thumbnailFile, // Assuming uploaded
      images: draft.images || [],
      imageAttributions: draft.imageAttributions ?? undefined,
      thumbnailAttribution: draft.thumbnailAttribution ?? undefined,
      projectLinks: draft.projectLinks,
      sources: draft.sources,
      authorId: draft.authorId,
      approvalToken,
      status: 'PENDING',
    },
  });

  // Update user's arrays
  await prisma.user.update({
    where: { id: draft.authorId },
    data: {
      pendingPostIds: {
        push: submission.id,
      },
      draftIds: {
        set: (
          await prisma.user.findUnique({
            where: { id: draft.authorId },
            select: { draftIds: true },
          })
        )?.draftIds.filter((id) => id !== draftId),
      },
    },
  });

  // Delete the draft
  await prisma.draft.delete({
    where: { id: draftId },
  });

  return { submissionId: submission.id };
}
