import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type {
  Submission,
  CreateSubmissionInput,
  PostType,
  SubmissionStatus,
  ImageAttribution,
} from '@/types';
import { randomBytes } from 'crypto';
import { deletePostImages } from './cloudinaryService';

function validateSubmissionAttributions(data: CreateSubmissionInput) {
  if (data.postType === 'SM_EXPO') {
    const images = data.images || [];
    const attributions = data.imageAttributions || [];
    if (images.length === 0) {
      throw new Error('SM Expo submissions require at least one image.');
    }
    if (attributions.length !== images.length) {
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

  if (data.postType === 'SM_NOW') {
    if (!data.thumbnailUrl) {
      throw new Error('SM Now submissions require a thumbnail.');
    }
    if (!data.thumbnailAttribution || !data.thumbnailAttribution.type) {
      throw new Error('SM Now submissions require a thumbnail credit.');
    }
    if (
      data.thumbnailAttribution.type === 'custom' &&
      !data.thumbnailAttribution.creditText?.trim()
    ) {
      throw new Error('Thumbnail custom credit text is required.');
    }
  }
}

const toJsonValue = (value: unknown) =>
  value as unknown as Prisma.InputJsonValue;

function toBaseSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function mapSubmission(record: any): Submission {
  return {
    ...record,
    imageAttributions:
      (record.imageAttributions as ImageAttribution[] | null) ?? undefined,
    thumbnailAttribution:
      (record.thumbnailAttribution as ImageAttribution | null) ?? undefined,
  };
}

/**
 * Create a new submission
 */
export async function createSubmission(
  authorId: string,
  data: CreateSubmissionInput
): Promise<Submission> {
  const approvalToken = randomBytes(32).toString('hex');
  validateSubmissionAttributions(data);

  const submission = await prisma.submission.create({
    data: {
      postType: data.postType,
      title: data.title,
      content: data.content,
      thumbnailUrl: data.thumbnailUrl,
      images: data.images || [], // For SM Expo: array of image URLs
      imageAttributions: data.imageAttributions
        ? toJsonValue(data.imageAttributions)
        : undefined,
      thumbnailAttribution: data.thumbnailAttribution
        ? toJsonValue(data.thumbnailAttribution)
        : undefined,
      projectLinks: data.projectLinks || [],
      sources: data.sources,
      tags: data.tags || [],
      authorId,
      approvalToken,
      status: 'PENDING',
    },
  });

  // Add submission ID to user's pendingPostIds
  await prisma.user.update({
    where: { id: authorId },
    data: {
      pendingPostIds: {
        push: submission.id,
      },
    },
  });

  return mapSubmission(submission);
}

/**
 * Get submission by ID
 */
export async function getSubmissionById(
  submissionId: string
): Promise<Submission | null> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  return submission ? mapSubmission(submission) : null;
}

/**
 * Get submission by approval token
 */
export async function getSubmissionByToken(
  token: string
): Promise<Submission | null> {
  const submission = await prisma.submission.findUnique({
    where: { approvalToken: token },
  });

  return submission ? mapSubmission(submission) : null;
}

/**
 * Get all submissions for a user
 */
export async function getUserSubmissions(
  authorId: string,
  status?: SubmissionStatus
): Promise<Submission[]> {
  const where: any = { authorId };
  if (status) {
    where.status = status;
  }

  const submissions = await prisma.submission.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return submissions.map(mapSubmission);
}

/**
 * Get all pending submissions (for moderators)
 */
export async function getAllPendingSubmissions(): Promise<Submission[]> {
  const submissions = await prisma.submission.findMany({
    where: { status: 'PENDING' },
    orderBy: { submittedAt: 'desc' },
  });

  return submissions.map(mapSubmission);
}

/**
 * Approve a submission and create a public post
 */
export async function approveSubmission(
  submissionId: string,
  reviewerId: string
): Promise<{ submission: Submission; postId: string }> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (submission.status !== 'PENDING') {
    throw new Error('Submission is not pending');
  }

  const user = await prisma.user.findUnique({
    where: { id: submission.authorId },
    select: { pendingPostIds: true },
  });

  const nextPendingPostIds =
    user?.pendingPostIds.filter((id) => id !== submissionId) ?? [];

  const baseSlug =
    toBaseSlug(submission.title) || `post-${submission.id.slice(-8)}`;

  const { updatedSubmission, post } = await prisma.$transaction(async (tx) => {
    const publishedAt = new Date();

    let nextSlug = baseSlug;
    let suffix = 2;

    let post;
    while (true) {
      try {
        // Create the public post with all submission data.
        post = await tx.post.create({
          data: {
            title: submission.title,
            content: submission.content,
            published: true,
            authorId: submission.authorId,
            coverImage:
              submission.thumbnailUrl || 'https://via.placeholder.com/800x400',
            slug: nextSlug,
            postType: submission.postType,
            projectLinks: submission.projectLinks || [],
            sources: submission.sources,
            publishedAt,
          },
        });
        break;
      } catch (error) {
        const isUniqueError =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002';
        const metaTarget = isUniqueError ? error.meta?.target : null;
        const slugConflict = Array.isArray(metaTarget)
          ? metaTarget.includes('slug')
          : typeof metaTarget === 'string' && metaTarget.includes('slug');

        if (isUniqueError && slugConflict) {
          nextSlug = `${baseSlug}-${suffix}`;
          suffix += 1;
          continue;
        }

        throw error;
      }
    }

    // Create the public post with all submission data
    const updatedSubmission = await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        reviewedBy: reviewerId,
        reviewedAt: publishedAt,
        publishedAt,
      },
    });

    // Update user's post arrays
    await tx.user.update({
      where: { id: submission.authorId },
      data: {
        postIds: {
          push: post.id,
        },
        pendingPostIds: {
          set: nextPendingPostIds,
        },
      },
    });

    return { updatedSubmission, post };
  });

  return {
    submission: mapSubmission(updatedSubmission),
    postId: post.id,
  };
}

