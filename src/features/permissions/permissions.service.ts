import * as permissionsQueries from './permissions.queries'
import type { ListPermissionsInput } from './permissions.schema'
import type { CreatePermissionDto, PermissionDto, PermissionMatrix } from './permissions.types'
import { forbidden } from '@/shared/constants/errors'
import type { ITokenUser, PaginatedResult } from '@/shared/types/common'

export async function listPermissions(
  query: ListPermissionsInput,
  actor: ITokenUser,
): Promise<PaginatedResult<PermissionDto>> {
  return permissionsQueries.listPermissions(
    actor.organizationId,
    query.page,
    query.limit,
    query.roleId,
  )
}

export async function createPermission(
  dto: CreatePermissionDto,
  actor: ITokenUser,
): Promise<PermissionDto> {
  if (actor.role !== 'SUPER_ADMIN') {
    throw forbidden('Only SUPER_ADMIN can create permissions')
  }
  return permissionsQueries.createPermission(actor.organizationId, dto)
}

export async function deletePermission(id: string, actor: ITokenUser): Promise<void> {
  if (actor.role !== 'SUPER_ADMIN') {
    throw forbidden('Only SUPER_ADMIN can delete permissions')
  }
  await permissionsQueries.deletePermission(id, actor.organizationId)
}

export async function getMatrix(actor: ITokenUser): Promise<PermissionMatrix> {
  const { roles, grants } = await permissionsQueries.getMatrix(actor.organizationId)
  return {
    roles,
    resources: ['users', 'roles', 'permissions', 'products', 'categories', 'organizations', 'audit-logs'],
    actions: ['create', 'read', 'update', 'delete', 'export'],
    grants,
  }
}
