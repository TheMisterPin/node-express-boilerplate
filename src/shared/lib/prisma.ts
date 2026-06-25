import { env } from '@/config/env'
import { createAuditExtension } from '@/shared/lib/audit'
import { PrismaClient } from '@prisma/client'

const baseClient = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

export const prisma = baseClient.$extends(createAuditExtension(baseClient))

export async function disconnectPrisma(): Promise<void> {
  await baseClient.$disconnect()
}
