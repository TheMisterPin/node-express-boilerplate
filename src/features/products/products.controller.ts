import * as productsService from './products.service'
import type { ListProductsInput } from './products.schema'
import type { RequestHandler } from 'express'
import { sendSuccess } from '@/shared/lib/response'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query as unknown as ListProductsInput
    const result = await productsService.listProducts(query, req.user!)
    sendSuccess(res, result.data, 200, result.meta)
  } catch (error) {
    next(error)
  }
}

export const exportCsv: RequestHandler = async (req, res, next) => {
  try {
    const csv = await productsService.exportProducts(req.user!)
    sendSuccess(res, { format: 'csv', content: csv })
  } catch (error) {
    next(error)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const product = await productsService.getProductById(id, req.user!)
    sendSuccess(res, product)
  } catch (error) {
    next(error)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const product = await productsService.createProduct(req.body, req.user!)
    sendSuccess(res, product, 201)
  } catch (error) {
    next(error)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const product = await productsService.updateProduct(id, req.body, req.user!)
    sendSuccess(res, product)
  } catch (error) {
    next(error)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await productsService.removeProduct(id, req.user!)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
