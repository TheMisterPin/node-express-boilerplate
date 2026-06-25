import * as controller from './roles.controller'
import { createRoleSchema, idParamSchema, listRolesSchema, updateRoleSchema } from './roles.schema'
import { authenticate } from '@/shared/middleware/authenticate'
import { authorize } from '@/shared/middleware/authorize'
import { validate } from '@/shared/middleware/validate'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('roles', 'read'),
  validate(listRolesSchema, 'query'),
  controller.list,
)

router.get(
  '/:id',
  authenticate,
  authorize('roles', 'read'),
  validate(idParamSchema, 'params'),
  controller.getById,
)

router.post(
  '/',
  authenticate,
  authorize('roles', 'create'),
  validate(createRoleSchema, 'body'),
  controller.create,
)

router.patch(
  '/:id',
  authenticate,
  authorize('roles', 'update'),
  validate(idParamSchema, 'params'),
  validate(updateRoleSchema, 'body'),
  controller.update,
)

router.delete(
  '/:id',
  authenticate,
  authorize('roles', 'delete'),
  validate(idParamSchema, 'params'),
  controller.remove,
)

export default router
