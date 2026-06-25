import { unauthorized } from '@/shared/constants/errors'
import { prisma } from '@/shared/lib/prisma'
import { Prisma } from '@prisma/client'

const userWithRoleSelect = {
  id: true,
  email: true,
  name: true,
  passwordHash: true,
  organizationId: true,
  failedLoginAttempts: true,
  lockedUntil: true,
  roleId: true,
  role: { select: { name: true } },
} as const

export type AuthUserRecord = Prisma.UserGetPayload<{ select: typeof userWithRoleSelect }>

export async function findUserByEmail(email: string): Promise<AuthUserRecord | null> {
  return prisma.user.findFirst({
    where: { email, deletedAt: null },
    select: userWithRoleSelect,
  })
}

export async function findUserById(id: string): Promise<AuthUserRecord | null> {
  return prisma.user.findFirst({
    where: { id, deletedAt: null },
    select: userWithRoleSelect,
  })
}

export async function createSession(data: {
  userId: string
  refreshToken: string
  accessTokenJti: string
  expiresAt: Date
}) {
  return prisma.session.create({
    data: {
      userId: data.userId,
      refreshToken: data.refreshToken,
      accessTokenJti: data.accessTokenJti,
      expiresAt: data.expiresAt,
    },
    select: { id: true, refreshToken: true, accessTokenJti: true, expiresAt: true },
  })
}

export async function findSessionByToken(refreshToken: string) {
  return prisma.session.findFirst({
    where: {
      refreshToken,
      deletedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      userId: true,
      refreshToken: true,
      accessTokenJti: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          organizationId: true,
          roleId: true,
          role: { select: { name: true } },
        },
      },
    },
  })
}

export async function findActiveSessionByJti(jti: string) {
  return prisma.session.findFirst({
    where: {
      accessTokenJti: jti,
      deletedAt: null,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: { id: true },
  })
}

export async function revokeSession(sessionId: string): Promise<void> {
  await prisma.session.update({
    where: { id: sessionId, deletedAt: null },
    data: { revokedAt: new Date(), version: { increment: 1 } },
  })
}

export async function revokeSessionByJti(jti: string): Promise<void> {
  await prisma.session.updateMany({
    where: { accessTokenJti: jti, deletedAt: null, revokedAt: null },
    data: { revokedAt: new Date(), version: { increment: 1 } },
  })
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, deletedAt: null, revokedAt: null },
    data: { revokedAt: new Date(), version: { increment: 1 } },
  })
}

export async function incrementFailedAttempts(userId: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { failedLoginAttempts: true },
  })
  if (!user) return

  const attempts = user.failedLoginAttempts + 1
  const data: Prisma.UserUpdateInput = {
    failedLoginAttempts: attempts,
    version: { increment: 1 },
  }

  if (attempts >= 5) {
    data.lockedUntil = new Date(Date.now() + 15 * 60 * 1000)
  }

  await prisma.user.update({
    where: { id: userId, deletedAt: null },
    data,
  })
}

export async function resetFailedAttempts(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId, deletedAt: null },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      version: { increment: 1 },
    },
  })
}

export function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') {
      throw unauthorized('Session not found')
    }
  }
  throw error
}
