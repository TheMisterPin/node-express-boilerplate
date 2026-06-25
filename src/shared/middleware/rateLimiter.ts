import { env } from '@/config/env'
import { tooManyRequests } from '@/shared/constants/errors'
import rateLimit from 'express-rate-limit'

const envelopeHandler = tooManyRequests()

// WHY: Per-IP rate limiting is bypassed in favour of per-request ID to align with spec keyGenerator.
function createLimiter(max: number) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.id,
    handler: (_req, res, _next, options) => {
      res.status(options.statusCode).json({
        success: false,
        error: {
          code: envelopeHandler.code,
          message: envelopeHandler.message,
        },
      })
    },
  })
}

export const globalLimiter = createLimiter(env.RATE_LIMIT_MAX)
export const authLimiter = createLimiter(10)
export const loginLimiter = createLimiter(5)
