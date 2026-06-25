import * as controller from './products.controller'
import {
  createProductSchema,
  idParamSchema,
  listProductsSchema,
  updateProductSchema,
} from './products.schema'
import { authenticate } from '@/shared/middleware/authenticate'
import { authorize } from '@/shared/middleware/authorize'
import { validate } from '@/shared/middleware/validate'
import { Router } from 'express'

const router = Router()

router.get(
  '/export',
  authenticate,
  authorize('products', 'export'),
  controller.exportCsv,
)

router.get(
  '/',
  authenticate,
  authorize('products', 'read'),
  validate(listProductsSchema, 'query'),
  controller.list,
)

router.get(
  '/:id',
  authenticate,
  authorize('products', 'read'),
  validate(idParamSchema, 'params'),
  controller.getById,
)

router.post(
  '/',
  authenticate,
  authorize('products', 'create'),
  validate(createProductSchema, 'body'),
  controller.create,
)

router.patch(
  '/:id',
  authenticate,
  authorize('products', 'update'),
  validate(idParamSchema, 'params'),
  validate(updateProductSchema, 'body'),
  controller.update,
)

router.delete(
  '/:id',
  authenticate,
  authorize('products', 'delete'),
  validate(idParamSchema, 'params'),
  controller.remove,
)

export default router
