import * as permissionsService from './permissions.service'
import type { ListPermissionsInput } from './permissions.schema'
import type { RequestHandler } from 'express'
import { sendSuccess } from '@/shared/lib/response'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query as unknown as ListPermissionsInput
    const result = await permissionsService.listPermissions(query, req.user!)
    sendSuccess(res, result.data, 200, result.meta)
  } catch (error) {
    next(error)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const permission = await permissionsService.createPermission(req.body, req.user!)
    sendSuccess(res, permission, 201)
  } catch (error) {
    next(error)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await permissionsService.deletePermission(id, req.user!)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

export const matrix: RequestHandler = async (req, res, next) => {
  try {
    const data = await permissionsService.getMatrix(req.user!)
    sendSuccess(res, data)
  } catch (error) {
    next(error)
  }
}
