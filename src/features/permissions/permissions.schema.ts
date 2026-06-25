import { ACTIONS, RESOURCES } from '@/shared/constants/roles'
import type { Action, ResourceKey } from '@/shared/types/common'
import { z } from 'zod'

const resourceValues = RESOURCES as unknown as [ResourceKey, ...ResourceKey[]]
const actionValues = ACTIONS as unknown as [Action, ...Action[]]

export const createPermissionSchema = z
  .object({
    roleId: z.string().cuid(),
    resource: z.enum(resourceValues),
    action: z.enum(actionValues),
  })
  .strict()

export const listPermissionsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  roleId: z.string().cuid().optional(),
})

export const idParamSchema = z.object({
  id: z.string().cuid(),
})

export type CreatePermissionInput = z.infer<typeof createPermissionSchema>
export type ListPermissionsInput = z.infer<typeof listPermissionsSchema>
