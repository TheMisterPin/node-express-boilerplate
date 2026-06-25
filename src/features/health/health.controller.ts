import * as healthQueries from './health.queries'
import type { RequestHandler } from 'express'
import { sendSuccess } from '@/shared/lib/response'

const startTime = Date.now()

export const check: RequestHandler = async (_req, res, next) => {
  try {
    let dbStatus: 'up' | 'down' = 'up'
    try {
      await healthQueries.pingDatabase()
    } catch {
      dbStatus = 'down'
    }

    sendSuccess(res, {
      status: dbStatus === 'up' ? 'ok' : 'degraded',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      db: dbStatus,
    })
  } catch (error) {
    next(error)
  }
}
