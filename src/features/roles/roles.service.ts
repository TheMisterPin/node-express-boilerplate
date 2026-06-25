import * as rolesQueries from './roles.queries'
import type { CreateRoleDto, RoleDto, UpdateRoleDto } from './roles.types'
import { forbidden, notFound } from '@/shared/constants/errors'
import type { ITokenUser, PaginatedResult } from '@/shared/types/common'

export async function listRoles(
  query: { page: number; limit: number },
  actor: ITokenUser,
): Promise<PaginatedResult<RoleDto>> {
  return rolesQueries.listRoles(actor.organizationId, query.page, query.limit)
}

export async function getRoleById(id: string, actor: ITokenUser): Promise<RoleDto> {
  const role = await rolesQueries.findRoleById(id, actor.organizationId)
  if (!role) {
    throw notFound('Role')
  }
  return role
}

export async function createRole(dto: CreateRoleDto, actor: ITokenUser): Promise<RoleDto> {
  return rolesQueries.createRole(actor.organizationId, dto)
}

export async function updateRole(
  id: string,
  dto: UpdateRoleDto,
  actor: ITokenUser,
): Promise<RoleDto> {
  return rolesQueries.updateRole(id, actor.organizationId, dto)
}

export async function removeRole(id: string, actor: ITokenUser): Promise<void> {
  const role = await rolesQueries.findRoleById(id, actor.organizationId)
  if (!role) {
    throw notFound('Role')
  }
  if (role.isSystem) {
    throw forbidden('Cannot delete built-in system roles')
  }
  await rolesQueries.softDeleteRole(id, actor.organizationId)
}
