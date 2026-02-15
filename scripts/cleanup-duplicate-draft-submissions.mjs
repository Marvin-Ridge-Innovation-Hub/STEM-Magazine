import { PrismaClient } from '@prisma/client';

const prodMongoUri = process.env.MONGODB_URI_PROD;
if (!prodMongoUri) {
  throw new Error(
    'Missing MONGODB_URI_PROD. Set it before running this cleanup script.'
  );
}

// Force this script to target production DB explicitly.
process.env.MONGODB_URI = prodMongoUri;
const prisma = new PrismaClient();
const DEFAULT_WINDOW_MINUTES = 120;
const EARLY_TOLERANCE_MINUTES = 1;

function parseArgs(argv) {
  const args = {
    apply: false,
    minutes: DEFAULT_WINDOW_MINUTES,
    limit: null,
    authorId: null,
  };

  for (const arg of argv) {
    if (arg === '--apply') {
      args.apply = true;
      continue;
    }

    if (arg === '--dry-run') {
      args.apply = false;
      continue;
    }

    if (arg.startsWith('--minutes=')) {
      const value = Number(arg.split('=')[1]);
      if (!Number.isFinite(value) || value <= 0) {
        throw new Error('Invalid --minutes value. Use a positive number.');
      }
      args.minutes = value;
      continue;
    }

    if (arg.startsWith('--limit=')) {
      const value = Number(arg.split('=')[1]);
      if (!Number.isInteger(value) || value <= 0) {
        throw new Error('Invalid --limit value. Use a positive integer.');
      }
      args.limit = value;
      continue;
    }

    if (arg.startsWith('--author=')) {
      const value = arg.split('=')[1]?.trim();
      if (!value) {
        throw new Error('Invalid --author value.');
      }
      args.authorId = value;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function normalizeText(value) {
  return (value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function buildMatchKey(item) {
  if (!item.postType || !item.title || !item.content) {
    return null;
  }

  const normalizedTitle = normalizeText(item.title);
  const normalizedContent = normalizeText(item.content);
  if (!normalizedTitle || !normalizedContent) {
    return null;
  }

  return [
    item.authorId,
    item.postType,
    normalizedTitle,
    normalizedContent,
  ].join('|');
}

function formatDate(date) {
  return date instanceof Date ? date.toISOString() : 'n/a';
}

function computeDeltaMinutes(fromDate, toDate) {
  return (toDate.getTime() - fromDate.getTime()) / 60000;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  console.log(
    `Mode: ${options.apply ? 'APPLY' : 'DRY-RUN'} | window=${options.minutes}m`
  );
  if (options.limit) {
    console.log(`Limit: ${options.limit} matches`);
  }
  if (options.authorId) {
    console.log(`Filter authorId: ${options.authorId}`);
  }

  const draftWhere = options.authorId ? { authorId: options.authorId } : {};
  const submissionWhere = {
    status: 'PENDING',
    ...(options.authorId ? { authorId: options.authorId } : {}),
  };

  const [drafts, submissions] = await Promise.all([
    prisma.draft.findMany({
      where: draftWhere,
      select: {
        id: true,
        authorId: true,
        postType: true,
        title: true,
        content: true,
        draftName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.submission.findMany({
      where: submissionWhere,
      select: {
        id: true,
        authorId: true,
        postType: true,
        title: true,
        content: true,
        createdAt: true,
        submittedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const submissionsByKey = new Map();
  for (const submission of submissions) {
    const key = buildMatchKey(submission);
    if (!key) continue;
    if (!submissionsByKey.has(key)) {
      submissionsByKey.set(key, []);
    }
    submissionsByKey.get(key).push(submission);
  }

  const candidates = [];
  for (const draft of drafts) {
    const key = buildMatchKey(draft);
    if (!key) continue;

    const sameContentSubmissions = submissionsByKey.get(key) || [];
    for (const submission of sameContentSubmissions) {
      const deltaMinutes = computeDeltaMinutes(draft.updatedAt, submission.createdAt);
      if (
        deltaMinutes >= -EARLY_TOLERANCE_MINUTES &&
        deltaMinutes <= options.minutes
      ) {
        candidates.push({
          draftId: draft.id,
          draftName: draft.draftName,
          draftUpdatedAt: draft.updatedAt,
          submissionId: submission.id,
          submissionCreatedAt: submission.createdAt,
          authorId: draft.authorId,
          title: draft.title,
          postType: draft.postType,
          deltaMinutes,
        });
      }
    }
  }

  candidates.sort((a, b) => Math.abs(a.deltaMinutes) - Math.abs(b.deltaMinutes));

  const usedDraftIds = new Set();
  const usedSubmissionIds = new Set();
  const matches = [];

  for (const candidate of candidates) {
    if (usedDraftIds.has(candidate.draftId)) continue;
    if (usedSubmissionIds.has(candidate.submissionId)) continue;

    usedDraftIds.add(candidate.draftId);
    usedSubmissionIds.add(candidate.submissionId);
    matches.push(candidate);
  }

  const finalMatches =
    options.limit && options.limit > 0 ? matches.slice(0, options.limit) : matches;

  console.log(`Drafts scanned: ${drafts.length}`);
  console.log(`Pending submissions scanned: ${submissions.length}`);
  console.log(`Matched duplicate pairs: ${finalMatches.length}`);

  if (finalMatches.length === 0) {
    console.log('No cleanup candidates found.');
    return;
  }

  for (const match of finalMatches) {
    console.log(
      [
        `author=${match.authorId}`,
        `postType=${match.postType}`,
        `draftId=${match.draftId}`,
        `submissionId=${match.submissionId}`,
        `deltaMinutes=${match.deltaMinutes.toFixed(2)}`,
        `draftUpdatedAt=${formatDate(match.draftUpdatedAt)}`,
        `submissionCreatedAt=${formatDate(match.submissionCreatedAt)}`,
        `title=${JSON.stringify(match.title || '')}`,
      ].join(' | ')
    );
  }

  if (!options.apply) {
    console.log('Dry-run only. Re-run with --apply to delete matched drafts.');
    return;
  }

  let deletedCount = 0;
  let skippedCount = 0;
  let failedCount = 0;

  for (const match of finalMatches) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const existingDraft = await tx.draft.findUnique({
          where: { id: match.draftId },
          select: { id: true, authorId: true },
        });

        if (!existingDraft) {
          return { deleted: false, reason: 'missing-draft' };
        }

        await tx.draft.delete({
          where: { id: existingDraft.id },
        });

        const user = await tx.user.findUnique({
          where: { id: existingDraft.authorId },
          select: { draftIds: true },
        });

        if (user) {
          await tx.user.update({
            where: { id: existingDraft.authorId },
            data: {
              draftIds: {
                set: (user.draftIds || []).filter((id) => id !== existingDraft.id),
              },
            },
          });
        }

        return { deleted: true };
      });

      if (result.deleted) {
        deletedCount += 1;
        console.log(`Deleted draft ${match.draftId}`);
      } else {
        skippedCount += 1;
        console.log(`Skipped draft ${match.draftId} (${result.reason})`);
      }
    } catch (error) {
      failedCount += 1;
      console.error(`Failed to delete draft ${match.draftId}:`, error);
    }
  }

  console.log(
    `Cleanup complete. deleted=${deletedCount}, skipped=${skippedCount}, failed=${failedCount}`
  );
}

main()
  .catch((error) => {
    console.error('Failed to clean duplicate draft/submission pairs:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
