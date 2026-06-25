import * as usersQueries from './users.queries'
import type {
  ChangePasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UserDto,
} from './users.types'
import { BUILT_IN_ROLES } from '@/shared/constants/roles'
import { conflict, forbidden, notFound, unauthorized } from '@/shared/constants/errors'
import { hashPassword, comparePassword } from '@/shared/lib/password'
import type { ITokenUser, PaginatedResult } from '@/shared/types/common'

const ROLE_RANK: Record<string, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  MANAGER: 3,
  EMPLOYEE: 2,
  VIEWER: 1,
}

function getRoleRank(roleName: string): number {
  return ROLE_RANK[roleName] ?? 0
}

function assertCanAssignRole(actorRole: string, targetRoleName: string): void {
  const actorRank = getRoleRank(actorRole)
  const targetRank = getRoleRank(targetRoleName)
  if (targetRank > actorRank) {
    throw forbidden('Cannot assign a role higher than your own')
  }
}

export async function listUsers(
  query: { page: number; limit: number },
  actor: ITokenUser,
): Promise<PaginatedResult<UserDto>> {
  return usersQueries.listUsers(actor.organizationId, query.page, query.limit)
}

export async function getUserById(id: string, actor: ITokenUser): Promise<UserDto> {
  const user = await usersQueries.findUserById(id, actor.organizationId)
  if (!user) {
    throw notFound('User')
  }
  if (actor.role !== 'SUPER_ADMIN' && actor.role !== 'ADMIN' && actor.id !== id) {
    throw forbidden('Cannot view other users')
  }
  return user
}

export async function createUser(dto: CreateUserDto, actor: ITokenUser): Promise<UserDto> {
  const role = await usersQueries.findRoleById(dto.roleId, actor.organizationId)
  if (!role) {
    throw notFound('Role')
  }
  assertCanAssignRole(actor.role, role.name)

  const existing = await usersQueries.findUserByEmail(dto.email, actor.organizationId)
  if (existing) {
    throw conflict('email')
  }

  const passwordHash = await hashPassword(dto.password)
  return usersQueries.createUser(actor.organizationId, { ...dto, passwordHash })
}

export async function updateUser(
  id: string,
  dto: UpdateUserDto,
  actor: ITokenUser,
): Promise<UserDto> {
  const isSelf = actor.id === id
  const isAdmin = actor.role === 'SUPER_ADMIN' || actor.role === 'ADMIN'

  if (!isSelf && !isAdmin) {
    throw forbidden('Cannot update other users')
  }

  if (dto.roleId && isAdmin) {
    const role = await usersQueries.findRoleById(dto.roleId, actor.organizationId)
    if (!role) {
      throw notFound('Role')
    }
    assertCanAssignRole(actor.role, role.name)
  } else if (dto.roleId && !isAdmin) {
    throw forbidden('Cannot change role')
  }

  if (!isAdmin && isSelf) {
    const { roleId: _roleId, email: _email, ...selfFields } = dto
    return usersQueries.updateUser(id, actor.organizationId, selfFields)
  }

  return usersQueries.updateUser(id, actor.organizationId, dto)
}

export async function removeUser(id: string, actor: ITokenUser): Promise<void> {
  if (actor.id === id) {
    throw forbidden('Cannot delete your own account')
  }
  await usersQueries.softDeleteUser(id, actor.organizationId)
}

export async function changePassword(
  id: string,
  dto: ChangePasswordDto,
  actor: ITokenUser,
): Promise<void> {
  if (actor.id !== id) {
    throw forbidden('Can only change your own password')
  }

  const user = await usersQueries.findUserWithPassword(id, actor.organizationId)
  if (!user) {
    throw notFound('User')
  }

  const valid = await comparePassword(dto.currentPassword, user.passwordHash)
  if (!valid) {
    throw unauthorized('Current password is incorrect')
  }

  const passwordHash = await hashPassword(dto.newPassword)
  await usersQueries.updatePassword(id, actor.organizationId, passwordHash)
}

// WHY: Exported for type checking only; documents built-in role set used in escalation guard.
void BUILT_IN_ROLES
