import * as controller from './auth.controller'
import {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  resetPasswordSchema,
} from './auth.schema'
import { authenticate } from '@/shared/middleware/authenticate'
import { validate } from '@/shared/middleware/validate'
import { loginLimiter } from '@/shared/middleware/rateLimiter'
import { Router } from 'express'

const router = Router()

router.post('/login', loginLimiter, validate(loginSchema, 'body'), controller.login)
router.post('/refresh', validate(refreshSchema, 'body'), controller.refresh)
router.post('/logout', authenticate, controller.logout)
router.get('/me', authenticate, controller.me)
router.post('/forgot-password', validate(forgotPasswordSchema, 'body'), controller.forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema, 'body'), controller.resetPassword)

export default router