/**
 * Reject a submission with a reason
 */
export async function rejectSubmission(
  submissionId: string,
  reviewerId: string,
  rejectionReason: string,
  canMoveToDraft: boolean = true
): Promise<Submission> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (submission.status !== 'PENDING') {
    throw new Error('Submission is not pending');
  }

  const user = await prisma.user.findUnique({
    where: { id: submission.authorId },
    select: { pendingPostIds: true },
  });

  const nextPendingPostIds =
    user?.pendingPostIds.filter((id) => id !== submissionId) ?? [];

  const updatedSubmission = await prisma.$transaction(async (tx) => {
    // Update submission status
    const updatedSubmission = await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        rejectionReason,
        canMoveToDraft,
        reviewedAt: new Date(),
      },
    });

    // Remove from user's pendingPostIds
    await tx.user.update({
      where: { id: submission.authorId },
      data: {
        pendingPostIds: {
          set: nextPendingPostIds,
        },
      },
    });

    return updatedSubmission;
  });

  return mapSubmission(updatedSubmission);
}

/**
 * Delete a submission
 * If approved, also deletes the associated post
 */
export async function deleteSubmission(submissionId: string): Promise<void> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  // If submission was approved, we need to delete the associated post
  if (submission.status === 'APPROVED') {
    const baseSlug = toBaseSlug(submission.title);

    let post = submission.publishedAt
      ? await prisma.post.findFirst({
          where: {
            authorId: submission.authorId,
            title: submission.title,
            publishedAt: submission.publishedAt,
          },
        })
      : null;

    if (!post) {
      const slugOrTitleFilters: Prisma.PostWhereInput[] = [
        { title: submission.title },
      ];

      if (baseSlug) {
        slugOrTitleFilters.push({ slug: baseSlug });
        slugOrTitleFilters.push({ slug: { startsWith: `${baseSlug}-` } });
      }

      post = await prisma.post.findFirst({
        where: {
          authorId: submission.authorId,
          OR: slugOrTitleFilters,
        },
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      });
    }

    if (post) {
      // Delete all comments on the post first
      await prisma.comment.deleteMany({
        where: { postId: post.id },
      });

      // Delete images from Cloudinary
      await deletePostImages(post.coverImage);

      // Delete the post
      await prisma.post.delete({
        where: { id: post.id },
      });

      // Remove from user's postIds
      await prisma.user.update({
        where: { id: submission.authorId },
        data: {
          postIds: {
            set: (
              await prisma.user.findUnique({
                where: { id: submission.authorId },
                select: { postIds: true },
              })
            )?.postIds.filter((id) => id !== post.id),
          },
        },
      });
    }
  }

  // Delete submission comments in correct order (replies first, then parents)
  // First, delete all replies (comments with a parentId)
  await prisma.submissionComment.deleteMany({
    where: {
      submissionId: submissionId,
      parentId: { not: null },
    },
  });

  // Then delete all parent comments (comments without a parentId)
  await prisma.submissionComment.deleteMany({
    where: {
      submissionId: submissionId,
    },
  });

  // Delete submission images from Cloudinary (if not already deleted with the post)
  // This handles cases where submission was pending/rejected
  if (submission.status !== 'APPROVED') {
    await deletePostImages(submission.thumbnailUrl, submission.images);
  }

  // Delete the submission
  await prisma.submission.delete({
    where: { id: submissionId },
  });
}

/**
 * Move a rejected submission back to drafts
 */
export async function moveToDraft(submissionId: string): Promise<string> {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
  });

  if (!submission) {
    throw new Error('Submission not found');
  }

  if (submission.status !== 'REJECTED') {
    throw new Error('Only rejected submissions can be moved to drafts');
  }

  // Create a draft from the submission
  const draft = await prisma.draft.create({
    data: {
      postType: submission.postType,
      title: submission.title,
      content: submission.content,
      thumbnailFile: submission.thumbnailUrl,
      images: submission.images || [],
      projectLinks: submission.projectLinks || [],
      sources: submission.sources,
      tags: submission.tags || [],
      authorId: submission.authorId,
      draftName: `${submission.title} (Revised)`,
    },
  });

  // Delete the rejected submission
  await prisma.submission.delete({
    where: { id: submissionId },
  });

  return draft.id;
}
