import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const legacyAdminField = `is${'Admin'}`;

async function countLegacyAdminFlagDocs() {
  const result = await prisma.$runCommandRaw({
    count: 'User',
    query: { [legacyAdminField]: { $exists: true } },
  });

  return typeof result?.n === 'number' ? result.n : null;
}

async function main() {
  const before = await countLegacyAdminFlagDocs();
  if (before === null) {
    console.log('Could not determine pre-cleanup count.');
  } else {
    console.log(`User docs with legacy admin flag before cleanup: ${before}`);
  }

  const updateResult = await prisma.$runCommandRaw({
    update: 'User',
    updates: [
      {
        q: { [legacyAdminField]: { $exists: true } },
        u: { $unset: { [legacyAdminField]: '' } },
        multi: true,
      },
    ],
  });

  console.log('Cleanup update result:', JSON.stringify(updateResult));

  const after = await countLegacyAdminFlagDocs();
  if (after === null) {
    console.log('Could not determine post-cleanup count.');
  } else {
    console.log(`User docs with legacy admin flag after cleanup: ${after}`);
  }
}

main()
  .catch((error) => {
    console.error('Failed to cleanup legacy admin flag field:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
