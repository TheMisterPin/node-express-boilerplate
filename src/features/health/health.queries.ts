import { prisma } from '@/shared/lib/prisma'

// WHY: Raw query is the lightest possible DB connectivity check; isolated here per architecture rules.
export async function pingDatabase(): Promise<boolean> {
  await prisma.$queryRaw`SELECT 1`
  return true
}
