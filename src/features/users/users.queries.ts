import { conflict, notFound } from '@/shared/constants/errors'
import { prisma } from '@/shared/lib/prisma'
import { paginate, asPaginateDelegate } from '@/shared/lib/paginate'
import type { PaginatedResult } from '@/shared/types/common'
import type { CreateUserDto, UpdateUserDto, UserDto } from './users.types'
import { Prisma } from '@prisma/client'

const userSelect = {
  id: true,
  email: true,
  name: true,
  roleId: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
  role: { select: { name: true } },
} as const

type UserRecord = Prisma.UserGetPayload<{ select: typeof userSelect }>

const userWithPasswordSelect = {
  ...userSelect,
  passwordHash: true,
} as const

type UserWithPasswordRecord = Prisma.UserGetPayload<{ select: typeof userWithPasswordSelect }>

function toDto(record: UserRecord): UserDto {
  return {
    id: record.id,
    email: record.email,
    name: record.name,
    roleId: record.roleId,
    roleName: record.role.name,
    organizationId: record.organizationId,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  }
}

export async function listUsers(
  organizationId: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<UserDto>> {
  const result = await paginate<UserRecord>(
    asPaginateDelegate(prisma.user),
    {
      where: { organizationId, deletedAt: null },
      orderBy: { email: 'asc' },
      select: userSelect,
    },
    page,
    limit,
  )
  return { data: result.data.map(toDto), meta: result.meta }
}

export async function findUserById(
  id: string,
  organizationId: string,
): Promise<UserDto | null> {
  const user = await prisma.user.findFirst({
    where: { id, organizationId, deletedAt: null },
    select: userSelect,
  })
  return user ? toDto(user) : null
}

export async function findUserByEmail(email: string, organizationId: string) {
  return prisma.user.findFirst({
    where: { email, organizationId, deletedAt: null },
    select: userWithPasswordSelect,
  })
}

export async function findUserWithPassword(id: string, organizationId: string) {
  return prisma.user.findFirst({
    where: { id, organizationId, deletedAt: null },
    select: userWithPasswordSelect,
  })
}

export async function createUser(
  organizationId: string,
  data: CreateUserDto & { passwordHash: string },
): Promise<UserDto> {
  try {
    const user = await prisma.user.create({
      data: {
        organizationId,
        email: data.email,
        passwordHash: data.passwordHash,
        name: data.name ?? null,
        roleId: data.roleId,
      },
      select: userSelect,
    })
    return toDto(user)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflict('email')
    }
    throw error
  }
}

export async function updateUser(
  id: string,
  organizationId: string,
  data: UpdateUserDto,
): Promise<UserDto> {
  try {
    const user = await prisma.user.update({
      where: { id, organizationId, deletedAt: null },
      data: { ...data, version: { increment: 1 } },
      select: userSelect,
    })
    return toDto(user)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw conflict('email')
      if (error.code === 'P2025') throw notFound('User')
    }
    throw error
  }
}

export async function updatePassword(
  id: string,
  organizationId: string,
  passwordHash: string,
): Promise<void> {
  const result = await prisma.user.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { passwordHash, version: { increment: 1 } },
  })
  if (result.count === 0) {
    throw notFound('User')
  }
}

export async function softDeleteUser(id: string, organizationId: string): Promise<void> {
  const result = await prisma.user.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  })
  if (result.count === 0) {
    throw notFound('User')
  }
}

export async function findRoleById(roleId: string, organizationId: string) {
  return prisma.role.findFirst({
    where: { id: roleId, organizationId, deletedAt: null },
    select: { id: true, name: true, isSystem: true },
  })
}

export type { UserWithPasswordRecord }
