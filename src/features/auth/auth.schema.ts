import { z } from 'zod'

export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),
  })
  .strict()

export const refreshSchema = z
  .object({
    refreshToken: z.string().uuid(),
  })
  .strict()

export const forgotPasswordSchema = z
  .object({
    email: z.string().email(),
  })
  .strict()

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8),
  })
  .strict()

export type LoginInput = z.infer<typeof loginSchema>
export type RefreshInput = z.infer<typeof refreshSchema>
