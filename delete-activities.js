import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe('DELETE FROM "ActivityLog"');
  console.log('Deleted all ActivityLog rows');
}

main().catch(console.error).finally(() => prisma.$disconnect());
