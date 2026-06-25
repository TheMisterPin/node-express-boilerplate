import { env } from '@/config/env'
import pino from 'pino'

// WHY: Pretty printing in dev only; JSON structured logs in production for log aggregators.
export const logger = pino({
  level: env.LOG_LEVEL,
  ...(env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      }
    : {}),
})
