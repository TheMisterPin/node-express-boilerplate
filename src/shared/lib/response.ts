import type { ApiErrorBody, PaginationMeta } from '@/shared/types/common'
import type { Response } from 'express'

// WHY: Controllers must never call res.json directly — envelope shape is enforced here only.
export function sendSuccess<T>(
  res: Response,
  data: T,
  status = 200,
  meta?: PaginationMeta,
): void {
  if (meta) {
    res.status(status).json({ success: true, data, meta })
    return
  }
  res.status(status).json({ success: true, data })
}

export function sendError(res: Response, error: ApiErrorBody, statusCode = 500): void {
  res.status(statusCode).json({
    success: false,
    error: {
      code: error.code,
      message: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    },
  })
}
