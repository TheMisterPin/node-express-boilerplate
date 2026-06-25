import * as controller from './organizations.controller'
import {
  createOrganizationSchema,
  idParamSchema,
  listOrganizationsSchema,
  updateOrganizationSchema,
} from './organizations.schema'
import { authenticate } from '@/shared/middleware/authenticate'
import { authorize } from '@/shared/middleware/authorize'
import { validate } from '@/shared/middleware/validate'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('organizations', 'read'),
  validate(listOrganizationsSchema, 'query'),
  controller.list,
)

router.get(
  '/:id',
  authenticate,
  authorize('organizations', 'read'),
  validate(idParamSchema, 'params'),
  controller.getById,
)

router.post(
  '/',
  authenticate,
  authorize('organizations', 'create'),
  validate(createOrganizationSchema, 'body'),
  controller.create,
)

router.patch(
  '/:id',
  authenticate,
  authorize('organizations', 'update'),
  validate(idParamSchema, 'params'),
  validate(updateOrganizationSchema, 'body'),
  controller.update,
)

router.delete(
  '/:id',
  authenticate,
  authorize('organizations', 'delete'),
  validate(idParamSchema, 'params'),
  controller.remove,
)

export default router
