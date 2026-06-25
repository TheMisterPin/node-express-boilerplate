import { z } from 'zod'

export const createRoleSchema = z
  .object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
  })
  .strict()

export const updateRoleSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).optional(),
  })
  .strict()

export const listRolesSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const idParamSchema = z.object({
  id: z.string().cuid(),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type ListRolesInput = z.infer<typeof listRolesSchema>
