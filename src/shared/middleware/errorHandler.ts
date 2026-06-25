import { AppError } from '@/shared/constants/errors'
import { logger } from '@/shared/lib/logger'
import { sendError } from '@/shared/lib/response'
import type { ErrorRequestHandler } from 'express'
import { Prisma } from '@prisma/client'

// WHY: Prisma errors are mapped here (not in queries) so raw ORM codes never reach clients.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const requestId = req.id
  const userId = req.user?.id

  if (err instanceof AppError) {
    logger.warn(
      { requestId, userId, error: { message: err.message, code: err.code, stack: err.stack } },
      err.message,
    )
    sendError(res, { code: err.code, message: err.message, details: err.details }, err.statusCode)
    return
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(
        res,
        { code: 'CONFLICT', message: 'Resource already exists' },
        409,
      )
      return
    }
    if (err.code === 'P2025') {
      sendError(res, { code: 'NOT_FOUND', message: 'Resource not found' }, 404)
      return
    }
  }

  logger.error(
    {
      requestId,
      userId,
      error: {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
      },
    },
    'Unhandled error',
  )

  const message =
    process.env.NODE_ENV === 'production' ? 'Internal server error' : (err instanceof Error ? err.message : 'Unknown error')

  sendError(res, { code: 'INTERNAL_ERROR', message }, 500)
}
