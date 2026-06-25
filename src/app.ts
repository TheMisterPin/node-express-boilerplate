import authRouter from '@/features/auth/auth.routes'
import categoriesRouter from '@/features/categories/categories.routes'
import healthRouter from '@/features/health/health.routes'
import organizationsRouter from '@/features/organizations/organizations.routes'
import permissionsRouter from '@/features/permissions/permissions.routes'
import productsRouter from '@/features/products/products.routes'
import rolesRouter from '@/features/roles/roles.routes'
import usersRouter from '@/features/users/users.routes'
import { logger } from '@/shared/lib/logger'
import { authLimiter, globalLimiter } from '@/shared/middleware/rateLimiter'
import { errorHandler } from '@/shared/middleware/errorHandler'
import { notFoundHandler } from '@/shared/middleware/notFound'
import { requestId } from '@/shared/middleware/requestId'
import cors from 'cors'
import express, { type Express, type Request, type Response, type NextFunction } from 'express'
import helmet from 'helmet'

// WHY: Manual request logging avoids pino-http (not in allowed dependency list).
function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()
  res.on('finish', () => {
    logger.info({
      requestId: req.id,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTimeMs: Date.now() - start,
      userId: req.user?.id,
    })
  })
  next()
}

export function createApp(): Express {
  const app = express()

  app.use(requestId)
  app.use(helmet())
  app.use(cors())
  app.use(express.json())
  app.use(globalLimiter)
  app.use(requestLogger)

  app.use('/health', healthRouter)
  app.use('/auth', authLimiter, authRouter)
  app.use('/users', usersRouter)
  app.use('/organizations', organizationsRouter)
  app.use('/roles', rolesRouter)
  app.use('/permissions', permissionsRouter)
  app.use('/products', productsRouter)
  app.use('/categories', categoriesRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
