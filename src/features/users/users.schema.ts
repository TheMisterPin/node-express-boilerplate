import { z } from 'zod'

export const createUserSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().max(255).optional(),
    roleId: z.string().cuid(),
  })
  .strict()

export const updateUserSchema = z
  .object({
    email: z.string().email().optional(),
    name: z.string().max(255).optional(),
    roleId: z.string().cuid().optional(),
  })
  .strict()

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  })
  .strict()

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

export const idParamSchema = z.object({
  id: z.string().cuid(),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ListUsersInput = z.infer<typeof listUsersSchema>
