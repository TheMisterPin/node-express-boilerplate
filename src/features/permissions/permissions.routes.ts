import * as controller from './permissions.controller'
import { createPermissionSchema, idParamSchema, listPermissionsSchema } from './permissions.schema'
import { authenticate } from '@/shared/middleware/authenticate'
import { authorize } from '@/shared/middleware/authorize'
import { validate } from '@/shared/middleware/validate'
import { Router } from 'express'

const router = Router()

router.get(
  '/matrix',
  authenticate,
  authorize('permissions', 'read'),
  controller.matrix,
)

router.get(
  '/',
  authenticate,
  authorize('permissions', 'read'),
  validate(listPermissionsSchema, 'query'),
  controller.list,
)

router.post(
  '/',
  authenticate,
  authorize('permissions', 'create'),
  validate(createPermissionSchema, 'body'),
  controller.create,
)

router.delete(
  '/:id',
  authenticate,
  authorize('permissions', 'delete'),
  validate(idParamSchema, 'params'),
  controller.remove,
)

export default router
