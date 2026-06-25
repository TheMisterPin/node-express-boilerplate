import { conflict, notFound } from '@/shared/constants/errors'
import { prisma } from '@/shared/lib/prisma'
import { paginate, asPaginateDelegate } from '@/shared/lib/paginate'
import type { PaginatedResult } from '@/shared/types/common'
import type { CreateRoleDto, RoleDto, UpdateRoleDto } from './roles.types'
import { Prisma } from '@prisma/client'

const roleSelect = {
  id: true,
  name: true,
  description: true,
  isSystem: true,
  organizationId: true,
  createdAt: true,
  updatedAt: true,
} as const

type RoleRecord = Prisma.RoleGetPayload<{ select: typeof roleSelect }>

function toDto(record: RoleRecord): RoleDto {
  return record
}

export async function listRoles(
  organizationId: string,
  page: number,
  limit: number,
): Promise<PaginatedResult<RoleDto>> {
  const result = await paginate<RoleRecord>(
    asPaginateDelegate(prisma.role),
    {
      where: { organizationId, deletedAt: null },
      orderBy: { name: 'asc' },
      select: roleSelect,
    },
    page,
    limit,
  )
  return { data: result.data.map(toDto), meta: result.meta }
}

export async function findRoleById(
  id: string,
  organizationId: string,
): Promise<RoleDto | null> {
  const role = await prisma.role.findFirst({
    where: { id, organizationId, deletedAt: null },
    select: roleSelect,
  })
  return role ? toDto(role) : null
}

export async function createRole(
  organizationId: string,
  data: CreateRoleDto,
): Promise<RoleDto> {
  try {
    const role = await prisma.role.create({
      data: {
        organizationId,
        name: data.name,
        description: data.description ?? null,
        isSystem: false,
      },
      select: roleSelect,
    })
    return toDto(role)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflict('name')
    }
    throw error
  }
}

export async function updateRole(
  id: string,
  organizationId: string,
  data: UpdateRoleDto,
): Promise<RoleDto> {
  try {
    const role = await prisma.role.update({
      where: { id, organizationId, deletedAt: null },
      data: { ...data, version: { increment: 1 } },
      select: roleSelect,
    })
    return toDto(role)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') throw conflict('name')
      if (error.code === 'P2025') throw notFound('Role')
    }
    throw error
  }
}

export async function softDeleteRole(id: string, organizationId: string): Promise<RoleDto> {
  const role = await findRoleById(id, organizationId)
  if (!role) {
    throw notFound('Role')
  }
  await prisma.role.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  })
  return role
}
