import * as organizationsService from './organizations.service'
import type { ListOrganizationsInput } from './organizations.schema'
import type { RequestHandler } from 'express'
import { sendSuccess } from '@/shared/lib/response'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query as unknown as ListOrganizationsInput
    const result = await organizationsService.listOrganizations(query)
    sendSuccess(res, result.data, 200, result.meta)
  } catch (error) {
    next(error)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const org = await organizationsService.getOrganizationById(id)
    sendSuccess(res, org)
  } catch (error) {
    next(error)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const org = await organizationsService.createOrganization(req.body)
    sendSuccess(res, org, 201)
  } catch (error) {
    next(error)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    const org = await organizationsService.updateOrganization(id, req.body)
    sendSuccess(res, org)
  } catch (error) {
    next(error)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params as { id: string }
    await organizationsService.removeOrganization(id, req.user!)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
