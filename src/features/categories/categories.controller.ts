import * as categoriesService from './categories.service'
import type { ListCategoriesInput } from './categories.schema'
import type { RequestHandler } from 'express'
import { sendSuccess } from '@/shared/lib/response'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query as unknown as ListCategoriesInput
    const result = await categoriesService.listCategories(query, req.user!)
    sendSuccess(res, result.data, 200, result.meta)
  } catch (error) {
    next(error)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const category = await categoriesService.getCategoryById(id, req.user!)
    sendSuccess(res, category)
  } catch (error) {
    next(error)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const category = await categoriesService.createCategory(req.body, req.user!)
    sendSuccess(res, category, 201)
  } catch (error) {
    next(error)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const category = await categoriesService.updateCategory(id, req.body, req.user!)
    sendSuccess(res, category)
  } catch (error) {
    next(error)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await categoriesService.removeCategory(id, req.user!)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
