import * as rolesService from './roles.service'
import type { ListRolesInput } from './roles.schema'
import type { RequestHandler } from 'express'
import { sendSuccess } from '@/shared/lib/response'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query as unknown as ListRolesInput
    const result = await rolesService.listRoles(query, req.user!)
    sendSuccess(res, result.data, 200, result.meta)
  } catch (error) {
    next(error)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const role = await rolesService.getRoleById(id, req.user!)
    sendSuccess(res, role)
  } catch (error) {
    next(error)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const role = await rolesService.createRole(req.body, req.user!)
    sendSuccess(res, role, 201)
  } catch (error) {
    next(error)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const role = await rolesService.updateRole(id, req.body, req.user!)
    sendSuccess(res, role)
  } catch (error) {
    next(error)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await rolesService.removeRole(id, req.user!)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
