import type { Action, ResourceKey } from '@/shared/types/common'

export const BUILT_IN_ROLES = [
  'SUPER_ADMIN',
  'ADMIN',
  'MANAGER',
  'EMPLOYEE',
  'VIEWER',
] as const

export type BuiltInRole = (typeof BUILT_IN_ROLES)[number]

export const ACTIONS: readonly Action[] = [
  'create',
  'read',
  'update',
  'delete',
  'export',
] as const

export const RESOURCES: readonly ResourceKey[] = [
  'users',
  'roles',
  'permissions',
  'products',
  'categories',
  'organizations',
  'audit-logs',
] as const
