import * as controller from './users.controller'
import {
  changePasswordSchema,
  createUserSchema,
  idParamSchema,
  listUsersSchema,
  updateUserSchema,
} from './users.schema'
import { authenticate } from '@/shared/middleware/authenticate'
import { authorize } from '@/shared/middleware/authorize'
import { validate } from '@/shared/middleware/validate'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('users', 'read'),
  validate(listUsersSchema, 'query'),
  controller.list,
)

router.get(
  '/:id',
  authenticate,
  authorize('users', 'read'),
  validate(idParamSchema, 'params'),
  controller.getById,
)

router.post(
  '/',
  authenticate,
  authorize('users', 'create'),
  validate(createUserSchema, 'body'),
  controller.create,
)

router.patch(
  '/:id/password',
  authenticate,
  validate(idParamSchema, 'params'),
  validate(changePasswordSchema, 'body'),
  controller.changePassword,
)

router.patch(
  '/:id',
  authenticate,
  authorize('users', 'update'),
  validate(idParamSchema, 'params'),
  validate(updateUserSchema, 'body'),
  controller.update,
)

router.delete(
  '/:id',
  authenticate,
  authorize('users', 'delete'),
  validate(idParamSchema, 'params'),
  controller.remove,
)

export default router
