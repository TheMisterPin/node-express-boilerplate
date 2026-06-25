import { validationError } from '@/shared/constants/errors'
import type { RequestHandler } from 'express'
import type { ZodSchema } from 'zod'

type ValidationTarget = 'body' | 'params' | 'query'

// WHY: Zod parse replaces req[target] so downstream handlers receive typed, stripped data.
export function validate(schema: ZodSchema, target: ValidationTarget): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      next(validationError(result.error.flatten().fieldErrors))
      return
    }
    req[target] = result.data
    next()
  }
}
