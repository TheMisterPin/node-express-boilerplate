import * as controller from './categories.controller'
import {
  createCategorySchema,
  idParamSchema,
  listCategoriesSchema,
  updateCategorySchema,
} from './categories.schema'
import { authenticate } from '@/shared/middleware/authenticate'
import { authorize } from '@/shared/middleware/authorize'
import { validate } from '@/shared/middleware/validate'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  authenticate,
  authorize('categories', 'read'),
  validate(listCategoriesSchema, 'query'),
  controller.list,
)

router.get(
  '/:id',
  authenticate,
  authorize('categories', 'read'),
  validate(idParamSchema, 'params'),
  controller.getById,
)

router.post(
  '/',
  authenticate,
  authorize('categories', 'create'),
  validate(createCategorySchema, 'body'),
  controller.create,
)

router.patch(
  '/:id',
  authenticate,
  authorize('categories', 'update'),
  validate(idParamSchema, 'params'),
  validate(updateCategorySchema, 'body'),
  controller.update,
)

router.delete(
  '/:id',
  authenticate,
  authorize('categories', 'delete'),
  validate(idParamSchema, 'params'),
  controller.remove,
)

export default router
