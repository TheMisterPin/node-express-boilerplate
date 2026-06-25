import { invalidatePermissionCache } from '@/shared/middleware/authorize'
import { prisma } from '@/shared/lib/prisma'
import { paginate, asPaginateDelegate } from '@/shared/lib/paginate'
import type { PaginatedResult } from '@/shared/types/common'
import type { PermissionDto } from './permissions.types'
import { conflict, notFound } from '@/shared/constants/errors'
import { Prisma } from '@prisma/client'

const permissionSelect = {
  id: true,
  roleId: true,
  resource: true,
  action: true,
  organizationId: true,
  role: { select: { name: true } },
} as const

type PermissionRecord = Prisma.PermissionGetPayload<{ select: typeof permissionSelect }>

function toDto(record: PermissionRecord): PermissionDto {
  return {
    id: record.id,
    roleId: record.roleId,
    roleName: record.role.name,
    resource: record.resource,
    action: record.action,
    organizationId: record.organizationId,
  }
}

export async function buildPermissionCache(): Promise<Map<string, Set<string>>> {
  const permissions = await prisma.permission.findMany({
    where: { deletedAt: null },
    select: { roleId: true, resource: true, action: true },
  })

  const cache = new Map<string, Set<string>>()
  for (const perm of permissions) {
    const key = `${perm.roleId}:${perm.resource}:${perm.action}`
    cache.set(key, new Set([key]))
  }
  return cache
}

export async function listPermissions(
  organizationId: string,
  page: number,
  limit: number,
  roleId?: string,
): Promise<PaginatedResult<PermissionDto>> {
  const where = {
    organizationId,
    deletedAt: null,
    ...(roleId ? { roleId } : {}),
  }

  const result = await paginate<PermissionRecord>(
    asPaginateDelegate(prisma.permission),
    { where, orderBy: { resource: 'asc' }, select: permissionSelect },
    page,
    limit,
  )

  return {
    data: result.data.map(toDto),
    meta: result.meta,
  }
}

export async function createPermission(
  organizationId: string,
  data: { roleId: string; resource: string; action: string },
): Promise<PermissionDto> {
  try {
    const permission = await prisma.permission.create({
      data: {
        organizationId,
        roleId: data.roleId,
        resource: data.resource,
        action: data.action,
      },
      select: permissionSelect,
    })
    invalidatePermissionCache()
    return toDto(permission)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw conflict('permission')
    }
    throw error
  }
}

export async function deletePermission(id: string, organizationId: string): Promise<void> {
  const result = await prisma.permission.updateMany({
    where: { id, organizationId, deletedAt: null },
    data: { deletedAt: new Date(), version: { increment: 1 } },
  })
  if (result.count === 0) {
    throw notFound('Permission')
  }
  invalidatePermissionCache()
}

export async function getMatrix(organizationId: string) {
  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      where: { organizationId, deletedAt: null },
      select: { name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.permission.findMany({
      where: { organizationId, deletedAt: null },
      select: { role: { select: { name: true } }, resource: true, action: true },
    }),
  ])

  const grants: Record<string, Record<string, string[]>> = {}
  for (const role of roles) {
    grants[role.name] = {}
  }
  for (const perm of permissions) {
    const roleName = perm.role.name
    if (!grants[roleName]) {
      grants[roleName] = {}
    }
    if (!grants[roleName][perm.resource]) {
      grants[roleName][perm.resource] = []
    }
    grants[roleName][perm.resource]!.push(perm.action)
  }

  return { roles: roles.map((r) => r.name), grants }
}
