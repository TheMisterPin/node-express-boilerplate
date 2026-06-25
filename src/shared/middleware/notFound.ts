import { notFound } from '@/shared/constants/errors'
import type { RequestHandler } from 'express'

export const notFoundHandler: RequestHandler = (_req, _res, next) => {
  next(notFound('Route'))
}
